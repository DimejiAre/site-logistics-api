import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketResponse } from './interfaces/ticket-interface';
import { Ticket } from './tickets.model';

describe('TicketsController', () => {
  let controller: TicketsController;
  let service: TicketsService;

  const mockTicketsService = {
    createTickets: jest.fn(),
    findTickets: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: mockTicketsService,
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
    service = module.get<TicketsService>(TicketsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTickets', () => {
    let createTicketDtos: CreateTicketDto[];
    let createdTickets: Ticket[];
    let result: Ticket[];

    beforeEach(async () => {
      const dispatchTime = new Date().toISOString();
      createTicketDtos = [
        {
          truckId: 1,
          dispatchTime: new Date().toISOString(),
        },
      ];
      createdTickets = [
        {
          id: 1,
          truckId: 1,
          material: 'soil',
          dispatchTime: new Date(dispatchTime),
          siteId: 1,
          ticketNumber: 1,
        } as Ticket,
      ];

      mockTicketsService.createTickets.mockResolvedValue(createdTickets);
      result = await controller.createTickets(createTicketDtos);
    });

    it('should call TicketsService.createTickets with correct arguments', async () => {
      expect(service.createTickets).toHaveBeenCalledWith(createTicketDtos);
    });

    it('should return the correct output from TicketsService.createTickets', async () => {
      expect(result).toEqual(createdTickets);
    });
  });

  describe('getTickets', () => {
    let result: { data: TicketResponse[]; count: number; totalPages: number };
    let mockResponse: {
      data: TicketResponse[];
      count: number;
      totalPages: number;
    };
    let startDate: string;
    let endDate: string;

    beforeEach(async () => {
      const siteIds: string = '1,2';
      startDate = '2024-09-30T17:00:00.000Z';
      endDate = '2024-09-30T18:00:00.000Z';
      const page: string = '1';
      const limit: string = '10';

      mockResponse = {
        data: [
          {
            id: 1,
            ticketNumber: 123,
            dispatchTime: new Date(),
            material: 'soil',
            siteName: 'ZILCH',
            siteId: 1,
            truckLicense: 'kdd7yh',
          } as TicketResponse,
        ],
        count: 1,
        totalPages: 1,
      };

      mockTicketsService.findTickets.mockResolvedValue(mockResponse);

      result = await controller.getTickets(
        siteIds,
        startDate,
        endDate,
        page,
        limit,
      );
    });

    it('should call TicketsService.findTickets with correct arguments in the right format', async () => {
      expect(service.findTickets).toHaveBeenCalledWith(
        [1, 2],
        new Date(startDate),
        new Date(endDate),
        1,
        10,
      );
    });

    it('should return the correct output from TicketsService.findTickets', async () => {
      expect(result).toEqual(mockResponse);
    });
  });
});
