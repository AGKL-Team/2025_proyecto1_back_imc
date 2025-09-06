import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImcController } from './imc.controller';
import { ImcRecord } from './models/imc-record';
import { ImcService } from './services/imc.service';

@Module({
  imports: [TypeOrmModule.forFeature([ImcRecord])],
  controllers: [ImcController],
  providers: [ImcService],
  exports: [ImcService],
})
export class ImcModule {}
