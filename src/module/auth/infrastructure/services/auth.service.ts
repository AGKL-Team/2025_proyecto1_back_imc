import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';

import { FrontendConfig } from '../../../../config/frontent.config';
import { SupabaseService } from '../../../database/services/supabase.service';
import { SignInRequest } from '../../application/requests/sign-in-request';
import { SignUpRequest } from '../../application/requests/sign-up-request';
import { ApplicationUserResponse } from '../../application/responses/user-response.interface';

@Injectable()
export class AuthService {
  private readonly supabaseClient: SupabaseClient;
  private readonly frontendUrl: string;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {
    this.supabaseClient = this.supabaseService.getClient();

    const frontendConfig = this.configService.get<FrontendConfig>('frontend');

    if (!frontendConfig?.url) throw new Error('FRONTEND_URL must be defined');

    this.frontendUrl = frontendConfig.url;
  }

  /**
   * Sign Up a new user with email and password
   * @param credentials user credentials to sign up
   * @throws BadRequestException if there is an error during sign up
   */
  async signUp(credentials: SignUpRequest) {
    // ! Ensure the user not exists
    await this.ensureUserNotExists(credentials);

    // 1. Set the redirection url when the user confirms their email
    credentials.options = {
      ...credentials.options,
      emailRedirectTo: `${this.frontendUrl}/auth/email-confirmed`,
    };

    // 2. Create a new user with email and password
    const response = await this.supabaseClient.auth.signUp(credentials);

    // ! If there is an error, throw a BadRequestException
    if (response.error) {
      throw new BadRequestException(response.error);
    }
  }

  public async ensureUserNotExists(credentials: SignUpRequest) {
    const query = await this.supabaseClient.rpc('sql', {
      query: 'SELECT 1 FROM auth.users WHERE email = ?',
      params: [credentials.email],
    });

    // Ensure the query was successful
    const userExists = Boolean(query.data);

    if (userExists) {
      throw new BadRequestException('User already exists');
    }
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
      email: response.data.user.email,
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
