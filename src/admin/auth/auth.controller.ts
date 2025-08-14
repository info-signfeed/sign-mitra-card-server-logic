import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    accessToken: string;
    companyId: number;
    userId: number;
    // roleId: number;
    roleName: string;
  }> {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const accessToken = await this.authService.generateToken(user);
    return {
      accessToken,
      companyId: user.companyId,
      userId: user.userId,
      //   roleId: user.roleId,
      roleName: user.roleName,
      // userType: user.userType,
    };
  }
}
