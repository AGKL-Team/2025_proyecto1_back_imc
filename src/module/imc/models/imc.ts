import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('records')
export class ImcRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  height: number;

  @Column('float')
  weight: number;

  @Column('integer')
  userId: number;
}
