import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Site } from './sites/sites.model';
import { Truck } from './trucks/trucks.model';
import { Ticket } from './tickets/tickets.model';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadModels: true,
      synchronize: true,
      models: [Site, Truck, Ticket],
      // ports : 5432
      // sync: { force: true }
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
