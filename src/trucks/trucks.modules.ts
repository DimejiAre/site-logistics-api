import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Truck } from './trucks.model';

@Module({
  imports: [SequelizeModule.forFeature([Truck])],
  providers: [],
  controllers: [],
})
export class SitesModule {}
