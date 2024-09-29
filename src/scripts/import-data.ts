import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/sequelize';
import { Site } from '../sites/sites.model';
import { Truck } from '../trucks/trucks.model';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const siteModel = app.get(getModelToken(Site));
  const truckModel = app.get(getModelToken(Truck));

  const sitesData = JSON.parse(fs.readFileSync('SitesJSONData.json', 'utf8'));
  const trucksData = JSON.parse(fs.readFileSync('TrucksJSONData.json', 'utf8'));

  const batchSize = 1000;

  for (let i = 0; i < sitesData.length; i += batchSize) {
    const siteBatch = sitesData.slice(i, i + batchSize);
    await siteModel.bulkCreate(siteBatch);
  }

  for (let i = 0; i < trucksData.length; i += batchSize) {
    const truckBatch = trucksData.slice(i, i + batchSize);
    await truckModel.bulkCreate(truckBatch);
  }

  console.log('Data insertion complete...');

  await app.close();
}

bootstrap();
