import { Controller, Post, Body, Param, ParseArrayPipe } from '@nestjs/common';
import { TicketsService } from '../tickets/tickets.service';
import { CreateTicketDto } from '../tickets/dto/create-ticket.dto';
import { CreateTicketsResponse } from '../tickets/dto/response.dto';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@Controller('trucks')
export class TrucksController {
  constructor(private ticketService: TicketsService) {}

  @Post(':id/tickets')
  @ApiOperation({ summary: 'Bulk creates tickets for a specified truck' })
  @ApiResponse({
    status: 201,
    description: 'All tickets created successfully or partial success',
    type: CreateTicketsResponse,
  })
  @ApiResponse({
    status: 206,
    description: 'Some tickets created successfully, some failed',
    type: CreateTicketsResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'All tickets creation failed',
    type: CreateTicketsResponse,
  })
  @ApiBody({ type: [CreateTicketDto] })
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
