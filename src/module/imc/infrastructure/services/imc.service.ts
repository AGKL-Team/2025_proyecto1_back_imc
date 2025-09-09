import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'module/imc/domain/models/category';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { SaveRecordError } from '../../application/errors/save-record-error';
import { CalcularImcRequest } from '../../application/requests/calcular-imc-request';
import { CalcularImcResponse } from '../../application/responses/calcular-imc-response.interface';
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
    const { height, weight } = data;
    const imc = weight / (height * height);
    const imcRedondeado = Math.round(imc * 100) / 100;

    const category = await this.categoryRepository.findOne({
      where: { min: LessThanOrEqual(imc), max: MoreThanOrEqual(imc) },
    });

    if (!category)
      throw new NotFoundException('No category found for this IMC');

    await this.saveImcRecord(height, weight, imcRedondeado, category, userId);

    return { imc: imcRedondeado, category: category.name };
  }

  async saveImcRecord(
    height: number,
    weight: number,
    imc: number,
    category: Category,
    userId: string,
  ) {
    try {
      const imcRecord = this.imcRepository.create({
        height,
        weight,
        userId,
        category: { id: category.id },
        imc: imc,
        date: new Date(),
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
