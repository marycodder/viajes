import { CanActivate, createParamDecorator, ExecutionContext, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { isUUID } from 'class-validator';

export const Public = () => SetMetadata('public', true);
export type AuthRequest = Request & { user: { id: string } };
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<AuthRequest>().user.id);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly reflector: Reflector) {}
  async canActivate(context: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>('public', [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const [scheme, token] = (request.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException('Debes iniciar sesión y enviar un token Bearer.');
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token, { algorithms: ['HS256'], issuer: 'tripplan-api', audience: 'tripplan' });
      if (!isUUID(payload.sub)) throw new Error('Invalid subject');
      request.user = { id: payload.sub };
    } catch {
      throw new UnauthorizedException('La sesión es inválida o expiró. Inicia sesión nuevamente.');
    }
    return true;
  }
}
