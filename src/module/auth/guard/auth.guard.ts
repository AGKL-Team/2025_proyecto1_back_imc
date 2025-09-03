import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard to protect routes using Supabase JWT
 */
@Injectable()
export class SupabaseAuthGuard extends AuthGuard('supabase') {}
