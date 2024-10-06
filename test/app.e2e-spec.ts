import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { Sequelize } from 'sequelize-typescript';
import { Truck } from './../src/trucks/trucks.model';
import { Site } from './../src/sites/sites.model';
import { Ticket } from './../src/tickets/tickets.model';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let site: Site;
  let truck: Truck;
  let ticket: Ticket;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    sequelize = moduleFixture.get<Sequelize>(Sequelize);
    await sequelize.sync({ force: true });
    await app.init();

    await Ticket.destroy({ where: {} });
    await Truck.destroy({ where: {} });
    await Site.destroy({ where: {} });

    site = await Site.create({
      name: 'Test Site',
    });

    truck = await Truck.create({
      license: 'ABC123',
      siteId: site.id,
    });

    ticket = await Ticket.create({
      ticketNumber: 1,
      dispatchTime: new Date().toISOString(),
      material: 'soil',
      truckId: truck.id,
      siteId: site.id,
    });
  });

  afterAll(async () => {
    await sequelize.close();
    await app.close();
  });

  describe('Trucks', () => {
    it('/trucks/:id/tickets/bulk_create (POST)', async () => {
      const truckId = truck.id;
      const dispatchTime = new Date();
      dispatchTime.setHours(dispatchTime.getHours() - 2);
      const createTicketDtos = [
        {
          dispatchTime: dispatchTime.toISOString(),
        },
      ];

      const response = await request(app.getHttpServer())
        .post(`/trucks/${truckId}/tickets/bulk_create`)
        .send(createTicketDtos)
        .expect(201);

      expect(response.body).toEqual({
        createdCount: 1,
        failedCount: 0,
        failedTickets: [],
      });
    });
  });

  describe('Tickets', () => {
    it('/tickets (GET)', async () => {
      const response = await request(app.getHttpServer())
        .get('/tickets')
        .query({
          siteIds: [site.id],
          page: 1,
          limit: 10,
        })
        .expect(200);

      expect(response.body).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            material: ticket.material,
            siteId: ticket.siteId,
            truckLicense: truck.license,
            siteName: site.name,
            dispatchTime: ticket.dispatchTime.toISOString(),
          }),
        ]),
        totalItems: 2,
        totalPages: 1,
        limit: 10,
        page: 1,
      });
    });
  });
});
