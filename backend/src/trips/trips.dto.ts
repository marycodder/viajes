import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, IsUUID, MaxLength } from 'class-validator';
import { DateOnly, Money, Optional, Text } from '../common/validation';

export class CreateTripDto {
  @ApiProperty({ example: 'Semana en Santiago' }) @Text(150) name: string;
  @ApiPropertyOptional() @Optional() @IsString() @MaxLength(4000) description?: string;
  @ApiProperty({ example: '2026-12-10' }) @DateOnly() startDate: string;
  @ApiProperty({ example: '2026-12-17' }) @DateOnly() endDate: string;
  @ApiPropertyOptional({ example: 350000, description: 'Pesos chilenos enteros; moneda CLP' }) @Optional() @Money() budget?: number;
}
export class UpdateTripDto extends PartialType(CreateTripDto, { skipNullProperties: false }) {}
export class AddTravelerDto {
  @ApiProperty({ description: 'Correo de un usuario previamente registrado', example: 'acompanante@example.com' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail() @MaxLength(254) email: string;
}
export class AddDestinationDto {
  @ApiProperty() @IsUUID('4') destinationId: string;
}
