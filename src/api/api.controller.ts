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
import { ApiService } from './api.service';

import { JwtAuthGuard } from 'src/admin/auth/jwt-auth.guard';
import { RegisterCustomerDto } from './dto/RegisterCustomerDto';
import { UpdateCustomerDto } from './dto/UpdateCustomerDto';
import { RequestWithProtocol } from './interfaces/request.interface';
import { SearchCustomerDto } from './dto/SearchCustomerDto';
import { PointRedeemedDto } from './dto/PointRedeemedByCustomerDto';
import { RenewPlanDto } from './dto/RenewPlanDto';
import { UpdateCustomerCardDto } from './dto/UpdateCustomerCardDto';
import { AddBonusPointDto } from './dto/BonusPointDto';

@Controller('api')
export class ApiController {
  constructor(
    private readonly _apiService: ApiService,
    @Inject(Logger) private readonly logger: Logger,
    @Inject(Request) private readonly req: Request,
  ) {}

  @Post('register-customer')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async registerCustomer(
    @Req() req: any,
    @Body() registerCustomerDto: RegisterCustomerDto,
  ) {
    return this._apiService.registerCustomer(req, registerCustomerDto);
  }
  @Post('update-register-customer')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async UpdateCustomer(@Body() updateCustomerDto: UpdateCustomerDto) {
    this.logger.log('Update Old Plan');
    return this._apiService.UpdateCustomer(updateCustomerDto);
  }
  @Post('update-card-number')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async updateCardNumber(@Req() req, @Body() dto: UpdateCustomerCardDto) {
    return this._apiService.updateCustomerCardNumber(
      req,
      dto.customerId,
      dto.newCardNumber,
    );
  }

  @Post('search-customer')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async searchCustomer(@Req() req: any, @Body() searchDto: SearchCustomerDto) {
    return this._apiService.SearchCustomer(searchDto, req);
  }

  @Post('/send-otp')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async sendOtp(@Body() dto: PointRedeemedDto) {
    return this._apiService.sendOtpAndPrepareRedemption(
      dto.mobileNumber,
      dto.storeCode,
      dto,
    );
  }

  @Post('/resend-otp')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async resendOtp(@Body() dto: PointRedeemedDto) {
    return this._apiService.resendOtp(dto.mobileNumber, dto.storeCode, dto);
  }
  // Step 2: Verify OTP and redeem
  @Post('/verify-otp')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async verifyOtp(
    @Req() req: any,
    @Body() body: { storeCode: string; mobileNumber: number; otp: string },
  ) {
    return this._apiService.verifyOtpAndRedeem(
      body.storeCode,
      body.mobileNumber,
      body.otp,
      req,
    );
  }
  @Post('shopping-without-otp')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async shoppingWithoutOtpShopping(
    @Req() req: any,
    @Body() pointRedeemedDto: PointRedeemedDto,
  ) {
    const { value, redeemValue, mobileNumber, cardNumber, storeCode } =
      pointRedeemedDto;
    const companyId = req.user?.companyId;
    const userId = req.user?.userId;
    console.log('companyId: ', companyId);

    return this._apiService.shoppingWithoutOtpShopping(
      value,
      redeemValue,
      mobileNumber,
      cardNumber,
      storeCode,
      companyId,
      userId,
    );
  }

  @Post('renew-plan')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async renewPlan(@Req() req: any, @Body() renewPlanDto: RenewPlanDto) {
    return this._apiService.renewPlan(req, renewPlanDto);
  }
  @Post('add-bonus')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async addBonusPoint(
    @Req() req: any,
    @Body() addBonusPointDto: AddBonusPointDto,
  ) {
    return this._apiService.addBonusToLatestTopup(addBonusPointDto, req);
  }
}
