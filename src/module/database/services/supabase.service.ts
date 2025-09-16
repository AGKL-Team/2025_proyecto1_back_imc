import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthError, createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../../../config/supabase.config';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseConfig = this.configService.get<SupabaseConfig>('supabase');

    if (!supabaseConfig?.url)
      throw new Error('SUPABASE_URL must be defined in configuration');
    if (!supabaseConfig?.key)
      throw new Error('SUPABASE_KEY must be defined in configuration');

    this.supabase = createClient(supabaseConfig.url, supabaseConfig.key);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  handleError(error: AuthError) {
    switch (error.code) {
      case 'user_already_exists':
        throw new BadRequestException('El usuario ya existe');
      case 'invalid_email':
        throw new BadRequestException('El correo electrónico no es válido');
      case 'invalid_password':
        throw new BadRequestException('La contraseña no es válida');
      case 'invalid_credentials':
        throw new BadRequestException('Las credenciales son inválidas');
      default:
        throw new BadRequestException(
          'Ocurrió un error inesperado. Inténtalo de nuevo más tarde.' +
            error.code,
        );
    }
  }
}
