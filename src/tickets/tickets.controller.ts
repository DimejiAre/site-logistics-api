import { Controller, Get, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { GetTicketsDto } from './dto/get-tickets.dto';
import { TicketResponse } from './interfaces/ticket-interface';
@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get()
  getTickets(
    @Query()
    getTicketsDto: GetTicketsDto,
  ): Promise<{ data: TicketResponse[]; count: number; totalPages: number }> {
    const { siteIds, startDate, endDate, page, limit } = getTicketsDto;
    return this.ticketsService.findTickets(
      siteIds,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      page,
      limit,
    );
  }
}
