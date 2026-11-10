import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    let status = 500;
    let message: string | string[] = 'Ocurrió un error interno. Intenta nuevamente.';
    if (error instanceof HttpException) {
      status = error.getStatus();
      const body = error.getResponse();
      message = typeof body === 'string' ? body : (body as { message?: string | string[] }).message || error.message;
    } else if (error instanceof QueryFailedError) {
      const code = (error.driverError as { code?: string }).code;
      if (code === '23505') { status = 409; message = 'El registro ya existe o entra en conflicto con otro.'; }
      if (code === '23503') { status = 409; message = 'Existen registros relacionados o la referencia no es válida.'; }
      if (code === '23514' || code === '23502' || code === '22003') { status = 400; message = 'Los datos no cumplen las restricciones de la operación.'; }
    }
    if (error instanceof Error && ['MongoNetworkError', 'MongooseServerSelectionError', 'MongoServerSelectionError', 'MongoNotConnectedError'].includes(error.name)) {
      status = 503; message = 'El servicio documental no está disponible. Intenta nuevamente.';
    }
    if (status === 500) this.logger.error(`Error interno: ${error instanceof Error ? error.name : 'UnknownError'}`);
    response.status(status).json({ statusCode: status, message, path: request.path, timestamp: new Date().toISOString() });
  }
}
