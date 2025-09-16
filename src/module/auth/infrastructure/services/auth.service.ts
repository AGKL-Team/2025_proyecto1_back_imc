import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { Repository } from 'typeorm';
import { SupabaseService } from '../../../database/services/supabase.service';
import { SignInRequest } from '../../application/requests/sign-in-request';
import { SignUpRequest } from '../../application/requests/sign-up-request';
import { ApplicationUserResponse } from '../../application/responses/user-response.interface';
import { Account } from '../../domain/models/account';

@Injectable()
export class AuthService {
  private readonly supabaseClient: SupabaseClient;

  constructor(
    private readonly supabaseService: SupabaseService,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {
    this.supabaseClient = this.supabaseService.getClient();
  }

  /**
   * Sign Up a new user with email and password
   * @param credentials user credentials to sign up
   * @throws BadRequestException if there is an error during sign up
   */
  async signUp(credentials: SignUpRequest) {
    // ! Ensure the user not exists
    await this.ensureUserNotExists(credentials);

    // Create a new user with email and password
    const response = await this.supabaseClient.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    // ! If there is an error, throw a BadRequestException
    if (response.error) {
      this.supabaseService.handleError(response.error);
    }

    // ! If user is not created, throw a BadRequestException
    if (!response.data.user) {
      throw new BadRequestException(
        'Ocurrió un error mientras se creaba el usuario',
      );
    }

    // Create an account to store additional user information like height
    const account = this.accountRepository.create({
      userId: response.data.user.id,
      height: credentials.height,
    });

    await this.accountRepository.save(account);
  }

  public async ensureUserNotExists(credentials: SignUpRequest) {
    const query = await this.supabaseClient.rpc('sql', {
      query: 'SELECT 1 FROM auth.users WHERE email = ?',
      params: [credentials.email],
    });

    // Ensure the query was successful
    const userExists = Boolean(query.data);

    if (userExists) {
      throw new BadRequestException('El usuario ya existe');
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
      this.supabaseService.handleError(response.error);
      return;
    }

    // Get the account information from the database
    const account = await this.accountRepository.findOne({
      where: { userId: response.data.user?.id },
    });

    if (!account) {
      throw new BadRequestException('Cuenta no encontrada');
    }
    // 3. Return the access token and its expiration time
    return {
      access_token: response.data.session.access_token,
      expires_in: response.data.session.expires_in,
      email: response.data.user.email,
      height: account.height,
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

  /**
   * Get the currently authenticated user
   */
  async getCurrentUser(user: User) {
    // Get the account information from the database
    const account = await this.accountRepository.findOne({
      where: { userId: user.id },
    });

    if (!account) {
      throw new BadRequestException('Cuenta no encontrada');
    }

    // Return the user information
    return {
      id: user.id,
      email: user.email,
      height: account.height,
    };
  }

  /**
   * Update the height of the authenticated user
   * @param user the authenticated user
   * @param height the new height
   */
  async updateHeight(user: User, height: number) {
    // Get the account information from the database
    const account = await this.accountRepository.findOne({
      where: { userId: user.id },
    });

    if (!account) {
      throw new BadRequestException('Cuenta no encontrada');
    }

    // Update the height
    account.height = height;
    await this.accountRepository.save(account);
  }
}
