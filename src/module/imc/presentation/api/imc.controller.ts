import {
  Body,
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { User } from '@supabase/supabase-js';
import { UserFromRequest } from '../../../auth/infrastructure/decorators/user.decorator';
import { SupabaseAuthGuard } from '../../../auth/infrastructure/guard/supbase-auth.guard';
import { CalcularImcRequest } from '../../application/requests/calcular-imc-request';
import { ImcService } from '../../infrastructure/services/imc.service';

@Controller('imc')
export class ImcController {
  constructor(private readonly imcService: ImcService) {}

  @Post('calcular')
  @UseGuards(SupabaseAuthGuard)
  calcular(
    @Body(ValidationPipe) data: CalcularImcRequest,
    @UserFromRequest() user: User,
  ) {
    const userId = user.id;
    return this.imcService.calcularImc(data, userId);
  }

  @Post('history')
  @UseGuards(SupabaseAuthGuard)
  async getHistory(@UserFromRequest() user: User) {
    return await this.imcService.getRecords(user.id);
  }
}
