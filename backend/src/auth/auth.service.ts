import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../database/entities';
import { LoginDto, RegisterDto, UpdateProfileDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>, private readonly jwt: JwtService) {}

  async register(dto: RegisterDto) {
    if (Buffer.byteLength(dto.password, 'utf8') > 72) throw new BadRequestException('La contraseña no puede superar 72 bytes UTF-8.');
    if (await this.users.existsBy({ email: dto.email })) throw new ConflictException('Ese correo ya está registrado.');
    const user = await this.users.save(this.users.create({ name: dto.name, email: dto.email, passwordHash: await hash(dto.password, 12) }));
    return this.session(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.createQueryBuilder('user').addSelect('user.passwordHash').where('user.email = :email', { email: dto.email }).getOne();
    const valid = await compare(dto.password, user?.passwordHash || '$2b$12$UnAEQXyqXHeFXJSqTzGjIe7Bc31Q9iPhUKwvTrsWTPQaUFkUprso6');
    if (!user || !valid || Buffer.byteLength(dto.password, 'utf8') > 72) throw new UnauthorizedException('Correo o contraseña incorrectos.');
    return this.session(user);
  }

  async profile(id: string) {
    const user = await this.users.findOneBy({ id });
    if (!user) throw new NotFoundException('El usuario ya no existe.');
    return user;
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.profile(id);
    return this.users.save(Object.assign(user, dto));
  }

  private async session(user: User) {
    return { accessToken: await this.jwt.signAsync({ sub: user.id }), tokenType: 'Bearer', expiresIn: 3600,
      user: { id: user.id, name: user.name, email: user.email } };
  }
}
