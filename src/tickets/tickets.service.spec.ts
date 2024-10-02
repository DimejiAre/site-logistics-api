import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { getModelToken } from '@nestjs/sequelize';
import { Site } from '../sites/sites.model';
import { Truck } from '../trucks/trucks.model';
import { Ticket } from './tickets.model';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { BadRequestException } from '@nestjs/common';
import { TicketResponse } from './interfaces/ticket-interface';

describe('TicketsService', () => {
  let service: TicketsService;
  let siteModelMock: any;
  let truckModelMock: any;
  let ticketModelMock: any;
  let sequelizeMock: any;

  beforeEach(async () => {
    siteModelMock = {
      findByPk: jest.fn(),
    };

    truckModelMock = {
      findByPk: jest.fn(),
    };

    ticketModelMock = {
      findByPk: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      findAndCountAll: jest.fn(),
    };

    sequelizeMock = {
      transaction: jest.fn().mockReturnValue({
        commit: jest.fn(),
        rollback: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: getModelToken(Site),
          useValue: siteModelMock,
        },
        {
          provide: getModelToken(Truck),
          useValue: truckModelMock,
        },
        {
          provide: getModelToken(Ticket),
          useValue: ticketModelMock,
        },
        {
          provide: Sequelize,
          useValue: sequelizeMock,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  describe('createTickets', () => {
    const dispatchTime = new Date().toISOString();
    const truckId = 1;
    const validCreateTicketDto: CreateTicketDto[] = [{ truckId, dispatchTime }];
    const ticket: Ticket = {
      id: 1,
      truckId: 1,
      material: 'soil',
      dispatchTime: new Date(dispatchTime),
      siteId: 1,
      ticketNumber: 1,
    } as Ticket;

    it('should create tickets successfully with valid inputs', async () => {
      truckModelMock.findByPk.mockResolvedValueOnce({ siteId: 1 });
      ticketModelMock.findOne.mockResolvedValueOnce(null);
      ticketModelMock.create.mockResolvedValueOnce(ticket);

      const result = await service.createTickets(validCreateTicketDto);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(ticket);
      expect(ticketModelMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ticketNumber: 1,
          siteId: 1,
          dispatchTime: new Date(dispatchTime),
          truckId,
        }),
        expect.anything(),
      );
    });

    it('should throw BadRequestException for invalid dispatchTime', async () => {
      const invalidDto = [{ truckId: 1, dispatchTime: 'invalid-date' }];

      await expect(service.createTickets(invalidDto)).rejects.toThrow(
        new BadRequestException('Invalid dispatchTime date.'),
      );
    });

    it('should throw BadRequestException for dispatchTime not on the current day', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const invalidDto = [{ truckId: 1, dispatchTime: tomorrow.toISOString() }];

      await expect(service.createTickets(invalidDto)).rejects.toThrow(
        new BadRequestException('Dispatched time must be on the current day.'),
      );
    });

    it('should throw BadRequestException if truck does not exist', async () => {
      truckModelMock.findByPk.mockResolvedValueOnce(null);

      await expect(service.createTickets(validCreateTicketDto)).rejects.toThrow(
        new BadRequestException('Truck with ID 1 does not exist.'),
      );
    });

    it('should throw BadRequestException if conflicting ticket exists', async () => {
      truckModelMock.findByPk.mockResolvedValueOnce({ siteId: 1 });
      ticketModelMock.findOne.mockResolvedValueOnce({ id: 1 });

      await expect(service.createTickets(validCreateTicketDto)).rejects.toThrow(
        new BadRequestException(
          'There must be at least 15 minutes between dispatch times for the same truck.',
        ),
      );
    });

    it('should rollback transaction if an error occurs', async () => {
      truckModelMock.findByPk.mockResolvedValueOnce({ siteId: 1 });
      ticketModelMock.findOne.mockRejectedValueOnce(new Error());

      await expect(service.createTickets(validCreateTicketDto)).rejects.toThrow(
        Error,
      );

      expect(sequelizeMock.transaction().rollback).toHaveBeenCalled();
    });
  });

  describe('findTickets', () => {
    const dispatchTime = new Date('2024-09-30T18:00:00.000Z');
    const mockTickets = [
      {
        id: 1,
        ticketNumber: 1,
        dispatchTime,
        material: 'soil',
        siteId: 1,
        site: { name: 'ZILCH' },
        truck: { license: 'kdd7yh' },
      },
    ];
    const mockResponse = {
      data: [
        {
          id: 1,
          ticketNumber: 1,
          dispatchTime: dispatchTime,
          material: 'soil',
          siteName: 'ZILCH',
          siteId: 1,
          truckLicense: 'kdd7yh',
        } as TicketResponse,
      ],
      count: 1,
      totalPages: 1,
    };

    it('should find and return tickets', async () => {
      ticketModelMock.findAndCountAll.mockResolvedValueOnce({
        rows: mockTickets,
        count: 1,
      });

      const result = await service.findTickets(
        [1],
        new Date('2024-09-30T17:00:00.000Z'),
        new Date('2024-09-30T19:00:00.000Z'),
        1,
        10,
      );

      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should include siteIds in query when provided', async () => {
      const startDate = new Date();
      const endDate = new Date();

      ticketModelMock.findAndCountAll.mockResolvedValueOnce({
        rows: mockTickets,
        count: 1,
      });

      await service.findTickets([1], startDate, endDate, 1, 10);

      expect(ticketModelMock.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            siteId: [1],
            dispatchTime: {
              [Op.between]: [startDate, endDate],
            },
          },
        }),
      );
    });

    it('should calculate pagination correctly', async () => {
      ticketModelMock.findAndCountAll.mockResolvedValueOnce({
        rows: mockTickets,
        count: 100,
      });

      const result = await service.findTickets(
        [],
        new Date(),
        new Date(),
        2,
        10,
      );

      expect(result.data).toHaveLength(1);
      expect(result.totalPages).toBe(10);
      expect(ticketModelMock.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 10,
        }),
      );
    });

    it('should return empty data if no tickets found', async () => {
      ticketModelMock.findAndCountAll.mockResolvedValueOnce({
        rows: [],
        count: 0,
      });

      const result = await service.findTickets([], new Date(), new Date());

      expect(result.data).toHaveLength(0);
      expect(result.count).toBe(0);
    });
  });
});
