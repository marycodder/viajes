import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayUnique, IsArray, IsString, IsUrl, MaxLength } from 'class-validator';
import { Optional, Text } from '../common/validation';

export class CreateNoteDto {
  @ApiProperty({ example: 'Qué llevar' }) @Text(150) title: string;
  @ApiProperty({ example: 'Llevar agua y protector solar para el cerro.' }) @Text(10000) content: string;
  @ApiPropertyOptional({ type: [String], example: ['equipaje', 'turismo'] })
  @Optional() @IsArray() @ArrayMaxSize(20) @ArrayUnique() @IsString({ each: true }) @MaxLength(40, { each: true }) tags?: string[];
}
export class UpdateNoteDto extends PartialType(CreateNoteDto, { skipNullProperties: false }) {}
export class CreateRecommendationDto extends CreateNoteDto {
  @ApiPropertyOptional({ example: 'https://www.chile.travel/' }) @Optional() @IsUrl({ protocols: ['http', 'https'], require_protocol: true }) @MaxLength(2000) url?: string;
  @ApiPropertyOptional({ example: 'Gastronomía' }) @Optional() @Text(60) category?: string;
}
export class UpdateRecommendationDto extends PartialType(CreateRecommendationDto, { skipNullProperties: false }) {}
