import {
  Controller,
  Get,
  UseGuards,
  Logger,
  Inject,
  Query,
  ValidationPipe,
  UsePipes,
  Req,
  Param,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/admin/auth/jwt-auth.guard';
import { AccountService } from './account.service';
import * as xml2js from 'xml2js';
@Controller('account')
export class AccountController {
  constructor(
    private readonly _accountService: AccountService,
    @Inject(Logger) private readonly logger: Logger,
    @Inject(Request) private readonly req: Request,
  ) {}
  @Post('register-customer-xml')
  // @UseGuards(JwtAuthGuard)
  async registerCustomerXml(@Req() req: any, @Body() body: string) {
    // Step 1: Parse XML to JS object
    const parsed = await xml2js.parseStringPromise(body, {
      explicitArray: false,
    });
    const requestData = parsed?.Request || {};

    // Step 2: Map XML fields to DTO
    const registerCustomerDto = {
      mobileNumber: requestData.MobileNo,
      cardNumber: requestData.MemberShipCardNumber || null,
      planId: requestData.PlanId || null,
      customerName: requestData.FirstName,
      customerEmail: requestData.EmailId || null,
      gender: requestData.Gender,
      birthDate: requestData.BirthDate || null,
      anniversaryDate: requestData.AnniversaryDate || null,
      cardType: requestData.CustomerTypeCode === 'Loyalty' ? 2 : 1,
      termsAccepted: true,
      storeCode: requestData.StoreCode,
      userId: 3,
      companyId: 9,
      status: true,
    };

    // Step 3: Call your existing JSON-based function
    const result = await this._accountService.registerCustomer(
      req,
      registerCustomerDto,
    );

    console.log('result: ', result);
    // Step 4: Error Code Mapping
    const errorCodeMap: Record<number, string> = {
      0: 'Success',
      125: 'Input parameters are not provided correctly.',
      247: 'Membership card number missed.',
      186: 'Membership card number verification failed.',
    };
    const returnCode = result.status === 200 ? 0 : 299; // Example: map based on your logic
    const returnMessage = errorCodeMap[returnCode] || 'Unknown error';

    // Step 5: Convert result to XML response
    const xmlResponse = {
      Response: {
        ReturnCode: returnCode,
        ReturnMessage: returnMessage,
        SmsStatus: result.status === 200 ? 0 : -1,
        EmailStatus: 0,
        TPEnrollStatus: result.status === 200 ? 1 : 0,
        // MemberShipNumber: result.membershipNumber || '',
        // BonusPoints: result.points || 0,
      },
    };

    const builder = new xml2js.Builder({ headless: true });
    return builder.buildObject(xmlResponse);
  }
  @Post('search-customer-xml')
  // @UseGuards(JwtAuthGuard)
  async searchCustomerXml(@Req() req: any, @Body() body: string) {
    // Step 1: Parse XML to JS object
    const parsed = await xml2js.parseStringPromise(body, {
      explicitArray: false,
    });
    const requestData = parsed?.Request || {};

    // Step 2: Map XML fields to DTO
    const searchCustomerDto = {
      number: requestData.Number ? Number(requestData.Number) : undefined,
      storeCode: requestData.StoreCode,
    };

    // Step 3: Call your existing JSON-based function
    const result = await this._accountService.SearchCustomer(
      searchCustomerDto,
      req,
    );

    // Step 4: Error Code Mapping
    const errorCodeMap: Record<number, string> = {
      0: 'Success',
      125: 'Input parameters are not provided correctly.',
      404: 'Customer not found.',
    };

    const returnCode = result.status === 200 ? 0 : 404; // Example logic
    const returnMessage = errorCodeMap[returnCode] || 'Unknown error';

    // Step 5: Convert result to XML response
    const xmlResponse = {
      Response: {
        ReturnCode: returnCode,
        ReturnMessage: returnMessage,
        Customer: result || {},
      },
    };

    const builder = new xml2js.Builder({ headless: true });
    return builder.buildObject(xmlResponse);
  }
}
