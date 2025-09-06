import { PassportStrategy } from '@nestjs/passport';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { Request } from 'express';
import { SupabaseAuthStrategy } from 'nestjs-supabase-auth';
import { ExtractJwt, JwtFromRequestFunction } from 'passport-jwt';
import { Strategy } from 'passport-strategy';
import { SUPABASE_AUTH } from 'src/module/auth/constants';
import { SupabaseAuthStrategyOptions } from './interface/options';

/**
 * This class is responsible for authenticating users with Supabase.
 */
export class SupabaseStrategy extends PassportStrategy(
  SupabaseAuthStrategy,
  'supabase',
) {
  /* Auth Strategy name */
  readonly name = SUPABASE_AUTH;
  private supabase: SupabaseClient;
  private extractor: JwtFromRequestFunction;
  success: (user: any, info: any) => void;
  fail: Strategy['fail'];

  public constructor(options: SupabaseAuthStrategyOptions) {
    super({ ...options, extractor: ExtractJwt.fromAuthHeaderAsBearerToken() });

    // Initialize Supabase client
    this.supabase = createClient(
      options.supabaseUrl,
      options.supabaseKey,
      (options.supabaseOptions = {}),
    );
    this.extractor = options.extractor;
  }

  /**
   * Validates the JWT payload.
   * @param payload The JWT payload.
   * @returns The validated user or null.
   */
  async validate(payload: any): Promise<any> {
    return Promise.resolve(super.validate(payload));
  }

  /**
   * Authenticates the user using the Supabase client.
   * @param req The request object.
   */
  authenticate(req: Request) {
    super.authenticate(req);
  }
}
