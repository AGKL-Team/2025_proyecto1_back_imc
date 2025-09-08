import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaveRecordError } from '../../application/errors/save-record-error';
import { CalcularImcRequest } from '../../application/requests/calcular-imc-dto';
import { CalcularImcResponse } from '../../application/responses/calcular-imc-response.interface';
import { Category } from '../../domain/models/category';
import { ImcRecord } from '../../domain/models/imc-record';

@Injectable()
export class ImcService {
  constructor(
    @InjectRepository(ImcRecord)
    private readonly imcRepository: Repository<ImcRecord>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async calcularImc(
    data: CalcularImcRequest,
    userId: string,
  ): Promise<CalcularImcResponse> {
    const { altura, peso } = data;
    const imc = peso / (altura * altura);
    const imcRedondeado = Math.round(imc * 100) / 100;

    let category: string;
    if (imc < 18.5) {
      category = 'Bajo peso';
    } else if (imc < 25) {
      category = 'Normal';
    } else if (imc < 30) {
      category = 'Sobrepeso';
    } else {
      category = 'Obeso';
    }

    await this.saveImcRecord(altura, peso, imcRedondeado, category, userId);

    return { imc: imcRedondeado, categoria: category };
  }

  async saveImcRecord(
    height: number,
    weight: number,
    imc: number,
    category: string,
    userId: string,
  ) {
    try {
      const categoryEntity = new Category();
      categoryEntity.name = category;

      const imcRecord = this.imcRepository.create({
        height,
        weight,
        userId,
        category: categoryEntity,
        imc: imc,
        date: Date.now(),
      });

      return await this.imcRepository.save(imcRecord);
    } catch (error) {
      // TODO: log error
      throw new SaveRecordError((error as Error).message);
    }
  }

  /**
   * Get all IMC records from the database
   * @returns Promise<ImcRecord[]>
   * @fixme filter by user id
   */
  async getRecords(userId: string): Promise<ImcRecord[]> {
    return await this.imcRepository.find({ where: { userId } });
  }
}
