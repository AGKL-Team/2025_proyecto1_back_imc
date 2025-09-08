import { SupabaseService } from '@/module/database/services/supabase.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SignInRequest } from '../../application/requests/sign-in-request.interface';
import { SignUpRequest } from '../../application/requests/sign-up-request.interface';
import { ApplicationUserResponse } from '../../application/responses/user-response.interface';

@Injectable()
export class AuthService {
  private readonly supabaseClient: SupabaseClient;

  constructor(private readonly supabaseService: SupabaseService) {
    this.supabaseClient = this.supabaseService.getClient();
  }

  /**
   * Sign Up a new user with email and password
   * @param credentials user credentials to sign up
   * @throws BadRequestException if there is an error during sign up
   */
  async signUp(credentials: SignUpRequest) {
    // ! Ensure the user not exists
    const userExists = Boolean(
      await this.supabaseClient.rpc('sql', {
        query: 'SELECT 1 FROM auth.users WHERE email = ?',
        params: [credentials.email],
      }),
    );

    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    // 1. Set the redirection url when the user confirms their email
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL is not defined');
    }
    credentials.options = {
      ...credentials.options,
      emailRedirectTo: `${frontendUrl}/auth/email-confirmed`,
    };

    // 2. Create a new user with email and password
    const response = await this.supabaseClient.auth.signUp(credentials);

    // ! If there is an error, throw a BadRequestException
    if (response.error) {
      throw new BadRequestException(response.error);
    }

    return response;
  }

  /**
   * Sign In an existing user with email and password
   * @param credentials user credentials to sign in
   * @throws BadRequestException if there is an error during sign in
   */
  async signIn(credentials: SignInRequest) {
    // 1. Sign in the user with email and password
    const response =
      await this.supabaseClient.auth.signInWithPassword(credentials);

    // ! 2. If there is an error, throw a BadRequestException
    if (response.error) {
      throw new BadRequestException(response.error);
    }

    // 3. Return the access token and its expiration time
    return {
      access_token: response.data.session.access_token,
      expires_in: response.data.session.expires_in,
    } as ApplicationUserResponse;
  }

  /**
   * Sign Out the authenticated user
   * @returns
   */
  async signOut() {
    // Close all sessions for the authenticated user
    const response = await this.supabaseClient.auth.signOut({
      scope: 'global',
    });
    if (response.error) {
      throw new BadRequestException(response.error);
    }
    return response;
  }
}
