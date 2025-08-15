import {
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SoapAuthService } from './soap.auth.service';

@Controller('logic')
export class SoapAuthController {
  constructor(private readonly authService: SoapAuthService) {}

  @Post('GenerateSecurityToken')
  async generateSecurityToken(@Req() req: Request, @Res() res: Response) {
    try {
      // 1️ Get raw XML string from bodyParser
      const xmlData = req.body as string;

      // 2️ Parse XML to JS object
      const parsed = await this.authService.parseXml(xmlData);
      const { UserName, UserPassword } = parsed.Request;

      // 3️ Validate user from DB
      const user = await this.authService.validateUser(UserName, UserPassword);

      let returnCode = 1;
      let securityToken = '';

      if (user) {
        returnCode = 0;
        securityToken = await this.authService.generateToken(user);
      }

      // 4️ Build XML response
      const xmlResponse = this.authService.buildXmlResponse(
        returnCode,
        securityToken,
      );
      res.type('application/xml');
      res.send(xmlResponse);
    } catch (err) {
      const xmlResponse = this.authService.buildXmlResponse(1, '');
      res.type('application/xml');
      res.send(xmlResponse);
    }
  }
}
