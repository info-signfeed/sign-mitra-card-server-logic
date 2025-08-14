import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as xml2js from 'xml2js';
import * as bcrypt from 'bcrypt';

import { AuthUserEntity } from 'src/admin/Entity/AuthUserEntity';
import { UserRoleMasterEntity } from 'src/admin/Entity/UserRoleMasterEntity';

@Injectable()
export class SoapAuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(AuthUserEntity)
    private readonly authUserRepository: Repository<AuthUserEntity>,
    @InjectRepository(UserRoleMasterEntity)
    private readonly userRoleRepository: Repository<UserRoleMasterEntity>,
  ) {}

  // 🔹 Parse XML string to JS object
  async parseXml(xml: string): Promise<any> {
    return new Promise((resolve, reject) => {
      xml2js.parseString(
        xml,
        { explicitArray: false, trim: true },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        },
      );
    });
  }

  // 🔹 Validate user from DB
  async validateUser(username: string, password: string): Promise<any> {
    const userCheck = await this.authUserRepository.findOne({
      where: { username },
    });

    if (!userCheck) {
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('userCheck: ', userCheck);
    if (!userCheck.isActive) {
      throw new UnauthorizedException('User is not active');
    }

    const isPasswordValid = await bcrypt.compare(password, userCheck.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const role = await this.userRoleRepository.findOne({
      where: { id: userCheck.userRole },
    });

    return {
      id: userCheck.id,
      username: userCheck.username,
      companyId: userCheck.companyId,
      userId: userCheck.id,
      roleName: role?.roleName || '',
    };
  }

  // 🔹 Generate JWT token
  async generateToken(user: any): Promise<string> {
    const payload = {
      username: user.username,
      sub: user.id,
      companyId: user.companyId,
      roleName: user.roleName,
    };
    return this.jwtService.signAsync(payload);
  }

  // 🔹 Build XML string for response
  buildXmlResponse(returnCode: number, securityToken: string): string {
    const builder = new xml2js.Builder({
      headless: true,
      rootName: 'Response',
    });
    return builder.buildObject({
      ReturnCode: returnCode,
      SecurityToken: securityToken,
    });
  }
}
