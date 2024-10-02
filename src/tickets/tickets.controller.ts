import {
  Controller,
  Post,
  Body,
  Get,
  ParseArrayPipe,
  Query,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { GetTicketsDto } from './dto/get-tickets.dto';
import { TicketResponse } from './interfaces/ticket-interface';
import { Ticket } from './tickets.model';

@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post()
  createTickets(
    @Body(
      new ParseArrayPipe({
        items: CreateTicketDto,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    createTicketDtos: CreateTicketDto[],
  ): Promise<Ticket[]> {
    return this.ticketsService.createTickets(createTicketDtos);
  }

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
