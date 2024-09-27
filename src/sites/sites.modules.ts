import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Site } from './sites.model';

@Module({
  imports: [SequelizeModule.forFeature([Site])],
  providers: [],
  controllers: [],
})
export class SitesModule {}
