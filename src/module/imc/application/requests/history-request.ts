import { IsDateString, IsOptional } from 'class-validator';

export class HistoryRequest {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
