import {
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTicketDto {
  @IsOptional()
  @IsString()
  material?: string;

  @IsDateString()
  @IsNotEmpty()
  dispatchTime: string;
}
