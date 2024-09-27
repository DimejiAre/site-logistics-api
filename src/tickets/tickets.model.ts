import { Truck } from '../trucks/trucks.model';

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
} from 'sequelize-typescript';

@Table
export class Ticket extends Model {
  @Column(DataType.UUID)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  id: string;

  @Column(DataType.INTEGER)
  ticketNumber: number;

  @Column(DataType.DATE)
  @Index
  dispatchTime: Date;

  @Column(DataType.STRING) //make enum?
  @Default('soil')
  material: string;

  @ForeignKey(() => Truck)
  @Index
  @Column(DataType.UUID)
  truckId: string;

  @BelongsTo(() => Truck)
  truck: Truck;
}
