import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from '@supabase/supabase-js';
import { SupabaseAuthGuard } from '../guard/supbase-auth.guard';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @UseGuards(SupabaseAuthGuard)
  async signIn(@Body() request: SignInWithPasswordCredentials) {
    return this.authService.signIn(request);
  }

  @Post('sign-out')
  @UseGuards(SupabaseAuthGuard)
  async signOut() {
    return this.authService.signOut();
  }

  @Post('sign-up')
  async signUp(@Body() request: SignUpWithPasswordCredentials) {
    return this.authService.signUp(request);
  }
}
