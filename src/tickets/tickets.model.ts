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
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column(DataType.INTEGER)
  ticketNumber: number;

  @Column(DataType.DATE)
  @Index
  dispatchTime: Date;

  @Default('soil')
  @Column(DataType.STRING) //make enum?
  material: string;

  @ForeignKey(() => Truck)
  @Index
  @Column(DataType.UUID)
  truckId: string;

  @BelongsTo(() => Truck)
  truck: Truck;
}
