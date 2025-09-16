import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { User } from '@supabase/supabase-js';
import { UpdateHeightRequest } from 'module/auth/application/requests/update-height-request';
import { UserFromRequest } from 'module/auth/infrastructure/decorators/user.decorator';
import { SignInRequest } from '../../application/requests/sign-in-request';
import { SignUpRequest } from '../../application/requests/sign-up-request';
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
    // ! Ensure the password and confirmPassword match
    if (request.password !== request.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    return await this.authService.signUp(request);
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SupabaseAuthGuard)
  async signOut() {
    return await this.authService.signOut();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(SupabaseAuthGuard)
  async getCurrentUser(@UserFromRequest() user: User) {
    return await this.authService.getCurrentUser(user);
  }

  @Patch('update-height')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SupabaseAuthGuard)
  async updateHeight(
    @UserFromRequest() user: User,
    @Body(ValidationPipe) request: UpdateHeightRequest,
  ) {
    return await this.authService.updateHeight(user, request.height);
  }
}
