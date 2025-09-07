import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SupabaseService } from '../database/services/supabase.service';
import { AuthController } from './api/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SupabaseService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
