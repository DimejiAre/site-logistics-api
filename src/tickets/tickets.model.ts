import { Truck } from '../trucks/trucks.model';
import { Site } from '../sites/sites.model';

import {
  Column,
  Model,
  Table,
  BelongsTo,
  DataType,
  Default,
  PrimaryKey,
  ForeignKey,
  Index,
  AutoIncrement,
  AllowNull,
} from 'sequelize-typescript';

@Table
export class Ticket extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column(DataType.INTEGER)
  ticketNumber: number;

  @Column(DataType.DATE)
  @Index
  dispatchTime: Date;

  @Default('soil')
  @AllowNull(false)
  @Column(DataType.STRING)
  material: string;

  @ForeignKey(() => Truck)
  @Index
  @Column(DataType.INTEGER)
  truckId: number;

  @ForeignKey(() => Site)
  @Index
  @Column(DataType.INTEGER)
  siteId: number;

  @BelongsTo(() => Truck)
  truck: Truck;

  @BelongsTo(() => Site)
  site: Site;
}
