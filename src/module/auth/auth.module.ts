import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationModule } from '../../config/configuration.module';
import { DatabaseModule } from '../database/database.module';
import { SupabaseService } from '../database/services/supabase.service';
import { Account } from './domain/models/account';
import { SupabaseAuthGuard } from './infrastructure/guard/supbase-auth.guard';
import { AuthService } from './infrastructure/services/auth.service';
import { AuthController } from './presentation/api/auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    DatabaseModule,
    ConfigurationModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SupabaseService, SupabaseAuthGuard],
  exports: [AuthService, JwtModule, SupabaseAuthGuard],
})
export class AuthModule {}
