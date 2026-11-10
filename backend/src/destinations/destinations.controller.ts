import { Body, Controller, Delete, Get, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/auth.guard';
import { Id } from '../common/id.decorator';
import { CreateDestinationDto, DestinationQuery, UpdateDestinationDto } from './destinations.dto';
import { DestinationsService } from './destinations.service';

@ApiTags('Catálogo de destinos') @ApiBearerAuth() @Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinations: DestinationsService) {}
  @Get() @ApiOperation({ summary: 'Buscar destinos en el catálogo compartido' })
  list(@Query() query: DestinationQuery) { return this.destinations.list(query); }
  @Get(':id') @ApiOperation({ summary: 'Consultar un destino' })
  get(@Id() id: string) { return this.destinations.get(id); }
  @Post() @ApiOperation({ summary: 'Crear destino con coordenadas válidas' })
  create(@CurrentUser() user: string, @Body() dto: CreateDestinationDto) { return this.destinations.create(user, dto); }
  @Patch(':id') @ApiOperation({ summary: 'Editar un destino creado por mí' })
  update(@Id() id: string, @CurrentUser() user: string, @Body() dto: UpdateDestinationDto) { return this.destinations.update(id, user, dto); }
  @Delete(':id') @ApiOperation({ summary: 'Eliminar un destino propio que no esté asociado a viajes' })
  remove(@Id() id: string, @CurrentUser() user: string) { return this.destinations.remove(id, user); }
}
