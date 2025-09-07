import { Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ImcRecord } from './imc-record';

export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 30 })
  name: string;

  @Column('float')
  min: number;

  @Column('float')
  max: number;

  @ManyToOne(() => ImcRecord, (record) => record.category)
  records: ImcRecord[];
}
