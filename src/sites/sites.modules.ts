import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Site } from './sites.model';

@Module({
  imports: [SequelizeModule.forFeature([Site])],
  providers: [],
  controllers: [],
  exports: [SequelizeModule],
})
export class SitesModule {}
