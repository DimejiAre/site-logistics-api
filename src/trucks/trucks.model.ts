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
  Default,
  Unique,
  AllowNull,
  Index,
} from 'sequelize-typescript';

@Table
export class Truck extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @AllowNull(false)
  @Column(DataType.UUID)
  id: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  license: string;

  @ForeignKey(() => Site)
  @Index
  @Column(DataType.UUID)
  siteId: string;

  @BelongsTo(() => Site)
  site: Site;

  @HasMany(() => Ticket)
  tickets: Ticket[];
}
