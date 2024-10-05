import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { getModelToken } from '@nestjs/sequelize';
import { Site } from '../sites/sites.model';
import { Truck } from '../trucks/trucks.model';
import { Ticket } from './tickets.model';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { BadRequestException, Logger } from '@nestjs/common';
import { TicketResponse, CreateTicketsResponse } from './dto/response.dto';

describe('TicketsService', () => {
  let service: TicketsService;
  let siteModelMock: any;
  let truckModelMock: any;
  let ticketModelMock: any;
  let sequelizeMock: any;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

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
      bulkCreate: jest.fn(),
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
    const validCreateTicketDto: CreateTicketDto[] = [{ dispatchTime }];
    const ticket: Ticket = {
      id: 1,
      truckId: 1,
      material: 'soil',
      dispatchTime: new Date(dispatchTime),
      siteId: 1,
      ticketNumber: 1,
    } as Ticket;
    const ticketCreationResponse: CreateTicketsResponse = {
      createdCount: 1,
      failedCount: 0,
      failedTickets: [],
    };

    it('should create tickets successfully with valid inputs', async () => {
      truckModelMock.findByPk.mockResolvedValueOnce({ siteId: 1 });
      ticketModelMock.findOne.mockResolvedValueOnce(null);
      ticketModelMock.bulkCreate.mockResolvedValueOnce([ticket]);

      const result = await service.createTickets(truckId, validCreateTicketDto);

      expect(result).toEqual(ticketCreationResponse);
      expect(ticketModelMock.bulkCreate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            ticketNumber: 1,
            siteId: 1,
            dispatchTime: new Date(dispatchTime),
            truckId,
          }),
        ]),
        expect.anything(),
      );
    });

    it('should fail with reason if invalid dispatchTime', async () => {
      const invalidDto = [{ dispatchTime: 'invalid-date' }];

      truckModelMock.findByPk.mockResolvedValueOnce({ siteId: 1 });

      const result = await service.createTickets(truckId, invalidDto);

      expect(result).toEqual({
        createdCount: 0,
        failedCount: 1,
        failedTickets: [
          {
            dto: { dispatchTime: 'invalid-date' },
            reason: 'Invalid dispatchTime date.',
          },
        ],
      });
    });

    it('should fail with reason if dispatchTime is in the future', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const invalidDto = [{ dispatchTime: tomorrow.toISOString() }];
      truckModelMock.findByPk.mockResolvedValueOnce({ siteId: 1 });

      const result = await service.createTickets(truckId, invalidDto);

      expect(result).toEqual({
        createdCount: 0,
        failedCount: 1,
        failedTickets: [
          {
            dto: { dispatchTime: tomorrow.toISOString() },
            reason: 'Dispatch time cannot be in the future.',
          },
        ],
      });
    });

    it('should throw BadRequestException if truck does not exist', async () => {
      truckModelMock.findByPk.mockResolvedValueOnce(null);

      await expect(
        service.createTickets(truckId, validCreateTicketDto),
      ).rejects.toThrow(
        new BadRequestException('Truck with ID 1 does not exist.'),
      );
    });

    it('should fail with reason if conflicting ticket exists', async () => {
      truckModelMock.findByPk.mockResolvedValueOnce({ siteId: 1 });
      ticketModelMock.findOne.mockReturnValue({ id: 1 });

      const result = await service.createTickets(truckId, validCreateTicketDto);

      expect(result).toEqual({
        createdCount: 0,
        failedCount: 1,
        failedTickets: [
          {
            dto: validCreateTicketDto[0],
            reason:
              'There must be at least 30 minutes between dispatch times for the same truck.',
          },
        ],
      });
    });

    it('should throw error and rollback transaction if an error occurs', async () => {
      truckModelMock.findByPk.mockResolvedValueOnce({ siteId: 1 });
      ticketModelMock.findOne.mockRejectedValueOnce(new Error());

      await expect(
        service.createTickets(truckId, validCreateTicketDto),
      ).rejects.toThrow(Error);

      expect(sequelizeMock.transaction().rollback).toHaveBeenCalled();
    });

    it('should return correct failed count if multiple invalid tickets', async () => {
      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + 2);
      const invalidDtos = [
        { dispatchTime: 'invalid-date' },
        { dispatchTime: futureTime.toISOString() },
      ];

      truckModelMock.findByPk.mockResolvedValueOnce({ siteId: 1 });

      const result = await service.createTickets(truckId, invalidDtos);

      expect(result).toEqual({
        createdCount: 0,
        failedCount: 2,
        failedTickets: [
          {
            dto: { dispatchTime: 'invalid-date' },
            reason: 'Invalid dispatchTime date.',
          },
          {
            dto: { dispatchTime: futureTime.toISOString() },
            reason: 'Dispatch time cannot be in the future.',
          },
        ],
      });
    });
  });

  describe('getTickets', () => {
    const dispatchTime = new Date();
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
          siteId: 1,
          siteName: 'ZILCH',
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

      const result = await service.getTickets(
        [1],
        new Date(),
        new Date(),
        1,
        10,
      );

      expect(result).toEqual(mockResponse);
    });

    it('should include siteIds in query when provided', async () => {
      const startDate = new Date();
      const endDate = new Date();

      ticketModelMock.findAndCountAll.mockResolvedValueOnce({
        rows: mockTickets,
        count: 1,
      });

      await service.getTickets([1], startDate, endDate, 1, 10);

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

      const result = await service.getTickets(
        [],
        new Date(),
        new Date(),
        2,
        10,
      );

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

      const result = await service.getTickets([], new Date(), new Date());

      expect(result.data).toHaveLength(0);
      expect(result.count).toBe(0);
    });

    it('should handle errors and throw them', async () => {
      ticketModelMock.findAndCountAll.mockRejectedValueOnce(new Error());

      await expect(
        service.getTickets([], new Date(), new Date()),
      ).rejects.toThrow(Error);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Failed to fetch tickets',
        expect.any(Error),
      );
    });
  });
});
