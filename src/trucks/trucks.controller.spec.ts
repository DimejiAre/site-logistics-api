import { Test, TestingModule } from '@nestjs/testing';
import { TrucksController } from './trucks.controller';
import { TicketsService } from '../tickets/tickets.service';
import { CreateTicketDto } from '../tickets/dto/create-ticket.dto';
import { CreateTicketsResponse } from '../tickets/dto/response.dto';

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
    let createTicketDtos: CreateTicketDto[];
    let createdTickets: CreateTicketsResponse;
    let result: CreateTicketsResponse;

    beforeEach(async () => {
      createTicketDtos = [
        {
          dispatchTime: new Date().toISOString(),
        },
      ];
      createdTickets = {
        createdCount: 1,
        failedCount: 0,
        failedTickets: [],
      } as CreateTicketsResponse;

      mockTicketsService.createTickets.mockResolvedValue(createdTickets);
      result = await controller.createTickets(truckId, createTicketDtos);
    });

    it('should call TicketsService.createTickets with correct arguments', async () => {
      expect(service.createTickets).toHaveBeenCalledWith(
        truckId,
        createTicketDtos,
      );
    });

    it('should return the correct output from TicketsService.createTickets', async () => {
      expect(result).toEqual(createdTickets);
    });
  });
});
