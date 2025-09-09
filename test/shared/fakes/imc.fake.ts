import { ImcRecord } from '@/module/imc/domain/models/imc-record';
import { categoryFake } from './category.fake';

export const fakeImcRecord: ImcRecord = {
  id: 1,
  height: 1.75,
  weight: 100,
  imc: 32.65,
  userId: 'someValidUUID',
  date: new Date(),
  category: categoryFake,
};
