import { Site } from '../sites/sites.model';
import { Ticket } from '../tickets/tickets.model';

import {
  Column,
  Model,
  Table,
  HasMany,
  BelongsTo,
  DataType,
  PrimaryKey,
  ForeignKey,
  Unique,
  AllowNull,
  Index,
  AutoIncrement,
} from 'sequelize-typescript';

@Table
export class Truck extends Model {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column(DataType.INTEGER)
  id: number;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  license: string;

  @ForeignKey(() => Site)
  @Index
  @AllowNull(false)
  @Column(DataType.INTEGER)
  siteId: number;

  @BelongsTo(() => Site)
  site: Site;

  @HasMany(() => Ticket)
  tickets: Ticket[];
}
