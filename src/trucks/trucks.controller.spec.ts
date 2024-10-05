import { Test, TestingModule } from '@nestjs/testing';
import { TrucksController } from './trucks.controller';
import { TicketsService } from '../tickets/tickets.service';
import { CreateTicketDto } from '../tickets/dto/create-ticket.dto';
import { CreateTicketsResponse } from '../tickets/dto/response.dto';
import { HttpException, HttpStatus, BadRequestException } from '@nestjs/common';

describe('TrucksController', () => {
  let controller: TrucksController;
  let service: TicketsService;

  const mockTicketsService = {
    createTickets: jest.fn(),
    findTickets: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrucksController],
      providers: [
        {
          provide: TicketsService,
          useValue: mockTicketsService,
        },
      ],
    }).compile();

    controller = module.get<TrucksController>(TrucksController);
    service = module.get<TicketsService>(TicketsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTickets', () => {
    const truckId = 1;
    let createValidTicketDtos: CreateTicketDto[];
    let createdTickets: CreateTicketsResponse;
    let result: CreateTicketsResponse;

    beforeEach(async () => {
      const dispatchTime = new Date().toISOString();

      createValidTicketDtos = [
        {
          dispatchTime: dispatchTime,
        },
      ];

      createdTickets = {
        createdCount: 1,
        failedCount: 0,
        failedTickets: [],
      };
    });

    it('should call TicketsService.createTickets with correct arguments', async () => {
      mockTicketsService.createTickets.mockResolvedValue(createdTickets);
      await controller.createTickets(truckId, createValidTicketDtos);

      expect(service.createTickets).toHaveBeenCalledWith(
        truckId,
        createValidTicketDtos,
      );
    });

    it('should return the correct output from TicketsService.createTickets', async () => {
      mockTicketsService.createTickets.mockResolvedValue(createdTickets);
      result = await controller.createTickets(truckId, createValidTicketDtos);

      expect(result).toEqual(createdTickets);
    });

    it('should handle partial success', async () => {
      const multipleDtos: CreateTicketDto[] = [
        { dispatchTime: new Date().toISOString() },
        { dispatchTime: new Date().toISOString() },
      ];
      const partialResponse: CreateTicketsResponse = {
        createdCount: 1,
        failedCount: 1,
        failedTickets: [
          {
            dto: multipleDtos[1],
            reason:
              'There must be at least 30 minutes between dispatch times for the same truck.',
          },
        ],
      };

      mockTicketsService.createTickets.mockResolvedValue(partialResponse);

      await expect(
        controller.createTickets(truckId, multipleDtos),
      ).rejects.toThrow(HttpException);

      expect(
        controller.createTickets(truckId, multipleDtos),
      ).rejects.toMatchObject({
        status: HttpStatus.PARTIAL_CONTENT,
        response: partialResponse,
      });
    });

    it('should throw HttpException with BAD_REQUEST if all tickets fail', async () => {
      const failedResponse: CreateTicketsResponse = {
        createdCount: 0,
        failedCount: 1,
        failedTickets: [
          { dto: createValidTicketDtos[0], reason: 'Invalid input' },
        ],
      };

      const createInvalidTicketDtos: CreateTicketDto[] = [
        {
          dispatchTime: 'invalid date',
        },
      ];

      mockTicketsService.createTickets.mockResolvedValue(failedResponse);

      await expect(
        controller.createTickets(truckId, createInvalidTicketDtos),
      ).rejects.toThrow(HttpException);

      await expect(
        controller.createTickets(truckId, createInvalidTicketDtos),
      ).rejects.toMatchObject({
        response: failedResponse,
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw BadRequestException if no tickets are provided', async () => {
      const emptyDtos: CreateTicketDto[] = [];

      await expect(
        controller.createTickets(truckId, emptyDtos),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw HttpException if service throws an unexpected error', async () => {
      const error = new Error('Unexpected error');
      mockTicketsService.createTickets.mockRejectedValueOnce(error);

      await expect(
        controller.createTickets(truckId, createValidTicketDtos),
      ).rejects.toThrow(error);
    });
  });
});
