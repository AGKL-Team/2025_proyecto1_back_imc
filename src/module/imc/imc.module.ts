import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { Category } from './domain/models/category';
import { ImcRecord } from './domain/models/imc-record';
import { ImcService } from './infrastructure/services/imc.service';
import { ImcController } from './presentation/api/imc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImcRecord, Category]),
    DatabaseModule,
    AuthModule,
  ],
  controllers: [ImcController],
  providers: [ImcService, Logger],
  exports: [ImcService],
})
export class ImcModule {}
