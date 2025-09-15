import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class SignUpRequest {
  /** The user's email address. */
  @IsEmail()
  @IsNotEmpty()
  email: string;
  /** The user's password. */
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
  })
  @MaxLength(16)
  password: string;
  options?: {
    /** The redirect url embedded in the email link */
    emailRedirectTo?: string;
    /**
     * A custom data object to store the user's metadata. This maps to the `auth.users.raw_user_meta_data` column.
     *
     * The `data` should be a JSON object that includes user-specific info, such as their first and last name.
     */
    data?: object;
  };
}
