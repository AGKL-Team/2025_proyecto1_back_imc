import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImcController } from './imc.controller';
import { ImcService } from './imc.service';
import { ImcRecord } from './models/imc-record';

@Module({
  imports: [TypeOrmModule.forFeature([ImcRecord])],
  controllers: [ImcController],
  providers: [ImcService],
})
export class ImcModule {}
