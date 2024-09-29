import { Truck } from '../trucks/trucks.model';

import {
  Column,
  Model,
  Table,
  HasMany,
  DataType,
  AllowNull,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

@Table
export class Site extends Model {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  address: string;

  @Column(DataType.STRING)
  description: string;

  @HasMany(() => Truck)
  trucks: Truck[];
}
