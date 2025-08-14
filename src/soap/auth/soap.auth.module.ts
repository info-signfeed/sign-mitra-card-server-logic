import { Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SoapAuthController } from './soap.auth.controller';
import { SoapAuthService } from './soap.auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';
import { jwtConfig } from './jwt.config';
import { AuthUserEntity } from 'src/admin/Entity/AuthUserEntity';
import { LocationMasterEntity } from 'src/admin/Entity/LocationMasterEntity';
import { UserRoleMasterEntity } from 'src/admin/Entity/UserRoleMasterEntity';

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
  controllers: [SoapAuthController],
  providers: [SoapAuthService, Logger, JwtStrategy],
  exports: [PassportModule, JwtModule],
})
export class SoapAuthModule {}
