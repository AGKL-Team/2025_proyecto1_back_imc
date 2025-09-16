import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsStrongPassword,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class SignUpRequest {
  /** The user's email address. */
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  /** The user's password. */
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
  })
  @MaxLength(16)
  password: string;

  /** The user's password confirmation. Must match the password field. */
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(16)
  confirmPassword: string;

  /** The user's height in meters. */
  @IsNotEmpty()
  @IsNumber(
    { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 },
    { message: 'Height must be a number with up to 2 decimal places' },
  )
  @Min(0.1, { message: 'Height must be at least 0.1 meters' })
  @Max(3, { message: 'Height must be at most 3 meters' })
  height: number;

  /** Additional options for the sign-up process. */
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
