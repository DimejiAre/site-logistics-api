import { Truck } from '../trucks/trucks.model';

import {
  Column,
  Model,
  Table,
  HasMany,
  DataType,
  Unique,
  AllowNull,
  PrimaryKey,
  Default,
} from 'sequelize-typescript';

@Table
export class Site extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Unique
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
