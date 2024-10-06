import { CreateTicketDto } from './create-ticket.dto';

class Ticket {
  id: number;
  ticketNumber: number;
  dispatchTime: Date;
  material: string;
  truckLicense: string;
  siteName: string;
  siteId: number;
}
export class CreateTicketsResponse {
  createdCount: number;
  failedCount: number;
  failedTickets: FailedTicket[];
}

export class FailedTicket {
  dto: CreateTicketDto;
  reason: string;
}

export class TicketResponse {
  data: Ticket[];
  limit: number;
  totalPages: number;
  page: number;
  totalItems: number;
}
