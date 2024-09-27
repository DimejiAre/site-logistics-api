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
  @Column(DataType.UUID)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  id: string;

  @Column(DataType.STRING)
  @Unique
  @AllowNull(false)
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
