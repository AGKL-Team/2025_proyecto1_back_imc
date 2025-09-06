import { ImcRecord } from 'src/module/imc/models/imc-record';
import { PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => ImcRecord, (imcRecord) => imcRecord.user)
  imcRecords: ImcRecord[];
}
