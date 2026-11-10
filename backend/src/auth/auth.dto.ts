import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, IsStrongPassword, MaxLength, MinLength } from 'class-validator';
import { Text } from '../common/validation';

export class RegisterDto {
  @ApiProperty({ example: 'Viajero de prueba' }) @Text(100) name: string;
  @ApiProperty({ example: 'viajero@example.com' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail() @MaxLength(254) email: string;
  @ApiProperty({ minLength: 10, maxLength: 72, example: 'ViajesDemo2026', writeOnly: true })
  @IsString() @MaxLength(72)
  @IsStrongPassword({ minLength: 10, minUppercase: 0, minLowercase: 1, minNumbers: 1, minSymbols: 0 }) password: string;
}

export class LoginDto extends PickType(RegisterDto, ['email'] as const) {
  @ApiProperty({ writeOnly: true }) @IsString() @MinLength(1) @MaxLength(72) password: string;
}

export class UpdateProfileDto extends PartialType(PickType(RegisterDto, ['name'] as const), { skipNullProperties: false }) {}
