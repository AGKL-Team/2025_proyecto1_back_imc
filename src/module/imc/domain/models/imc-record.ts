import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from './category';

@Entity('records')
export class ImcRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  height: number;

  @Column('float')
  weight: number;

  @Column('float')
  imc: number;

  @Column('timestamptz')
  date: Date;

  @ManyToOne(() => Category, (category) => category.records, { eager: true })
  category: Category;

  @Column('varchar', { length: 36 })
  userId: string;
}
