import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { Request } from 'express';
import { JwtFromRequestFunction } from 'passport-jwt';
import { Strategy } from 'passport-strategy';
import { SUPABASE_AUTH, UNAUTHORIZED } from 'src/module/auth/constants';
import { SupabaseAuthStrategyOptions } from './interface/options';
import { SupabaseAuthUser } from './user';

export class SupabaseAuthStrategy extends Strategy {
  readonly name = SUPABASE_AUTH;
  private supabase: SupabaseClient;
  private extractor: JwtFromRequestFunction;
  success: (user: any, info: any) => void;
  fail: Strategy['fail'];

  constructor(options: SupabaseAuthStrategyOptions) {
    super();
    if (!options.extractor) {
      throw new Error(
        '\n Extractor is not a function. You should provide an extractor. \n Read the docs: https://github.com/tfarras/nestjs-firebase-auth#readme',
      );
    }

    this.supabase = createClient(
      options.supabaseUrl,
      options.supabaseKey,
      (options.supabaseOptions = {}),
    );
    this.extractor = options.extractor;
  }

  validate(payload: SupabaseAuthUser): SupabaseAuthUser | null {
    if (payload) {
      this.success(payload, {});

      return payload;
    }

    this.fail(UNAUTHORIZED, 401);

    return null;
  }

  authenticate(req: Request): void {
    const idToken: string = this.extractor(req);

    if (!idToken) {
      this.fail(UNAUTHORIZED, 401);
      return;
    }

    this.supabase.auth
      .getUser(idToken)
      .then(({ data: { user } }) => this.validate(user!))
      .catch((err) => {
        this.fail(err.message, 401);
      });
  }
}
