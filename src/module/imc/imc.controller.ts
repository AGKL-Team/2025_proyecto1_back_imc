import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { CalcularImcRequest } from './dto/calcular-imc-dto';
import { ImcService } from './imc.service';

@Controller('imc')
export class ImcController {
  constructor(private readonly imcService: ImcService) {}

  @Post('calcular')
  calcular(@Body(ValidationPipe) data: CalcularImcRequest) {
    return this.imcService.calcularImc(data);
  }

  @Post('save')
  async save(@Body(ValidationPipe) data: CalcularImcRequest) {
    return await this.imcService.saveImcRecord(data.altura, data.peso);
  }
}
