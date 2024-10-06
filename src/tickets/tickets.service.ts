import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Site } from '../sites/sites.model';
import { Truck } from '../trucks/trucks.model';
import { Ticket } from './tickets.model';
import {
  TicketResponse,
  CreateTicketsResponse,
  FailedTicket,
} from './dto/response.dto';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);
  private readonly minDispatchIntervalMinutes: number;

  constructor(
    @InjectModel(Truck) private truckModel: typeof Truck,
    @InjectModel(Ticket) private ticketModel: typeof Ticket,
    private sequelize: Sequelize,
  ) {
    this.minDispatchIntervalMinutes = parseInt(
      process.env.MIN_DISPATCH_INTERVAL_MINUTES || '30',
      10,
    );
  }

  async createTickets(
    truckId: number,
    createTicketsDto: CreateTicketDto[],
  ): Promise<CreateTicketsResponse> {
    const transaction = await this.sequelize.transaction();

    try {
      if (createTicketsDto.length === 0) {
        return {
          createdCount: 0,
          failedCount: 0,
          failedTickets: [],
        };
      }

      const truck = await this.truckModel.findByPk(truckId, { transaction });
      if (!truck) {
        throw new BadRequestException(
          `Truck with ID ${truckId} does not exist.`,
        );
      }

      const siteId = truck.siteId;

      const lastTicket = await this.ticketModel.findOne({
        where: { siteId },
        order: [['ticketNumber', 'DESC']],
        transaction,
      });

      const nextTicketNumber = lastTicket ? lastTicket.ticketNumber + 1 : 1;

      const { validTickets, failedTickets } =
        await this.validateAndPrepareTickets(
          createTicketsDto,
          nextTicketNumber,
          truckId,
          siteId,
        );

      if (validTickets.length === 0) {
        return {
          createdCount: 0,
          failedCount: failedTickets.length,
          failedTickets,
        };
      }

      const batchSize = parseInt(process.env.BATCH_SIZE || '1000', 10);
      let createdCount = 0;

      for (let i = 0; i < validTickets.length; i += batchSize) {
        const batch = validTickets.slice(i, i + batchSize);
        const result = await this.ticketModel.bulkCreate(batch, {
          transaction,
        });
        createdCount += result.length;
      }

      await transaction.commit();

      return {
        createdCount,
        failedCount: failedTickets.length,
        failedTickets,
      };
    } catch (error) {
      await transaction.rollback();
      this.logger.error(
        `Failed to create tickets for truck ID ${truckId}. Rolling back transaction.`,
        error,
      );
      throw error;
    }
  }

  async getTickets(
    siteIds?: number[],
    startDate?: Date,
    endDate: Date = new Date(),
    page = 1,
    limit = 100,
  ): Promise<TicketResponse> {
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
        siteId: ticket.siteId,
      }));

      const totalPages = Math.ceil(count / limit);

      return {
        data: transformedRows,
        totalItems: count,
        totalPages,
        limit,
        page,
      };
    } catch (error) {
      this.logger.error('Failed to fetch tickets', error);
      throw error;
    }
  }

  private validateDispatchTime(dto: CreateTicketDto): {
    valid: boolean;
    reason?: string;
  } {
    const dispatchTime = new Date(dto.dispatchTime);

    if (isNaN(dispatchTime.getTime())) {
      return { valid: false, reason: 'Invalid dispatchTime date.' };
    }

    const now = new Date();

    if (dispatchTime.getTime() > now.getTime()) {
      return {
        valid: false,
        reason: 'Dispatch time cannot be in the future.',
      };
    }

    return { valid: true };
  }

  private async validateAndPrepareTickets(
    createTicketsDto: CreateTicketDto[],
    lastTicketNumber: number,
    truckId: number,
    siteId: number,
  ): Promise<{
    validTickets: Partial<Ticket>[];
    failedTickets: FailedTicket[];
  }> {
    const invalidTickets: FailedTicket[] = [];
    const validTickets: Partial<Ticket>[] = [];

    const sortedDtos = [...createTicketsDto].sort(
      (a, b) =>
        new Date(a.dispatchTime).getTime() - new Date(b.dispatchTime).getTime(),
    );

    let lastValidDispatchTime: number | null = null;
    const minIntervalMilliseconds = this.minDispatchIntervalMinutes * 60 * 1000;

    for (const dto of sortedDtos) {
      const validation = this.validateDispatchTime(dto);
      if (!validation.valid) {
        invalidTickets.push({ dto, reason: validation.reason });
        continue;
      }

      const dispatchTimeMilliseconds = new Date(dto.dispatchTime).getTime();

      const conflictWithDB = await this.ticketModel.findOne({
        where: {
          truckId: truckId,
          dispatchTime: {
            [Op.between]: [
              new Date(dispatchTimeMilliseconds - minIntervalMilliseconds),
              new Date(dispatchTimeMilliseconds + minIntervalMilliseconds),
            ],
          },
        },
      });

      if (conflictWithDB) {
        invalidTickets.push({
          dto,
          reason: `There must be at least ${this.minDispatchIntervalMinutes} minutes between dispatch times for the same truck.`,
        });
        continue;
      }

      if (lastValidDispatchTime !== null) {
        const diff = dispatchTimeMilliseconds - lastValidDispatchTime;
        if (diff < minIntervalMilliseconds) {
          invalidTickets.push({
            dto,
            reason: `Dispatch time is too close to the previous ticket (${this.minDispatchIntervalMinutes} minutes required).`,
          });
          continue;
        }
      }

      validTickets.push({
        material: dto.material,
        dispatchTime: new Date(dto.dispatchTime),
        truckId: truckId,
        siteId: siteId,
        ticketNumber: lastTicketNumber++,
      });

      lastValidDispatchTime = dispatchTimeMilliseconds;
    }

    return {
      validTickets,
      failedTickets: invalidTickets,
    };
  }
}
