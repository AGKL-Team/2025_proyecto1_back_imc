import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { SignInRequest } from '../../application/requests/sign-in-request.interface';
import { SignUpRequest } from '../../application/requests/sign-up-request.interface';
import { SupabaseAuthGuard } from '../../infrastructure/guard/supbase-auth.guard';
import { AuthService } from '../../infrastructure/services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body(ValidationPipe) request: SignInRequest) {
    return await this.authService.signIn(request);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('sign-up')
  async signUp(@Body(ValidationPipe) request: SignUpRequest) {
    return await this.authService.signUp(request);
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SupabaseAuthGuard)
  async signOut() {
    return await this.authService.signOut();
  }
}
