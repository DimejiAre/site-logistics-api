import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { GetTicketsDto } from './dto/get-tickets.dto';
import { TicketResponse } from './dto/response.dto';

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

  describe('getTickets', () => {
    let result: { data: TicketResponse[]; count: number; totalPages: number };
    let mockResponse: {
      data: TicketResponse[];
      count: number;
      totalPages: number;
    };
    let getTicketsDto: GetTicketsDto;
    let startDate: string;
    let endDate: string;

    beforeEach(async () => {
      startDate = new Date().toISOString();
      endDate = new Date().toISOString();

      getTicketsDto = {
        siteIds: [1, 2],
        startDate,
        endDate,
        page: 1,
        limit: 10,
      };

      mockResponse = {
        data: [
          {
            id: 1,
            ticketNumber: 123,
            dispatchTime: new Date(),
            material: 'soil',
            siteName: 'ZILCH',
            truckLicense: 'kdd7yh',
          } as TicketResponse,
        ],
        count: 1,
        totalPages: 1,
      };

      mockTicketsService.findTickets.mockResolvedValue(mockResponse);

      result = await controller.getTickets(getTicketsDto);
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

    it('should throw HttpException if service throws an unexpected error', async () => {
      const error = new Error('Unexpected error');
      mockTicketsService.findTickets.mockRejectedValueOnce(error);

      await expect(controller.getTickets({})).rejects.toThrow(error);
    });
  });
});
