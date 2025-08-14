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
      cardType: requestData.CustomerTypeCode,
      termsAccepted: true,
      storeCode: requestData.StoreCode,

      status: true,
      SecurityToken: requestData.SecurityToken,
      // userId: 0, // you might decode from token or set from auth
      // companyId: 0, // same as above
    };

    // Step 3: Call your existing JSON-based function
    const result =
      await this._accountService.registerCustomer(registerCustomerDto);

    console.log('result: ', result);

    const returnCode = result.status === 200 ? 0 : 299; // Example: map based on your logic
    const returnMessage = result.message;

    // Step 5: Convert result to XML response
    const xmlResponse = {
      Response: {
        ReturnCode: returnCode,
        ReturnMessage: returnMessage,
        SmsStatus: result.status === 200 ? 0 : -1,
        EmailStatus: 0,
        TPEnrollStatus: result.status === 200 ? 1 : 0,
      },
    };

    const builder = new xml2js.Builder({ headless: true });
    return builder.buildObject(xmlResponse);
  }
  @Post('search-customer-xml')
  async searchCustomerXml(@Body() body: string) {
    // Step 1: Parse XML to JS object
    const parsed = await xml2js.parseStringPromise(body, {
      explicitArray: false,
    });
    const requestData = parsed?.Request || {};

    // Step 2: Map XML fields to DTO
    const searchCustomerDto = {
      number: requestData.Number ? Number(requestData.Number) : undefined,
      storeCode: requestData.StoreCode,
      SecurityToken: requestData.SecurityToken,
    };

    // Step 3: Call your existing JSON-based function
    const result = await this._accountService.SearchCustomer(searchCustomerDto);

    // Step 4: Error Code Mapping
    const errorCodeMap: Record<number, string> = {
      0: 'Success',
      125: 'Input parameters are not provided correctly.',
      404: 'Customer not found.',
    };
    const status = (result as any).status;
    const returnCode = status === 200 ? 0 : 404;

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
