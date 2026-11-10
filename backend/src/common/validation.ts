import { applyDecorators, BadRequestException } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsISO8601, IsNotEmpty, IsString, Matches, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const Optional = () => ValidateIf((_object, value) => value !== undefined);
export const Text = (max = 150) => applyDecorators(
  Transform(({ value }) => typeof value === 'string' ? value.trim() : value),
  IsString(), IsNotEmpty(), MaxLength(max),
);
export const DateOnly = () => applyDecorators(IsISO8601({ strict: true }), Matches(/^\d{4}-\d{2}-\d{2}$/));
export const Money = (min = 0) => applyDecorators(IsInt(), Min(min), Max(1_000_000_000_000));

export class PageQuery {
  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 100 })
  @Optional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 50;
  @ApiPropertyOptional({ default: 0, minimum: 0, maximum: 1000000 })
  @Optional() @Type(() => Number) @IsInt() @Min(0) @Max(1_000_000) offset = 0;
}

export function assertDateRange(start: string, end: string) {
  if (end < start) throw new BadRequestException('La fecha de término debe ser igual o posterior a la de inicio.');
}

export function assertWithinTrip(date: string, trip: { startDate: string; endDate: string }) {
  if (date < trip.startDate || date > trip.endDate) {
    throw new BadRequestException('La fecha debe estar dentro del período del viaje.');
  }
}
