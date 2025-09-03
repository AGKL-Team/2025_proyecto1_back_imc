import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { CalcularImcDto } from './dto/calcular-imc-dto';
import { ImcService } from './imc.service';

@Controller('imc')
export class ImcController {
  constructor(private readonly imcService: ImcService) {}

  @Post('calcular')
  async calcular(@Body(ValidationPipe) data: CalcularImcDto) {
    return await this.imcService.calcularImc(data);
  }
}
