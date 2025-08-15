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
import * as xmlbuilder from 'xmlbuilder';
@Controller('account')
export class AccountController {
  constructor(
    private readonly _accountService: AccountService,
    @Inject(Logger) private readonly logger: Logger,
    @Inject(Request) private readonly req: Request,
  ) {}
  @Post('RegisterAccount')
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
  @Post('SearchMember')
  async searchCustomerXml(@Body() body: string) {
    // Step 1: Parse XML
    const parsed = await xml2js.parseStringPromise(body, {
      explicitArray: false,
    });
    const requestData = parsed?.Request || {};

    const searchCustomerDto = {
      number: requestData.Number ? Number(requestData.Number) : undefined,
      storeCode: requestData.StoreCode,
      SecurityToken: requestData.SecurityToken,
    };

    // Step 2: Get result from your existing JSON service
    const result: any =
      await this._accountService.SearchCustomer(searchCustomerDto);

    // Step 3: Map values
    const customer = result?.customer || {};
    const purchasedPlan = result?.purchasedPlan || {};

    const accrualPoints =
      customer.cardType == 1
        ? purchasedPlan.pendingPoint || 0
        : result.totalLoyaltyPoints || 0;

    // Step 4: Build response in required format
    const memberResponse = {
      ReturnCode: 0,
      FirstName: customer.customerName || '',
      LastName: '', // You don't have last name in your JSON
      Email: customer.customerEmail || '',
      Mobile: customer.mobileNumber || '',
      ClientID: '',
      DateOfBirth: customer.birthDate || '',
      RecordCount: 1,
      Title: '',
      AccrualPoints: accrualPoints,
      MembershipCardNumber: customer.cardNumber || '',
      ReturnMessage: 'Success.',
      CurrentTier: '',
      StoreCustomerId: customer.id || '',
      EndDate: '',
      EnrollDate: '', // map if you have it
      TierEndDate: '',
      TierStartDate: '',
      TotalPointsRedeemed: '',
      TotalSpends: '',
      Address1: '',
      Address2: '',
      CustomerType: '',
      TotalVisits: '',
      TotalPointsAccrued: '',
      TotalPointsLapsed: '',
      ReferralPoints: '',
      ReferredCount: '',
      RemainingReferrals: '',
      ReferralCode: '',
      MobileCountryCode: '91',
      PinCode: '',
      Gender: customer.gender || '',
      ChildName: '',
      AnniversaryDate: customer.anniversaryDate || '',
      ChildDOB: '',
      MigratedVisits: '',
      MigratedSpends: '',
      LastMigrationDate: '',
      LifeTimeATV: '',
      UAEResident: '',
      Nationality: '',
      EmirateResidence: '',
      CompanyName: '',
      PANNo: '',
    };

    // Step 5: Convert to XML
    const xmlResponse = {
      ArrayOfMemberResponse: {
        MemberResponse: memberResponse,
      },
    };

    const builder = new xml2js.Builder({
      headless: true,
      rootName: 'ArrayOfMemberResponse',
    });
    return builder.buildObject(xmlResponse);
  }

  @Post('CustomerAvailablePoints')
  async availableCustomerXml(@Body() body: string) {
    const parsed = await xml2js.parseStringPromise(body, {
      explicitArray: false,
    });
    const requestData = parsed?.Request || {};

    const searchDto = {
      number: requestData.MemID ? Number(requestData.MemID) : undefined,
      storeCode: requestData.StoreCode,
      SecurityToken: requestData.SecurityToken,
    };

    const result = await this._accountService.SearchCustomerPoint(searchDto);

    // If error from service
    if (result.error) {
      const errorResponse = {
        Response: {
          ReturnCode: result.errorCode,
          ReturnMessage: result.errorMessage,
        },
      };
      return new xml2js.Builder({ headless: true }).buildObject(errorResponse);
    }

    const { availablePoints, pointRate, pointValue, partnerName, memId } =
      result;

    const xmlResponse = {
      Response: {
        ReturnCode: 0,
        AvailablePoints: availablePoints,
        ReferralPoints: 0,
        ReturnMessage: 'Success.',
        PartnerName: partnerName,
        MemId: memId || '',
        PointValue: '',
        PointRate: '',
      },
    };

    return new xml2js.Builder({ headless: true }).buildObject(xmlResponse);
  }
  @Post('CheckForPointsRedemption')
  async redeemXml(@Body() body: string) {
    const parsed = await xml2js.parseStringPromise(body, {
      explicitArray: false,
    });
    const requestData = parsed?.Request || {};

    const memId = requestData.MemID;
    const memPoints = Number(requestData.MemPoints) || 0;
    const amount = Number(requestData.Amount) || 0;

    // Detect mobile vs card
    const mobileNumber = /^\d{10}$/.test(memId) ? Number(memId) : undefined;
    const cardNumber = /^\d{12,16}$/.test(memId) ? Number(memId) : undefined;

    // Step 1: Check points first
    const searchResult = await this._accountService.SearchCustomerPoint({
      SecurityToken: requestData.SecurityToken,
      number: mobileNumber || cardNumber,
      storeCode: requestData.StoreCode,
    });

    if (searchResult.error) {
      // Return XML error immediately
      const xmlError = {
        Response: {
          ReturnCode: searchResult.errorCode,
          ReturnMessage: searchResult.errorMessage,
        },
      };
      return new xml2js.Builder({ headless: true }).buildObject(xmlError);
    }

    if (searchResult.availablePoints <= 0) {
      const xmlError = {
        Response: {
          ReturnCode: 406,
          ReturnMessage: 'Not enough points to redeem',
        },
      };
      return new xml2js.Builder({ headless: true }).buildObject(xmlError);
    }

    // Step 2: Proceed with sending OTP
    const dto = {
      mobileNumber,
      cardNumber,
      storeCode: requestData.StoreCode,
      value: amount,
      redeemValue: memPoints,
    };

    const result = await this._accountService.sendOtpAndPrepareRedemption(
      dto.mobileNumber,
      dto.storeCode,
      dto,
    );

    // Step 3: Build success XML
    const xmlResponse = {
      Response: {
        ReturnCode: result.status === 200 ? 0 : result.status,
        MemPoints: memPoints,
        CashWorthPoints: memPoints * 0.5,
        BalanceToPay: Math.max(0, amount - memPoints * 0.5),
        BillAmountPoints: '',
        IsPointsPlusCash: true,
        ReturnMessage: result.message || 'Success.',
        Vouchers: '',
        BillNo: requestData.TransactionCode || '',
        IsRedeemWithOutOTP: false,
      },
    };

    return new xml2js.Builder({ headless: true }).buildObject(xmlResponse);
  }

  @Post('ResendOTP')
  async resendOtpXml(@Body() body: string) {
    const parsed = await xml2js.parseStringPromise(body, {
      explicitArray: false,
    });
    const requestData = parsed?.Request || {};

    const memId = requestData.MemID;
    const memPoints = Number(requestData.MemPoints) || 0;
    const amount = Number(requestData.Amount) || 0;

    // Detect mobile vs card
    const mobileNumber = /^\d{10}$/.test(memId) ? Number(memId) : undefined;
    const cardNumber = /^\d{12,16}$/.test(memId) ? Number(memId) : undefined;

    // Step 1: Check points first
    const searchResult = await this._accountService.SearchCustomerPoint({
      SecurityToken: requestData.SecurityToken,
      number: mobileNumber || cardNumber,
      storeCode: requestData.StoreCode,
    });

    if (searchResult.error) {
      // Return XML error immediately
      const xmlError = {
        Response: {
          ReturnCode: searchResult.errorCode,
          ReturnMessage: searchResult.errorMessage,
        },
      };
      return new xml2js.Builder({ headless: true }).buildObject(xmlError);
    }

    if (searchResult.availablePoints <= 0) {
      const xmlError = {
        Response: {
          ReturnCode: 406,
          ReturnMessage: 'Not enough points to redeem',
        },
      };
      return new xml2js.Builder({ headless: true }).buildObject(xmlError);
    }

    // Step 2: Proceed with sending OTP
    const dto = {
      mobileNumber,
      cardNumber,
      storeCode: requestData.StoreCode,
      value: amount,
      redeemValue: memPoints,
    };

    const result = await this._accountService.sendOtpAndPrepareRedemption(
      dto.mobileNumber,
      dto.storeCode,
      dto,
    );

    // Step 3: Build success XML
    const xmlResponse = {
      Response: {
        ReturnCode: result.status === 200 ? 0 : result.status,
        MemPoints: memPoints,
        CashWorthPoints: memPoints * 0.5,
        BalanceToPay: Math.max(0, amount - memPoints * 0.5),
        BillAmountPoints: '',
        IsPointsPlusCash: true,
        ReturnMessage: result.message || 'Success.',
        Vouchers: '',
        BillNo: requestData.TransactionCode || '',
        IsRedeemWithOutOTP: false,
      },
    };

    return new xml2js.Builder({ headless: true }).buildObject(xmlResponse);
  }

  @Post('ConfirmOTP')
  async verifyOtpOnlyXml(@Body() body: any) {
    const xml = body.toString();
    const parsed = await xml2js.parseStringPromise(xml, {
      explicitArray: false,
    });

    const request = parsed?.Request;
    if (!request) throw new BadRequestException('Invalid XML structure.');

    const memId = request.MemID;
    const otp = request.SmsCode;

    const result = await this._accountService.verifyOtpOnly(memId, otp);

    let xmlResponse;

    if (result.success) {
      xmlResponse = {
        Response: {
          ReturnCode: 0,
          ReturnMessage: 'Success.',
        },
      };
    } else {
      xmlResponse = {
        Response: {
          ReturnCode: 365,
          ReturnMessage: 'Invalid OTP.',
        },
      };
    }

    return new xml2js.Builder({ headless: true }).buildObject(xmlResponse);
  }

  @Post('ConfirmPointsRedemption')
  async verifyOtpAndRedeemXml(@Body() body: any) {
    const xml = body.toString();
    const parsed = await xml2js.parseStringPromise(xml, {
      explicitArray: false,
    });
    const request = parsed?.Request;
    if (!request) throw new BadRequestException('Invalid XML structure.');

    const {
      StoreCode: storeCode,
      MemID: memId,
      SmsCode: otp,
      SecurityToken: securityToken,
    } = request;

    const result = await this._accountService.verifyOtpAndRedeemXml(
      storeCode,
      memId,
      otp,
      securityToken,
    );

    let xmlResponse;
    if (result.status === 200) {
      xmlResponse = {
        Response: {
          ReturnCode: 0,
          PointsEarned: result.topupValue ?? 0,
          SmsStatus: 0,
          EmailStatus: 0,
          TPEnrollStatus: 0,
          EREnrollStatus: 0,
          ProgramStatus: 0,
          BonusPoints: 0,
          CCIPoints: 0,
          ReturnMessage: result.message,
          RedemptionId: 0,
          EOSSPoints: 0,
          NonEOSSPoints: 0,
          Vouchers: '',
          OfferModeId: 0,
        },
      };
    } else {
      xmlResponse = {
        Response: {
          ReturnCode: result.status,
          ReturnMessage: result.message,
        },
      };
    }

    return new xml2js.Builder({ headless: true }).buildObject(xmlResponse);
  }

  @Post('UpdateMemberProfile')
  async updateCustomerXml(@Body() body: string) {
    const parsed = await xml2js.parseStringPromise(body, {
      explicitArray: false,
    });
    const requestData = parsed?.Request;
    if (!requestData) {
      throw new BadRequestException('Invalid XML structure.');
    }

    // Pass SecurityToken + all fields to service
    const result =
      await this._accountService.UpdateCustomerFromXml(requestData);

    // Always return XML
    const xmlResponse = {
      Response: {
        ReturnCode: result.returnCode,
        ReturnMessage: result.returnMessage,
      },
    };
    return new xml2js.Builder({ headless: true }).buildObject(xmlResponse);
  }
  @Post('SaveSKUBillDetails')
  async saveBill(@Body() body: any) {
    const xml = body.toString();
    const parsed = await xml2js.parseStringPromise(xml, {
      explicitArray: false,
    });

    const request = parsed?.Request;
    if (!request) throw new BadRequestException('Invalid XML structure.');

    const savedMaster = await this._accountService.saveBillWithItems(request);

    const xmlResponse = {
      Response: {
        ReturnCode: 0,
        ReturnMessage: 'Success.',
        TransactionId: savedMaster.id,
      },
    };

    return new xml2js.Builder({ headless: true }).buildObject(xmlResponse);
  }
}
