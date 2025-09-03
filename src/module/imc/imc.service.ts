import { Injectable } from '@nestjs/common';
import { CalcularImcRequest } from './dto/calcular-imc-dto';
import { CalcularImcResponse } from './dto/calcular-imc-response.interface';

@Injectable()
export class ImcService {
  constructor() {}

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

  // private async saveImcRecord(height: number, weight: number) {
  //   const imcRecord = this.imcRepository.create({
  //     height,
  //     weight,
  //     userId: 0,
  //   });

  //   return await this.imcRepository.save(imcRecord);
  // }
}
