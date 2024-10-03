import { CreateTicketDto } from '../dto/create-ticket.dto';

export interface TicketResponse {
  id: number;
  ticketNumber: number;
  dispatchTime: Date;
  material: string;
  truckLicense: string;
  siteName: string;
  siteId: number;
}
export interface CreateTicketsResponse {
  createdCount: number;
  failedCount: number;
  failedTickets: FailedTicket[];
}

export interface FailedTicket {
  dto: CreateTicketDto;
  reason: string;
}
