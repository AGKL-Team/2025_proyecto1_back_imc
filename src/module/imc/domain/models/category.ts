import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ImcRecord } from './imc-record';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 30 })
  name: string;

  @Column('float')
  min: number;

  @Column('float')
  max: number;

  @OneToMany(() => ImcRecord, (record) => record.category)
  records: ImcRecord[];
}
