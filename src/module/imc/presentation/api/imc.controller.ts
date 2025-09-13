import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { User } from '@supabase/supabase-js';
import { UserFromRequest } from '../../../auth/infrastructure/decorators/user.decorator';
import { SupabaseAuthGuard } from '../../../auth/infrastructure/guard/supbase-auth.guard';
import { CalcularImcRequest } from '../../application/requests/calcular-imc-request';
import { HistoryRequest } from '../../application/requests/history-request';
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

  @Get('history')
  @UseGuards(SupabaseAuthGuard)
  async getHistory(
    @UserFromRequest() user: User,
    @Query(ValidationPipe) query: HistoryRequest,
  ) {
    const { startDate, endDate } = query;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException(
        'Invalid date range: startDate is after endDate',
      );
    }

    return await this.imcService.getRecords(
      user.id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
