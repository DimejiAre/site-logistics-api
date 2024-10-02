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

async function processData(
  model: any,
  filePath: string,
  batchSize: number,
  sequelize: Sequelize,
  logger: Logger,
  dataLabel: string,
) {
  const batch: any[] = [];
  const transaction = await sequelize.transaction();

  try {
    await pipeline(
      fs.createReadStream(filePath),
      JSONStream.parse('*'),
      async (stream) => {
        for await (const item of stream) {
          batch.push(item);
          if (batch.length === batchSize) {
            await model.bulkCreate(batch, { transaction });
            batch.length = 0;
          }
        }

        if (batch.length > 0) {
          await model.bulkCreate(batch, { transaction });
        }
      },
    );

    await transaction.commit();
    logger.log(`${dataLabel} inserted successfully.`);
  } catch (error) {
    await transaction.rollback();
    logger.error(
      `Error inserting ${dataLabel} data, transaction rolled back:`,
      error,
    );
  }
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('ImportData.ts');

  const sequelize = app.get(Sequelize);
  const siteModel = app.get(getModelToken(Site));
  const truckModel = app.get(getModelToken(Truck));
  const batchSize = 1000;

  await processData(
    siteModel,
    'SitesJSONData.json',
    batchSize,
    sequelize,
    logger,
    'Sites',
  );

  await processData(
    truckModel,
    'TrucksJSONData.json',
    batchSize,
    sequelize,
    logger,
    'Trucks',
  );

  await app.close();
}

bootstrap();
