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
    @Query('siteIds') siteIds: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('page') page = '1',
    @Query('limit') limit = '100',
  ): Promise<{ data: TicketResponse[]; count: number; totalPages: number }> {
    const siteIdArray = siteIds ? siteIds.split(',').map(Number) : [];
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    return this.ticketsService.findTickets(
      siteIdArray,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      parsedPage,
      parsedLimit,
    );
  }
}
