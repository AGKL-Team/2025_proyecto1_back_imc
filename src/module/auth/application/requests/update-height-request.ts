import { IsNumber, Max, Min } from 'class-validator';

export class UpdateHeightRequest {
  @IsNumber()
  @Min(0.1)
  @Max(3)
  height: number;
}
