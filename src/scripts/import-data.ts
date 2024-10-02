import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/sequelize';
import { Site } from '../sites/sites.model';
import { Truck } from '../trucks/trucks.model';
import * as fs from 'fs';
const JSONStream = require('JSONStream'); // eslint-disable-line @typescript-eslint/no-require-imports
import { pipeline } from 'stream/promises';
import { Sequelize } from 'sequelize-typescript';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('ImportData.ts');

  const sequelize = app.get(Sequelize);
  const siteModel = app.get(getModelToken(Site));
  const truckModel = app.get(getModelToken(Truck));
  const batchSize = 1000;
  const siteBatch: any[] = [];
  const truckBatch: any[] = [];

  try {
    const siteTransaction = await sequelize.transaction();

    await pipeline(
      fs.createReadStream('SitesJSONData.json'),
      JSONStream.parse('*'),
      async (siteStream) => {
        for await (const site of siteStream) {
          siteBatch.push(site);
          if (siteBatch.length === batchSize) {
            await siteModel.bulkCreate(siteBatch, {
              transaction: siteTransaction,
            });
            siteBatch.length = 0;
          }
        }
        if (siteBatch.length > 0)
          await siteModel.bulkCreate(siteBatch, {
            transaction: siteTransaction,
          });
      },
    );

    await siteTransaction.commit();
    logger.log('Sites inserted successfully.');
  } catch (error) {
    logger.error('Error inserting Sites data, transaction rolled back:', error);
  }

  try {
    const truckTransaction = await sequelize.transaction();

    await pipeline(
      fs.createReadStream('TrucksJSONData.json'),
      JSONStream.parse('*'),
      async (truckStream) => {
        for await (const truck of truckStream) {
          truckBatch.push(truck);
          if (truckBatch.length === batchSize) {
            await truckModel.bulkCreate(truckBatch, {
              transaction: truckTransaction,
            });
            truckBatch.length = 0;
          }
        }
        if (truckBatch.length > 0)
          await truckModel.bulkCreate(truckBatch, {
            transaction: truckTransaction,
          });
      },
    );

    await truckTransaction.commit();
    logger.log('Trucks inserted successfully.');
  } catch (error) {
    logger.error(
      'Error inserting Trucks data, transaction rolled back:',
      error,
    );
  } finally {
    await app.close();
  }
}

bootstrap();
