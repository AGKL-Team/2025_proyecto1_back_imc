import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SupabaseService } from '../database/services/supabase.service';
import { SupabaseAuthGuard } from './infrastructure/guard/supbase-auth.guard';
import { AuthService } from './infrastructure/services/auth.service';
import { AuthController } from './presentation/api/auth.controller';

@Module({
  imports: [
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
