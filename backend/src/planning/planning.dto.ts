import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';
import { DateOnly, Money, Optional, PageQuery, Text } from '../common/validation';

export class CreateDayDto {
  @ApiProperty() @IsUUID('4') destinationId: string;
  @ApiProperty({ example: '2026-12-11' }) @DateOnly() date: string;
  @ApiPropertyOptional() @Optional() @IsString() @MaxLength(150) title?: string;
}
export class UpdateDayDto extends PartialType(CreateDayDto, { skipNullProperties: false }) {}

export class CreateActivityDto {
  @ApiProperty() @IsUUID('4') dayId: string;
  @ApiProperty({ example: 'Cerro San Cristóbal' }) @Text(150) name: string;
  @ApiProperty({ example: 'Turismo' }) @Text(60) category: string;
  @ApiProperty({ example: '09:00', pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$' }) @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) time: string;
  @ApiPropertyOptional({ example: 5000 }) @Optional() @Money() estimatedCost?: number;
  @ApiPropertyOptional() @Optional() @IsString() @MaxLength(4000) description?: string;
  @ApiPropertyOptional({ enum: ['planned', 'completed', 'cancelled'] }) @Optional() @IsIn(['planned', 'completed', 'cancelled']) status?: 'planned' | 'completed' | 'cancelled';
}
export class UpdateActivityDto extends PartialType(CreateActivityDto, { skipNullProperties: false }) {}
export class ActivityQuery extends PageQuery {
  @ApiPropertyOptional() @Optional() @IsUUID('4') dayId?: string;
  @ApiPropertyOptional() @Optional() @Text(100) search?: string;
  @ApiPropertyOptional() @Optional() @Text(60) category?: string;
  @ApiPropertyOptional({ enum: ['planned', 'completed', 'cancelled'] }) @Optional() @IsIn(['planned', 'completed', 'cancelled']) status?: string;
}

export class CreateExpenseDto {
  @ApiProperty({ example: 'Entrada al museo' }) @Text(150) description: string;
  @ApiProperty({ example: 'Cultura' }) @Text(60) category: string;
  @ApiProperty({ example: '2026-12-11', description: 'Fecha del pago; puede ser anterior al viaje' }) @DateOnly() date: string;
  @ApiProperty({ example: 8000, minimum: 1 }) @Money(1) amount: number;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsUUID('4') activityId?: string | null;
  @ApiPropertyOptional({ description: 'Viajero que pagó. Por defecto, el propietario que registra el gasto.' }) @Optional() @IsUUID('4') paidBy?: string;
}
export class UpdateExpenseDto extends PartialType(CreateExpenseDto, { skipNullProperties: false }) {}

export class CreateReservationDto {
  @ApiProperty({ enum: ['accommodation', 'transport', 'activity', 'other'] }) @IsIn(['accommodation', 'transport', 'activity', 'other']) type: 'accommodation' | 'transport' | 'activity' | 'other';
  @ApiProperty({ example: 'Hotel de prueba' }) @Text(150) provider: string;
  @ApiPropertyOptional() @Optional() @IsString() @MaxLength(100) reference?: string;
  @ApiProperty({ example: '2026-12-10' }) @DateOnly() startDate: string;
  @ApiProperty({ example: '2026-12-17' }) @DateOnly() endDate: string;
  @ApiPropertyOptional() @Optional() @Money() estimatedCost?: number;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsUUID('4') activityId?: string | null;
  @ApiPropertyOptional({ enum: ['pending', 'confirmed', 'cancelled'] }) @Optional() @IsIn(['pending', 'confirmed', 'cancelled']) status?: 'pending' | 'confirmed' | 'cancelled';
}
export class UpdateReservationDto extends PartialType(CreateReservationDto, { skipNullProperties: false }) {}
