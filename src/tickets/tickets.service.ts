import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Site } from '../sites/sites.model';
import { Truck } from '../trucks/trucks.model';
import { Ticket } from './tickets.model';
import { TicketResponse } from './interfaces/ticket-interface';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);
  private readonly minDispatchIntervalMinutes: number;

  constructor(
    @InjectModel(Site) private siteModel: typeof Site,
    @InjectModel(Truck) private truckModel: typeof Truck,
    @InjectModel(Ticket) private ticketModel: typeof Ticket,
    private sequelize: Sequelize,
  ) {
    this.minDispatchIntervalMinutes =
      parseInt(process.env.MIN_DISPATCH_INTERVAL_MINUTES, 10) || 15;
  }

  async createTickets(createTicketsDto: CreateTicketDto[]): Promise<Ticket[]> {
    const transaction = await this.sequelize.transaction();

    try {
      const tickets: Ticket[] = [];

      for (const dto of createTicketsDto) {
        const dispatchTime = new Date(dto.dispatchTime);

        if (isNaN(dispatchTime.getTime())) {
          throw new BadRequestException('Invalid dispatchTime date.');
        }

        const now = new Date();

        if (
          dispatchTime.getFullYear() !== now.getFullYear() ||
          dispatchTime.getMonth() !== now.getMonth() ||
          dispatchTime.getDate() !== now.getDate()
        ) {
          throw new BadRequestException(
            'Dispatched time must be on the current day.',
          );
        }

        const truck = await this.truckModel.findByPk(dto.truckId, {
          transaction,
        });

        if (!truck) {
          throw new BadRequestException(
            `Truck with ID ${dto.truckId} does not exist.`,
          );
        }

        const siteId = truck.siteId;

        const minIntervalMs = this.minDispatchIntervalMinutes * 60 * 1000;
        const minIntervalDate = new Date(
          dispatchTime.getTime() - minIntervalMs,
        );
        const maxIntervalDate = new Date(
          dispatchTime.getTime() + minIntervalMs,
        );

        const conflictingTicket = await this.ticketModel.findOne({
          where: {
            truckId: dto.truckId,
            dispatchTime: {
              [Op.between]: [minIntervalDate, maxIntervalDate],
            },
          },
          transaction,
        });

        if (conflictingTicket) {
          throw new BadRequestException(
            `There must be at least ${this.minDispatchIntervalMinutes} minutes between dispatch times for the same truck.`,
          );
        }

        const lastTicket = await this.ticketModel.findOne({
          where: { siteId: siteId },
          order: [['ticketNumber', 'DESC']],
          transaction,
        });

        const ticketNumber = lastTicket ? lastTicket.ticketNumber + 1 : 1;

        const ticket = await this.ticketModel.create(
          {
            ticketNumber,
            material: dto.material,
            dispatchTime,
            truckId: dto.truckId,
            siteId: siteId,
          },
          { transaction },
        );

        tickets.push(ticket);
      }

      await transaction.commit();
      return tickets;
    } catch (error) {
      await transaction.rollback();
      this.logger.error('Failed to create tickets', error);
      if (!(error instanceof BadRequestException)) {
        throw new InternalServerErrorException(
          'Failed to create tickets. Please try again later.',
          error,
        );
      }
      throw error;
    }
  }

  async findTickets(
    siteIds?: number[],
    startDate?: Date,
    endDate?: Date,
    page = 1,
    limit = 100,
  ): Promise<{ data: TicketResponse[]; count: number; totalPages: number }> {
    try {
      const offset = (page - 1) * limit;

      const where: any = {};

      if (siteIds && siteIds.length > 0) {
        where.siteId = siteIds;
      }

      if (startDate && endDate) {
        where.dispatchTime = {
          [Op.between]: [startDate, endDate],
        };
      }

      const { rows, count } = await this.ticketModel.findAndCountAll({
        where,
        include: [
          { model: Site, attributes: ['name'] },
          { model: Truck, attributes: ['license'] },
        ],
        limit,
        offset,
        order: [['dispatchTime', 'DESC']],
      });

      const transformedRows = rows.map((ticket) => ({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        dispatchTime: ticket.dispatchTime,
        material: ticket.material,
        siteName: ticket.site?.name,
        truckLicense: ticket.truck?.license,
      }));

      const totalPages = Math.ceil(count / limit);

      return { data: transformedRows, count, totalPages };
    } catch (error) {
      this.logger.error('Failed to fetch tickets', error);
      throw new InternalServerErrorException(
        'Failed to fetch tickets. Please try again later.',
        error,
      );
    }
  }
}
