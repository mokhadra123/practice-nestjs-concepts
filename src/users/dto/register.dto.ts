import {
  IsEmail,
  MaxLength,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  Length,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @MaxLength(150)
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsOptional()
  @Length(2, 150)
  username!: string;
}
