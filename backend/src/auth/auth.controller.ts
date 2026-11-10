import { Body, Controller, Get, HttpCode, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser, Public } from './auth.guard';
import { LoginDto, RegisterDto, UpdateProfileDto } from './auth.dto';
import { AuthService } from './auth.service';

@ApiTags('Autenticación y usuarios')
@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Public() @Post('auth/register') @Throttle({ default: { limit: 8, ttl: 60000 } })
  @ApiOperation({ summary: 'Registrar usuario y obtener token de una hora' })
  register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  @Public() @Post('auth/login') @HttpCode(200) @Throttle({ default: { limit: 8, ttl: 60000 } })
  @ApiOperation({ summary: 'Iniciar sesión' })
  login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  @ApiBearerAuth() @Get('users/me') @ApiOperation({ summary: 'Consultar mi perfil' })
  profile(@CurrentUser() userId: string) { return this.auth.profile(userId); }
  @ApiBearerAuth() @Patch('users/me') @ApiOperation({ summary: 'Actualizar mi nombre' })
  updateProfile(@CurrentUser() userId: string, @Body() dto: UpdateProfileDto) { return this.auth.updateProfile(userId, dto); }
}
