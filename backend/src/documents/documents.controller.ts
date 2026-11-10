import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, PipeTransform, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/auth.guard';
import { Id } from '../common/id.decorator';
import { PageQuery } from '../common/validation';
import { CreateNoteDto, CreateRecommendationDto, UpdateNoteDto, UpdateRecommendationDto } from './documents.dto';
import { DocumentsService } from './documents.service';

export class MongoIdPipe implements PipeTransform<string> {
  transform(value: string) {
    if (!/^[a-f\d]{24}$/i.test(value)) throw new BadRequestException('El identificador documental debe ser un ObjectId de MongoDB.');
    return value;
  }
}

@ApiTags('Notas, recomendaciones e historial (MongoDB)') @ApiBearerAuth() @Controller('trips/:tripId')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}
  @Get('notes') @ApiOperation({ summary: 'Consultar notas persistidas en MongoDB' })
  notes(@Id('tripId') trip: string, @CurrentUser() user: string, @Query() page: PageQuery) { return this.documents.listNotes(trip, user, page); }
  @Post('notes') @ApiOperation({ summary: 'Guardar nota con contenido y etiquetas en MongoDB' })
  createNote(@Id('tripId') trip: string, @CurrentUser() user: string, @Body() dto: CreateNoteDto) { return this.documents.createNote(trip, user, dto); }
  @Patch('notes/:id') @ApiOperation({ summary: 'Editar una nota del viaje' })
  updateNote(@Id('tripId') trip: string, @CurrentUser() user: string, @Param('id', MongoIdPipe) id: string, @Body() dto: UpdateNoteDto) { return this.documents.updateNote(trip, user, id, dto); }
  @Delete('notes/:id') @ApiOperation({ summary: 'Eliminar una nota' })
  removeNote(@Id('tripId') trip: string, @CurrentUser() user: string, @Param('id', MongoIdPipe) id: string) { return this.documents.removeNote(trip, user, id); }
  @Get('recommendations') @ApiOperation({ summary: 'Consultar recomendaciones guardadas; no se generan con IA' })
  recommendations(@Id('tripId') trip: string, @CurrentUser() user: string, @Query() page: PageQuery) { return this.documents.listRecommendations(trip, user, page); }
  @Post('recommendations') @ApiOperation({ summary: 'Guardar recomendación manual con contenido, etiquetas y enlace opcional' })
  createRecommendation(@Id('tripId') trip: string, @CurrentUser() user: string, @Body() dto: CreateRecommendationDto) { return this.documents.createRecommendation(trip, user, dto); }
  @Patch('recommendations/:id') @ApiOperation({ summary: 'Editar una recomendación' })
  updateRecommendation(@Id('tripId') trip: string, @CurrentUser() user: string, @Param('id', MongoIdPipe) id: string, @Body() dto: UpdateRecommendationDto) { return this.documents.updateRecommendation(trip, user, id, dto); }
  @Delete('recommendations/:id') @ApiOperation({ summary: 'Eliminar una recomendación' })
  removeRecommendation(@Id('tripId') trip: string, @CurrentUser() user: string, @Param('id', MongoIdPipe) id: string) { return this.documents.removeRecommendation(trip, user, id); }
  @Get('events') @ApiOperation({ summary: 'Consultar historial; los eventos SQL se entregan de forma eventual e idempotente' })
  events(@Id('tripId') trip: string, @CurrentUser() user: string, @Query() page: PageQuery) { return this.documents.listEvents(trip, user, page); }
}
