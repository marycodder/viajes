import { Module } from '@nestjs/common';
import { TripAccessService } from './trip-access.service';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
@Module({ controllers: [TripsController], providers: [TripsService, TripAccessService], exports: [TripAccessService] })
export class TripsModule {}
