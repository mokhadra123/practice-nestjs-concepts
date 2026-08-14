import {
  IsEmail,
  MaxLength,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
export class LoginDto {
  @IsEmail()
  @MaxLength(150)
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password!: string;
}
