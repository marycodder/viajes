import { Param, ParseUUIDPipe } from '@nestjs/common';
export const Id = (name = 'id') => Param(name, new ParseUUIDPipe({ version: '4' }));
