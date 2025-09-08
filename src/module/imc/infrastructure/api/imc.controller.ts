import { UserFromRequest } from '@/module/auth/infrastructure/decorators/user.decorator';
import { SupabaseAuthGuard } from '@/module/auth/infrastructure/guard/supbase-auth.guard';
import {
  Body,
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { User } from '@supabase/supabase-js';
import { ImcService } from '../services/imc.service';
import { CalcularImcRequest } from '../../application/requests/calcular-imc-dto';

@Controller('imc')
export class ImcController {
  constructor(private readonly imcService: ImcService) {}

  @Post('calcular')
  calcular(@Body(ValidationPipe) data: CalcularImcRequest) {
    return this.imcService.calcularImc(data);
  }

  @Post('save')
  @UseGuards(SupabaseAuthGuard)
  async save(@Body(ValidationPipe) data: CalcularImcRequest) {
    return await this.imcService.saveImcRecord(data.altura, data.peso);
  }

  @Post('history')
  @UseGuards(SupabaseAuthGuard)
  async getHistory(@UserFromRequest() user: User) {
    return await this.imcService.getRecords(user.id);
  }
}
