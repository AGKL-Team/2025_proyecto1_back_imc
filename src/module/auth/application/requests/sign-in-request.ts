import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SignInRequest {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(16)
  password: string;
}
