import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Connection } from 'mysql2';
import { Repository } from 'typeorm';
import { AuthUserEntity } from '../Entity/AuthUserEntity';
import * as bcrypt from 'bcrypt';
import { LocationMasterEntity } from '../Entity/LocationMasterEntity';
import { UserRoleMasterEntity } from '../Entity/UserRoleMasterEntity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectDataSource() private readonly connection: Connection,
    @InjectRepository(AuthUserEntity)
    private readonly AuthUserRepository: Repository<AuthUserEntity>,
    @InjectRepository(UserRoleMasterEntity)
    private readonly UserRoleMasterEntityRepository: Repository<UserRoleMasterEntity>,
    @InjectRepository(LocationMasterEntity)
    private readonly LocationMasterRepository: Repository<LocationMasterEntity>,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const userCheck = await this.AuthUserRepository.findOne({
      where: { username },
    });

    if (!userCheck) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!userCheck.isActive) {
      throw new UnauthorizedException('User is not active');
    }

    const isPasswordValid = await bcrypt.compare(password, userCheck.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const role = await this.UserRoleMasterEntityRepository.findOne({
      where: { id: userCheck.userRole },
    });
    return {
      id: userCheck.id,
      username: userCheck.username,
      companyId: userCheck.companyId,
      userId: userCheck.id,
      //   roleId: userCheck.userRole,
      roleName: role.roleName,
      // userType: userCheck.userType,
    };
  }

  async generateToken(user: any): Promise<string> {
    const payload = {
      username: user.username,
      sub: user.id,
      companyId: user.companyId,
      roleName: user.roleName,
      //   roleId: user.roleId,
    };
    return this.jwtService.signAsync(payload);
  }
}
