import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Ticket } from './tickets.model';

@Module({
  imports: [SequelizeModule.forFeature([Ticket])],
  providers: [],
  controllers: [],
  exports: [SequelizeModule],
})
export class TicketsModule {}
