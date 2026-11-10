import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PageQuery } from '../common/validation';
import { TripAccessService } from '../trips/trip-access.service';
import { CreateNoteDto, CreateRecommendationDto, UpdateNoteDto, UpdateRecommendationDto } from './documents.dto';
import { TripEvent, TripNote, TripRecommendation } from './schemas';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly access: TripAccessService,
    @InjectModel(TripNote.name) private readonly notes: Model<TripNote>,
    @InjectModel(TripRecommendation.name) private readonly recommendations: Model<TripRecommendation>,
    @InjectModel(TripEvent.name) private readonly events: Model<TripEvent>,
  ) {}

  async listNotes(tripId: string, userId: string, page: PageQuery) {
    await this.access.read(tripId, userId);
    return this.notes.find({ tripId }).sort({ createdAt: -1, _id: 1 }).skip(page.offset).limit(page.limit).lean().exec();
  }
  async createNote(tripId: string, userId: string, dto: CreateNoteDto) {
    await this.access.owner(tripId, userId);
    return this.notes.create({ ...dto, tripId, authorId: userId });
  }
  async updateNote(tripId: string, userId: string, id: string, dto: UpdateNoteDto) {
    await this.access.owner(tripId, userId);
    const note = await this.notes.findOneAndUpdate({ _id: id, tripId }, { $set: dto }, { new: true, runValidators: true }).lean().exec();
    if (!note) throw new NotFoundException('Nota no encontrada en este viaje.');
    return note;
  }
  async removeNote(tripId: string, userId: string, id: string) {
    await this.access.owner(tripId, userId);
    if (!(await this.notes.deleteOne({ _id: id, tripId }).exec()).deletedCount) throw new NotFoundException('Nota no encontrada.');
    return { deleted: true };
  }
  async listRecommendations(tripId: string, userId: string, page: PageQuery) {
    await this.access.read(tripId, userId);
    return this.recommendations.find({ tripId }).sort({ createdAt: -1, _id: 1 }).skip(page.offset).limit(page.limit).lean().exec();
  }
  async createRecommendation(tripId: string, userId: string, dto: CreateRecommendationDto) {
    await this.access.owner(tripId, userId);
    return this.recommendations.create({ ...dto, tripId, authorId: userId });
  }
  async updateRecommendation(tripId: string, userId: string, id: string, dto: UpdateRecommendationDto) {
    await this.access.owner(tripId, userId);
    const result = await this.recommendations.findOneAndUpdate({ _id: id, tripId }, { $set: dto }, { new: true, runValidators: true }).lean().exec();
    if (!result) throw new NotFoundException('Recomendación no encontrada en este viaje.');
    return result;
  }
  async removeRecommendation(tripId: string, userId: string, id: string) {
    await this.access.owner(tripId, userId);
    if (!(await this.recommendations.deleteOne({ _id: id, tripId }).exec()).deletedCount) throw new NotFoundException('Recomendación no encontrada.');
    return { deleted: true };
  }
  async listEvents(tripId: string, userId: string, page: PageQuery) {
    await this.access.read(tripId, userId);
    return this.events.find({ tripId }).sort({ occurredAt: -1, _id: 1 }).skip(page.offset).limit(page.limit).lean().exec();
  }
}
