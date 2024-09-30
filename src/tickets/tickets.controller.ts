import { Controller, Post, Body, ParseArrayPipe } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Ticket as TicketInterface } from './interfaces/ticket-interface';

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
  ): Promise<TicketInterface[]> {
    return this.ticketsService.createTickets(createTicketDtos);
  }
}
