import {
  Controller,
  Post,
  Body,
  Param,
  ParseArrayPipe,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { TicketsService } from '../tickets/tickets.service';
import { CreateTicketDto } from '../tickets/dto/create-ticket.dto';
import { CreateTicketsResponse } from '../tickets/dto/response.dto';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@Controller('trucks')
export class TrucksController {
  constructor(private ticketService: TicketsService) {}

  @Post(':id/tickets/bulk_create')
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
  async createTickets(
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
    if (!createTicketDtos || createTicketDtos.length === 0) {
      throw new BadRequestException('Request body cannot be an empty array');
    }

    const result = await this.ticketService.createTickets(
      truckId,
      createTicketDtos,
    );

    if (result.createdCount === createTicketDtos.length) {
      return result;
    } else if (result.createdCount > 0 && result.failedCount > 0) {
      throw new HttpException(result, HttpStatus.PARTIAL_CONTENT);
    } else {
      throw new HttpException(result, HttpStatus.BAD_REQUEST);
    }
  }
}
