import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'trip_notes', timestamps: true, versionKey: false })
export class TripNote {
  @Prop({ required: true, index: true }) tripId: string;
  @Prop({ required: true }) authorId: string;
  @Prop({ required: true, maxlength: 150 }) title: string;
  @Prop({ required: true, maxlength: 10000 }) content: string;
  @Prop({ type: [String], default: [] }) tags: string[];
}
export const TripNoteSchema = SchemaFactory.createForClass(TripNote);
TripNoteSchema.index({ tripId: 1, createdAt: -1, _id: 1 });

@Schema({ collection: 'trip_recommendations', timestamps: true, versionKey: false })
export class TripRecommendation {
  @Prop({ required: true, index: true }) tripId: string;
  @Prop({ required: true }) authorId: string;
  @Prop({ required: true, maxlength: 150 }) title: string;
  @Prop({ required: true, maxlength: 10000 }) content: string;
  @Prop({ maxlength: 2000 }) url?: string;
  @Prop({ maxlength: 60 }) category?: string;
  @Prop({ type: [String], default: [] }) tags: string[];
}
export const TripRecommendationSchema = SchemaFactory.createForClass(TripRecommendation);
TripRecommendationSchema.index({ tripId: 1, createdAt: -1, _id: 1 });

@Schema({ collection: 'trip_events', timestamps: false, versionKey: false })
export class TripEvent {
  @Prop({ required: true, unique: true }) eventId: string;
  @Prop({ required: true }) tripId: string;
  @Prop({ required: true }) actorId: string;
  @Prop({ required: true }) action: string;
  @Prop({ type: Object, default: {} }) metadata: Record<string, unknown>;
  @Prop({ required: true }) occurredAt: Date;
}
export const TripEventSchema = SchemaFactory.createForClass(TripEvent);
TripEventSchema.index({ tripId: 1, occurredAt: -1, _id: 1 });

export const DOCUMENT_MODELS = [
  { name: TripNote.name, schema: TripNoteSchema },
  { name: TripRecommendation.name, schema: TripRecommendationSchema },
  { name: TripEvent.name, schema: TripEventSchema },
];
