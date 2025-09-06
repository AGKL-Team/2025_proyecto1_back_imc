import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalcularImcRequest } from '../dto/calcular-imc-dto';
import { CalcularImcResponse } from '../dto/calcular-imc-response.interface';
import { SaveRecordError } from '../errors/save-record-error';
import { ImcRecord } from '../models/imc-record';

@Injectable()
export class ImcService {
  constructor(
    @InjectRepository(ImcRecord)
    private readonly imcRepository: Repository<ImcRecord>,
  ) {}

  calcularImc(data: CalcularImcRequest): CalcularImcResponse {
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
    // await this.saveImcRecord(altura, peso);

    return { imc: imcRedondeado, categoria: categoria };
  }

  async saveImcRecord(height: number, weight: number) {
    try {
      const imcRecord = this.imcRepository.create({
        height,
        weight,
      });

      return await this.imcRepository.save(imcRecord);
    } catch (error) {
      throw new SaveRecordError((error as Error).message);
    }
  }
}
