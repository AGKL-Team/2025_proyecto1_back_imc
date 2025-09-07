import { Injectable } from '@nestjs/common';
import {
  SignUpWithPasswordCredentials,
  SupabaseClient,
} from '@supabase/supabase-js';
import { SupabaseService } from 'src/module/database/services/supabase.service';

@Injectable()
export class AuthService {
  private readonly supabaseClient: SupabaseClient;
  constructor(private readonly supabaseService: SupabaseService) {
    this.supabaseClient = this.supabaseService.getClient();
  }

  async signUp(credentials: SignUpWithPasswordCredentials) {
    return await this.supabaseClient.auth.signUp(credentials);
  }

  async signIn(credentials: SignUpWithPasswordCredentials) {
    return await this.supabaseClient.auth.signInWithPassword(credentials);
  }

  async signOut() {
    return await this.supabaseClient.auth.signOut();
  }

  async getUser() {
    const {
      data: { user },
    } = await this.supabaseClient.auth.getUser();
    return user;
  }
}
