import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsLatitude, IsLongitude, IsNumber, IsString, MaxLength } from 'class-validator';
import { Optional, PageQuery, Text } from '../common/validation';

export class CreateDestinationDto {
  @ApiProperty({ example: 'Santiago' }) @Text(120) name: string;
  @ApiProperty({ example: 'Chile' }) @Text(100) country: string;
  @ApiPropertyOptional({ example: 'Metropolitana' }) @Optional() @IsString() @MaxLength(100) region?: string;
  @ApiPropertyOptional() @Optional() @IsString() @MaxLength(4000) description?: string;
  @ApiProperty({ example: -33.4489 }) @IsNumber() @IsLatitude() latitude: number;
  @ApiProperty({ example: -70.6693 }) @IsNumber() @IsLongitude() longitude: number;
}
export class UpdateDestinationDto extends PartialType(CreateDestinationDto, { skipNullProperties: false }) {}
export class DestinationQuery extends PageQuery {
  @ApiPropertyOptional({ description: 'Buscar por nombre o región' }) @Optional() @Text(100) search?: string;
  @ApiPropertyOptional() @Optional() @Text(100) country?: string;
}
