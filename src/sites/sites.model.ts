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
  Default
} from 'sequelize-typescript';

@Table
export class Site extends Model {
  @Column(DataType.UUID)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  id: string;

  @Column(DataType.STRING)
  @Unique
  @AllowNull(false)
  name: string;

  @Column(DataType.STRING)
  address: string;

  @Column(DataType.STRING)
  description: string;

  @HasMany(() => Truck)
  trucks: Truck[];
}
