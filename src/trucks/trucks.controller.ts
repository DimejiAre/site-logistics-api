import { Controller, Post, Body, Param, ParseArrayPipe } from '@nestjs/common';
import { TicketsService } from '../tickets/tickets.service';
import { CreateTicketDto } from '../tickets/dto/create-ticket.dto';
import { CreateTicketsResponse } from '../tickets/interfaces/ticket-interface';

@Controller('trucks')
export class TrucksController {
  constructor(private ticketService: TicketsService) {}

  @Post(':id/tickets')
  createTickets(
    @Param('id') truckId: number,
    @Body(
      new ParseArrayPipe({
        items: CreateTicketDto,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    createTicketDtos: CreateTicketDto[],
  ): Promise<CreateTicketsResponse> {
    return this.ticketService.createTickets(truckId, createTicketDtos);
  }
}
