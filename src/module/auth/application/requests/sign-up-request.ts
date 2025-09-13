import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignUpRequest {
  /** The user's email address. */
  @IsEmail()
  @IsNotEmpty()
  email: string;
  /** The user's password. */
  @IsNotEmpty()
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
