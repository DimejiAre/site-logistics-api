import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Site } from './sites/sites.model';
import { Truck } from './trucks/trucks.model';
import { Ticket } from './tickets/tickets.model';
import { ConfigModule } from '@nestjs/config';
import { SitesModule } from './sites/sites.modules';
import { TrucksModule } from './trucks/trucks.modules';
import { TicketsModule } from './tickets/tickets.modules';
import { TicketsService } from './tickets/tickets.service';
import { TicketsController } from './tickets/tickets.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      // autoLoadModels: true,
      logging: false,
      models: [Site, Truck, Ticket],
    }),
    SitesModule,
    TrucksModule,
    TicketsModule,
  ],
  controllers: [AppController, TicketsController],
  providers: [AppService, TicketsService],
})
export class AppModule {}
