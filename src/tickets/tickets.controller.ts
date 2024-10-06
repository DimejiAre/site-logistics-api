import { Controller, Get, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { GetTicketsDto } from './dto/get-tickets.dto';
import { TicketResponse } from './dto/response.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Fetches tickets' })
  @ApiResponse({
    status: 200,
    description: 'Tickets fetched successfully',
    type: TicketResponse,
  })
  getTickets(
    @Query()
    getTicketsDto: GetTicketsDto,
  ): Promise<TicketResponse> {
    const { siteIds, startDate, endDate, page, limit } = getTicketsDto;
    return this.ticketsService.getTickets(
      siteIds,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      page,
      limit,
    );
  }
}
