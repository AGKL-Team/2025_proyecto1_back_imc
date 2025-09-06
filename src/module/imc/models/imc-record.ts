import { User } from 'src/module/auth/models/user';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  // Relations
  @ManyToOne(() => User, (user) => user.imcRecords)
  @JoinColumn({ name: 'userId' })
  user: User;
}
