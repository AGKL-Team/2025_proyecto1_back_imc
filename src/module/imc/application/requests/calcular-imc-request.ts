import { IsNumber, Max, Min } from 'class-validator';

export class CalcularImcRequest {
  @IsNumber()
  @Min(0.1) // Altura mínima razonable
  @Max(3) // Altura máxima razonable
  height: number;

  @IsNumber()
  @Min(1) // Peso mínimo razonable
  @Max(500) // Peso máximo razonable
  weight: number;
}
