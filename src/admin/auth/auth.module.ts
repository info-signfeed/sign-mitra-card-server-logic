import { Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';
import { jwtConfig } from './jwt.config';
import { AuthUserEntity } from '../Entity/AuthUserEntity';
import { LocationMasterEntity } from '../Entity/LocationMasterEntity';
import { UserRoleMasterEntity } from '../Entity/UserRoleMasterEntity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register(jwtConfig),
    TypeOrmModule.forFeature([
      AuthUserEntity,
      LocationMasterEntity,
      UserRoleMasterEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, Logger, JwtStrategy],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
