import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalcularImcDto } from './dto/calcular-imc-dto';
import { ImcRecord } from './models/imc';

@Injectable()
export class ImcService {
  constructor(
    @InjectRepository(ImcRecord)
    private readonly imcRepository: Repository<ImcRecord>,
  ) {}

  async calcularImc(
    data: CalcularImcDto,
  ): Promise<{ imc: number; categoria: string }> {
    const { altura, peso } = data;
    const imc = peso / (altura * altura);
    const imcRedondeado = Math.round(imc * 100) / 100;

    let categoria: string;
    if (imc < 18.5) {
      categoria = 'Bajo peso';
    } else if (imc < 25) {
      categoria = 'Normal';
    } else if (imc < 30) {
      categoria = 'Sobrepeso';
    } else {
      categoria = 'Obeso';
    }

    // save into database here
    await this.saveImcRecord(altura, peso);

    return { imc: imcRedondeado, categoria };
  }

  private async saveImcRecord(height: number, weight: number) {
    const imcRecord = this.imcRepository.create({
      height,
      weight,
      userId: 0,
    });

    return await this.imcRepository.save(imcRecord);
  }
}
