import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Destination } from '../database/entities';
import { CreateDestinationDto, DestinationQuery, UpdateDestinationDto } from './destinations.dto';

@Injectable()
export class DestinationsService {
  constructor(private readonly db: DataSource) {}
  list(query: DestinationQuery) {
    const builder = this.db.getRepository(Destination).createQueryBuilder('destination');
    if (query.search) builder.andWhere('(destination.name ILIKE :search OR destination.region ILIKE :search)', { search: `%${query.search.replace(/[\\%_]/g, '\\$&')}%` });
    if (query.country) builder.andWhere('LOWER(destination.country) = LOWER(:country)', { country: query.country });
    return builder.orderBy('destination.name', 'ASC').addOrderBy('destination.id', 'ASC').take(query.limit).skip(query.offset).getMany();
  }
  async get(id: string) {
    const destination = await this.db.manager.findOneBy(Destination, { id });
    if (!destination) throw new NotFoundException('Destino no encontrado.');
    return destination;
  }
  create(userId: string, dto: CreateDestinationDto) { return this.db.getRepository(Destination).save({ ...dto, createdBy: userId }); }
  async update(id: string, userId: string, dto: UpdateDestinationDto) {
    const destination = await this.get(id);
    if (destination.createdBy !== userId) throw new ForbiddenException('Solo el creador puede editar este destino del catálogo.');
    return this.db.getRepository(Destination).save(Object.assign(destination, dto));
  }
  async remove(id: string, userId: string) {
    const destination = await this.get(id);
    if (destination.createdBy !== userId) throw new ForbiddenException('Solo el creador puede eliminar este destino del catálogo.');
    await this.db.getRepository(Destination).remove(destination);
    return { deleted: true };
  }
}
