import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { ImcController } from './api/imc.controller';
import { Category } from './domain/models/category';
import { ImcRecord } from './domain/models/imc-record';
import { ImcService } from './infrastructure/services/imc.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImcRecord, Category]),
    DatabaseModule,
    AuthModule,
  ],
  controllers: [ImcController],
  providers: [ImcService],
  exports: [ImcService],
})
export class ImcModule {}
