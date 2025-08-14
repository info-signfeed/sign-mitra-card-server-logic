import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Not,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  In,
  LessThan,
  MoreThan,
} from 'typeorm';
import { RegisterCustomerEntity } from './Entity/CustomerMasterEntity';
import { RegisterCustomerDto } from './dto/RegisterCustomerDto';
import { UpdateCustomerDto } from './dto/UpdateCustomerDto';
import { SearchCustomerDto } from './dto/SearchCustomerDto';
import { LoyaltyPlanMasterEntity } from 'src/admin/Entity/LoyaltyPlanMasterEntity';
import { RedeemPointEntity } from './Entity/RedeemPointEntity';
import { RenewPlanDto } from './dto/RenewPlanDto';
import nodemailer from 'nodemailer';
import { RedeemTransactionEntity } from './Entity/RedeemTransactionEntity';
import { TopUpDataMasterEntity } from './Entity/TopUpRecordMasterEntity';
import { CompanyTierMasterEntity } from 'src/admin/Entity/CompanyTierMasterEntity';
import { LoyaltyCardTypeEntity } from 'src/admin/Entity/LoyaltyCardTypeEntity';
import { LoyaltyCardTopupMasterEntity } from './Entity/LoyaltyTopUpCardMasterEntity';
import dayjs from 'dayjs';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';
import { CompanyMasterEntity } from 'src/admin/Entity/CompanyMasterEntity';
import { CompanySmsTemplateEntity } from 'src/admin/Entity/CompanySmsTemplateEntity';
import { AddBonusPointDto } from './dto/BonusPointDto';
import { BonusRecordMasterEntity } from './Entity/BonusRecordMatserEntity';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { BonusAmountManageMasterEntity } from './Entity/BonusAmountManageMatserEntity';
import moment from 'moment';
dayjs.extend(utc);
dayjs.extend(timezone);
const otpStore = new Map<
  string,
  {
    otp: string;
    expiresAt: number;
    redeemPayload: {
      value: number;
      redeemValue: number;
      mobileNumber: number;
      cardNumber?: number;
    };
  }
>();
@Injectable()
export class ApiService {
  // private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(ApiService.name);
  private readonly smsApiUrl = 'https://smsapi.bitss.tech/api/v5/flow';
  private readonly authKey = '428770ARqQn9tciLvD66c82166P1'; // You may want to store this in ENV
  private readonly templateId = '683e9f5f8203a1605e06d1a7'; // Register template
  httpService: any;
  constructor(
    @InjectRepository(RegisterCustomerEntity)
    private readonly RegisterCustomerEntityRepository: Repository<RegisterCustomerEntity>,
    @InjectRepository(LoyaltyPlanMasterEntity)
    private readonly LoyaltyPlanMasterEntityRepository: Repository<LoyaltyPlanMasterEntity>,
    @InjectRepository(RedeemPointEntity)
    private readonly RedeemPointEntityRepository: Repository<RedeemPointEntity>,
    @InjectRepository(RedeemTransactionEntity)
    private readonly RedeemTransactionEntityRepository: Repository<RedeemTransactionEntity>,
    @InjectRepository(TopUpDataMasterEntity)
    private readonly TopUpDataMasterEntityRepository: Repository<TopUpDataMasterEntity>,
    @InjectRepository(CompanyTierMasterEntity)
    private readonly CompanyTierMasterEntityRepository: Repository<CompanyTierMasterEntity>,
    @InjectRepository(LoyaltyCardTypeEntity)
    private readonly LoyaltyCardTypeEntityRepository: Repository<LoyaltyCardTypeEntity>,
    @InjectRepository(LoyaltyCardTopupMasterEntity)
    private readonly LoyaltyCardTopupMasterEntityRepository: Repository<LoyaltyCardTopupMasterEntity>,
    @InjectRepository(CompanyMasterEntity)
    private readonly CompanyMasterEntityRepository: Repository<CompanyMasterEntity>,
    @InjectRepository(CompanySmsTemplateEntity)
    private readonly CompanySmsTemplateEntityRepository: Repository<CompanySmsTemplateEntity>,
    @InjectRepository(BonusRecordMasterEntity)
    private readonly BonusRecordMasterEntityRepository: Repository<BonusRecordMasterEntity>,
    @InjectRepository(BonusAmountManageMasterEntity)
    private readonly BonusAmountManageMasterEntityRepository: Repository<BonusAmountManageMasterEntity>,
  ) {}

  async registerCustomer(req: any, registerCustomerDto: RegisterCustomerDto) {
    const companyId = req.user.companyId;
    const userId = req.user.userId;

    const { mobileNumber, cardNumber, planId } = registerCustomerDto;

    // Step 0: Check if mobile or card exists in RedeemPointEntity
    const redeemConflict = await this.RedeemPointEntityRepository.findOne({
      where: [
        { mobileNumber, companyId },
        { cardNumber, companyId },
      ],
    });

    if (redeemConflict) {
      return {
        message:
          'Mobile number or card number is already registered in RedeemPoint for this company.',
        status: 201,
      };
    }

    // Step 0.1: Check if mobile or card exists in RegisterCustomerEntity
    const registerConflict =
      await this.RegisterCustomerEntityRepository.findOne({
        where: [
          { mobileNumber, companyId },
          { cardNumber, companyId },
        ],
      });

    if (registerConflict) {
      return {
        message:
          'Mobile number or card number is already registered in RegisterCustomer for this company.',
        status: 201,
      };
    }

    // Step 0.2: Check if email exists, only if email is provided
    if (registerCustomerDto.customerEmail) {
      const emailConflict = await this.RegisterCustomerEntityRepository.findOne(
        {
          where: {
            customerEmail: registerCustomerDto.customerEmail,
            companyId,
          },
        },
      );

      if (emailConflict) {
        return {
          message: 'This email is already registered in this company.',
          status: 201,
        };
      }
    }

    // Step 1: Save new customer
    const newCustomer = new RegisterCustomerEntity();
    newCustomer.mobileNumber = mobileNumber;
    newCustomer.cardNumber = cardNumber;
    newCustomer.customerName = registerCustomerDto.customerName;
    newCustomer.customerEmail = registerCustomerDto.customerEmail || null; // Safe assignment
    newCustomer.gender = registerCustomerDto.gender;
    newCustomer.birthDate = registerCustomerDto.birthDate ?? null;
    newCustomer.anniversaryDate = registerCustomerDto.anniversaryDate ?? null;
    newCustomer.planId = planId ?? null;
    newCustomer.cardType = registerCustomerDto.cardType;
    newCustomer.termsAccepted = registerCustomerDto.termsAccepted;
    newCustomer.status = true;
    newCustomer.companyId = companyId;
    newCustomer.storeCode = registerCustomerDto.storeCode;
    newCustomer.userId = userId;

    const savedCustomer =
      await this.RegisterCustomerEntityRepository.save(newCustomer);

    let pointText = '0';

    if (planId) {
      // Step 2: Plan-based registration
      const plan = await this.LoyaltyPlanMasterEntityRepository.findOne({
        where: { id: planId, companyId, userId },
      });

      if (!plan) {
        return {
          message: 'Loyalty plan not found for the provided ID.',
          status: 201,
        };
      }

      const today = new Date();
      const validTill = new Date(
        today.getFullYear(),
        today.getMonth() + plan.validMonth,
        today.getDate(),
      );

      const redeem = new RedeemPointEntity();
      redeem.customerName = newCustomer.customerName;
      redeem.mobileNumber = mobileNumber;
      redeem.cardNumber = cardNumber;
      redeem.planId = planId;
      redeem.denominationValue = plan.denominationValue;
      redeem.actualValue = plan.actualValue;
      redeem.amountPayCashier = plan.denominationValue;
      redeem.customerId = savedCustomer.id;
      redeem.pendingPoint = plan.actualValue;
      redeem.validTill = validTill;
      redeem.redeemPoint = plan.actualValue;
      redeem.validMonth = plan.validMonth;
      redeem.monthlyLimit = plan.monthlyUnit;
      redeem.storeCode = newCustomer.storeCode;
      redeem.companyId = companyId;
      redeem.userId = userId;

      await this.RedeemPointEntityRepository.save(redeem);

      pointText = redeem.pendingPoint?.toString() || '0';
      const company = await this.CompanyMasterEntityRepository.findOne({
        where: { id: companyId },
      });

      if (registerCustomerDto.cardType === 1) {
        try {
          await this.sendSmsTemplate(
            mobileNumber,
            companyId,
            'prepaid-welcome',
            {
              customer_name: newCustomer.customerName,
              company_name: company?.companyName || '',
              total_point: pointText,
            },
          );
        } catch (error) {
          console.error('Failed to send prepaid-welcome SMS:', error.message);
        }
      }

      // await this.sendOTPEmail(savedCustomer.customerEmail, redeem); // Plan-based email
    } else {
      // Step 3: No plan - Welcome email
      // await this.sendWelcomeEmail(savedCustomer.customerEmail, cardNumber);
    }

    if (!planId && registerCustomerDto.cardType === 2) {
      // Step 4: Loyalty card without plan
      const loyaltyRecord = new LoyaltyCardTopupMasterEntity();
      loyaltyRecord.companyId = companyId;
      loyaltyRecord.mobileNumber = mobileNumber;
      loyaltyRecord.cardNumber = cardNumber;
      loyaltyRecord.cardType = 'loyalty';
      loyaltyRecord.shoppingAmount = 0;
      loyaltyRecord.topupPercent = 0;
      loyaltyRecord.topupValue = 0;
      loyaltyRecord.currentAmount = 0;
      loyaltyRecord.storeCode = registerCustomerDto.storeCode;
      // loyaltyRecord.validTill = null;

      await this.LoyaltyCardTopupMasterEntityRepository.save(loyaltyRecord);
      pointText = loyaltyRecord.currentAmount.toString() || '0';
      const company = await this.CompanyMasterEntityRepository.findOne({
        where: { id: companyId },
      });
      if (registerCustomerDto.cardType === 2) {
        await this.sendSmsTemplate(
          mobileNumber,
          companyId,
          'register-customer',
          {
            customer_name: newCustomer.customerName,
            company_name: company?.companyName || '',
          },
        );
      }
    }

    return { message: 'success', status: 200 };
  }

  renderTemplate(
    template: string,
    variables: Record<string, string | number>,
  ): string {
    let result = template;
    for (const key in variables) {
      result = result.replaceAll(`{${key}}`, variables[key].toString());
    }
    return result;
  }

  async sendSmsTemplate(
    mobile: number,
    companyId: number,
    templateKey: string,
    variables: Record<string, string | number>,
  ): Promise<void> {
    try {
      // Step 1: Get template details
      const smsTemplate = await this.CompanySmsTemplateEntityRepository.findOne(
        {
          where: { companyId, templateKey },
        },
      );
      console.log('smsTemplate: ', smsTemplate);

      if (!smsTemplate) {
        console.warn(`SMS template not found for key: ${templateKey}`);
        return;
      }

      // Step 2: Format payload
      const payload = {
        template_id: smsTemplate.templateId, // Example: "683e9f5f8203a1605e06d1a7"
        recipients: [
          {
            mobiles: `91${mobile}`,
            ...variables, // Example: customer_name, card_number, etc.
          },
        ],
      };
      console.log('payload: ', payload);

      // Step 3: Send request using POST (NOT GET)
      const response = await axios.post(
        'https://smsapi.bitss.tech/api/v5/flow',
        payload,
        {
          headers: {
            authkey: '428770ARqQn9tciLvD66c82166P1',
            'Content-Type': 'application/json',
          },
        },
      );

      // Step 4: Log success
      console.log('SMS sent successfully:', response.data);
    } catch (error) {
      console.error(
        'SMS sending failed:',
        error.response?.data || error.message,
      );
    }
  }

  async sendWelcomeEmail(email: string, cardNumber: number): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'signfeedai@gmail.com',
        pass: 'vxskzhptpmztfknc',
      },
    });

    const mailOptions = {
      from: 'signfeedai@gmail.com',
      to: email,
      subject: 'Loyalty Card Created',
      html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Loyalty Card</title>
      <style>
        body, table, td {
          font-family: "Poppins", Arial, sans-serif !important;
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center">
            <table width="600" cellpadding="30" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px;">
              <tr>
               <td align="center" style="font-size: 36px; font-weight: 600; color: #1b1b8b; padding-bottom: 20px;">
                  🎉 Congratulations! 🎉 
                </td>
              </tr>
              <tr>
               <td align="center" style="font-size: 16px; font-weight: 500; color: #405cff; line-height: 24px; padding: 0 70px 30px;">
                  We're thrilled to let you know that you’ve successfully joined our Loyalty Program. A world of exclusive rewards, priority access, and special surprises just for you!
                </td>
              </tr>
             <tr>
             <td>
                  <table width="100%" cellpadding="15" cellspacing="0" border="0" style="background-color: #405cff; border-radius: 12px; color: #ffffff;">
                    <tr>
                      <td style="font-size: 16px">Loyalty Card No.:</td>
                      <td align="right" style="font-size: 16px">${cardNumber}</td>
                    </tr>
                   
                  </table>
                </td>
             </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `,
    };

    await transporter.sendMail(mailOptions);
  }

  async sendOTPEmail(email: string, redeem: RedeemPointEntity): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      // auth: {
      //   user: 'surbhigulhana3@gmail.com', // Your email
      //   pass: 'roqt unwq qcnt tlcf', // Your app-specific password
      // },
      auth: {
        user: 'signfeedai@gmail.com',
        pass: 'vxskzhptpmztfknc',
      },
    });

    const mailOptions = {
      from: 'signfeedai@gmail.com',
      to: email,
      subject: 'Loyalty Program Confirmation',
      html: `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Loyalty Program Confirmation</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;800&display=swap" rel="stylesheet" />
      <style>
        body, table, td {
          font-family: "Poppins", Arial, sans-serif !important;
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4">
      <table width="100%" height="100%" cellpadding="0" cellspacing="0" border="0" style="height: 100vh">
        <tr>
          <td align="center" valign="middle">
            <table width="800" cellpadding="0" cellspacing="0" border="0" style="background-color: #d0e5f9; border-radius: 8px; padding: 50px 70px">
              <tr>
                <td align="center" style="font-size: 36px; font-weight: 600; color: #1b1b8b; padding-bottom: 20px;">
                  🎉 Congratulations! 🎉 
                </td>
              </tr>
              <tr>
                <td align="center" style="font-size: 16px; font-weight: 500; color: #405cff; line-height: 24px; padding: 0 70px 30px;">
                  We're thrilled to let you know that you’ve successfully joined our Loyalty Program. A world of exclusive rewards, priority access, and special surprises just for you!
                </td>
              </tr>
              <tr>
                <td>
                  <table width="100%" cellpadding="15" cellspacing="0" border="0" style="background-color: #405cff; border-radius: 12px; color: #ffffff;">
                    <tr>
                      <td style="font-size: 16px">Loyalty Card No.:</td>
                      <td align="right" style="font-size: 16px">${redeem.cardNumber}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 16px">Total Loyalty Points:</td>
                      <td align="right" style="font-size: 16px">${redeem.actualValue}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 16px">Monthly to Redeem:</td>
                      <td align="right" style="font-size: 16px">${redeem.monthlyLimit}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 16px">Plan Expiry Date:</td>
                      <td align="right" style="font-size: 16px">${new Date(redeem.validTill).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `,
    };

    await transporter.sendMail(mailOptions);
  }
  async UpdateCustomer(updateCustomerDto: UpdateCustomerDto) {
    console.log('Received updateCustomerDto:', updateCustomerDto);

    // Step 1: Fetch customer
    const customer = await this.RegisterCustomerEntityRepository.findOne({
      where: { id: updateCustomerDto.customerId },
    });

    console.log('Found customer:', customer);

    if (!customer) {
      throw new BadRequestException('Customer not found.');
    }

    // Step 2: Only update allowed fields
    customer.customerName = updateCustomerDto.customerName;
    customer.customerEmail = updateCustomerDto.customerEmail;
    customer.gender = updateCustomerDto.gender;
    customer.birthDate = updateCustomerDto.birthDate ?? null;
    customer.anniversaryDate = updateCustomerDto.anniversaryDate ?? null;
    customer.termsAccepted = updateCustomerDto.termsAccepted;
    customer.status = updateCustomerDto.status; // Use the value from DTO

    // Step 3: Save updated customer
    await this.RegisterCustomerEntityRepository.save(customer);

    // Step 4: Find and update matching RedeemPoint records
    const redeemPoints = await this.RedeemPointEntityRepository.find({
      where: {
        mobileNumber: updateCustomerDto.mobileNumber,
        cardNumber: updateCustomerDto.cardNumber,
      },
    });

    for (const record of redeemPoints) {
      record.customerName = updateCustomerDto.customerName;
    }

    if (redeemPoints.length > 0) {
      await this.RedeemPointEntityRepository.save(redeemPoints);
    }

    return { message: 'success', status: 200 };
  }

  async updateCustomerCardNumber(
    req: any,
    customerId: number,
    newCardNumber: number,
  ) {
    const companyId = req.user.companyId;

    // Step 1: Check if the new card number already exists
    const existing = await this.RegisterCustomerEntityRepository.findOne({
      where: { cardNumber: newCardNumber, companyId },
    });

    if (existing) {
      return {
        message: 'New card number is already in use.',
        status: 409,
      };
    }

    // Step 2: Find the customer by ID and company
    const customer = await this.RegisterCustomerEntityRepository.findOne({
      where: { id: customerId, companyId },
    });

    if (!customer) {
      return {
        message: 'Customer not found.',
        status: 404,
      };
    }

    const oldCardNumber = customer.cardNumber;
    const mobileNumber = customer.mobileNumber;

    // Step 3: Update RegisterCustomerEntity
    customer.cardNumber = newCardNumber;
    await this.RegisterCustomerEntityRepository.save(customer);

    // Step 4: Update RedeemPointEntity if cardType === 1
    if (customer.cardType === 1) {
      await this.RedeemPointEntityRepository.update(
        { cardNumber: oldCardNumber, companyId },
        { cardNumber: newCardNumber },
      );
    }

    // Step 5: Update LoyaltyCardTopupMasterEntity if cardType === 2
    if (customer.cardType === 2) {
      await this.LoyaltyCardTopupMasterEntityRepository.update(
        { cardNumber: oldCardNumber, companyId },
        { cardNumber: newCardNumber },
      );
    }

    //  Step 6: Update RedeemTransactionEntity based on mobile number
    await this.RedeemTransactionEntityRepository.update(
      { mobileNumber, companyId },
      { cardNumber: newCardNumber },
    );

    return {
      message: 'success',
      status: 200,
    };
  }

  async SearchCustomer(searchDto: SearchCustomerDto, req: any) {
    const companyId = req.user.companyId;
    const { number } = searchDto;

    if (!number) {
      throw new BadRequestException(
        'Please provide a mobile number or card number',
      );
    }

    const customer = await this.RegisterCustomerEntityRepository.findOne({
      where: [
        { mobileNumber: number, companyId, storeCode: searchDto.storeCode },
        { cardNumber: number, companyId, storeCode: searchDto.storeCode },
      ],
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    let purchasedPlan = null;
    let totalLoyaltyPoints = null;

    if (customer.cardType == 1) {
      purchasedPlan = await this.RedeemPointEntityRepository.findOne({
        where: {
          mobileNumber: customer.mobileNumber,
          cardNumber: customer.cardNumber,
          companyId,
          storeCode: searchDto.storeCode,
        },
        order: { validTill: 'DESC' },
      });

      if (purchasedPlan?.denominationValue) {
        purchasedPlan.denominationValue = parseFloat(
          purchasedPlan.denominationValue as any,
        );
      }

      // Fetch plan details and merge into purchasedPlan
      if (customer.planId) {
        const planDetails =
          await this.LoyaltyPlanMasterEntityRepository.findOne({
            where: { id: customer.planId },
            select: ['planName', 'isOneTimeRedeem'],
          });

        if (planDetails) {
          purchasedPlan = {
            ...purchasedPlan,
            planName: planDetails.planName,
            isOneTimeRedeem: planDetails.isOneTimeRedeem === 1, // returns true or false
          };
        }
      }
    }

    if (customer.cardType == 2) {
      const topups = await this.LoyaltyCardTopupMasterEntityRepository.find({
        where: {
          mobileNumber: customer.mobileNumber,
          cardNumber: customer.cardNumber,
          companyId,
          storeCode: searchDto.storeCode,
        },
      });

      totalLoyaltyPoints = topups.reduce(
        (sum, topup) => sum + Number(topup.currentAmount || 0),
        0,
      );
    }

    return {
      message: 'success',
      status: 200,
      customer,
      purchasedPlan: purchasedPlan ?? null,
      ...(customer.cardType == 2 && { totalLoyaltyPoints }),
    };
  }

  async redeemPoints(
    value: number,
    redeemValue: number,
    mobileNumber?: number,
    cardNumber?: number,
    companyId?: number, // coming from req.user
    storeCode?: string,
  ) {
    console.log('storeCode: ', storeCode);
    if (!mobileNumber && !cardNumber) {
      throw new BadRequestException(
        'Either mobile number or card number must be provided.',
      );
    }
    if (!companyId) {
      throw new BadRequestException('Company ID is required.');
    }
    // 1. Fetch customer based on companyId + either mobileNumber or cardNumber
    const customer = await this.RegisterCustomerEntityRepository.findOne({
      where: mobileNumber
        ? { mobileNumber, companyId, storeCode }
        : { cardNumber, companyId, storeCode },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found for this company.');
    }
    // 2. Fetch plan details using customer's planId
    const plan = await this.LoyaltyPlanMasterEntityRepository.findOne({
      where: { id: customer.planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found for the customer.');
    }

    // 3. Check isOneTimeMonth flag
    if (plan.isOneTimeRedeem === 1) {
      // Fetch redeem record
      const redeemRecord = await this.RedeemPointEntityRepository.findOne({
        where: mobileNumber
          ? { mobileNumber, companyId, storeCode }
          : { cardNumber, companyId, storeCode },
      });

      if (!redeemRecord) {
        throw new BadRequestException('No redeem record found.');
      }

      // Update points without any restrictions
      redeemRecord.spendPoint = (redeemRecord.spendPoint || 0) + redeemValue;
      redeemRecord.pendingPoint = Math.max(
        (redeemRecord.pendingPoint || 0) - redeemValue,
        0,
      );

      // Save updated redeem record
      await this.RedeemPointEntityRepository.save(redeemRecord);

      // Save redeem transaction
      await this.RedeemTransactionEntityRepository.save({
        redeemValue,
        mobileNumber,
        cardNumber,
        companyId,
        planId: customer.planId,
        createdAt: new Date(),
        storeCode: storeCode,
      });
      const company = await this.CompanyMasterEntityRepository.findOne({
        where: { id: companyId },
      });
      await this.sendSmsTemplate(
        customer.mobileNumber,
        companyId,
        'prepaid-thanks',
        {
          customer_name: customer.customerName,
          company_name: company?.companyName || '',
          total_points: redeemRecord.pendingPoint,
        },
      );

      console.log('SMS sent.');
      return { message: 'success', status: 200 };
    }

    // 4. Else run your current redemption logic (as you already wrote)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const cardType = customer.cardType;
    console.log('cardType: ', cardType);

    // 2. Top-up Card Logic
    if (cardType === 2) {
      let remainingToRedeem = redeemValue || 0;
      console.log('remainingToRedeem: ', remainingToRedeem);

      const topups = await this.LoyaltyCardTopupMasterEntityRepository.find({
        where: { cardNumber, cardType: 'loyalty' },
        order: { createdAt: 'ASC' },
      });

      const totalAvailablePoints = topups.reduce(
        (sum, t) => sum + t.currentAmount,
        0,
      );
      if (remainingToRedeem > totalAvailablePoints) {
        throw new BadRequestException('Not enough redeemable points.');
      }

      for (const topup of topups) {
        if (remainingToRedeem <= 0) break;

        const deduction = Math.min(topup.currentAmount, remainingToRedeem);

        if (deduction > 0) {
          topup.currentAmount -= deduction;
          remainingToRedeem -= deduction;
          await this.LoyaltyCardTopupMasterEntityRepository.save(topup);
        }
      }

      if (redeemValue && redeemValue > 0) {
        await this.RedeemTransactionEntityRepository.save({
          redeemValue,
          mobileNumber,
          cardNumber,
          companyId,
          planId: customer.planId,
          createdAt: new Date(),
          storeCode,
        });
      }

      if (value && value > 0) {
        let tier = await this.CompanyTierMasterEntityRepository.findOne({
          where: {
            companyId,
            fromAmount: LessThanOrEqual(value),
            toAmount: MoreThanOrEqual(value),
          },
        });

        if (!tier) {
          tier =
            await this.CompanyTierMasterEntityRepository.createQueryBuilder(
              'tier',
            )
              .where('tier.companyId = :companyId', { companyId })
              .andWhere('tier.toAmount < :value', { value })
              .orderBy('tier.toAmount', 'DESC')
              .getOne();
        }

        if (!tier) {
          throw new BadRequestException('No tier matched for shopping amount.');
        }

        const topUpValue = (value * tier.topupPercent) / 100;

        let validTill;

        if (tier.validity === 0) {
          const now = new Date();
          validTill = new Date(9999, now.getMonth(), now.getDate()); // year=9999, same month/day as today
        } else {
          validTill = dayjs().add(tier.validity, 'month').toDate();
        }

        console.log('validTill', validTill);

        const newTopup = this.LoyaltyCardTopupMasterEntityRepository.create({
          companyId,
          mobileNumber: customer.mobileNumber,
          cardNumber,
          cardType: 'loyalty',
          shoppingAmount: value,
          discountedShoppingValue: redeemValue ? value - redeemValue : value,
          topupPercent: tier.topupPercent,
          topupValue: topUpValue,
          currentAmount: topUpValue,
          validTill,
          storeCode: customer.storeCode,
          createdAt: new Date(),
        });

        // await this.LoyaltyCardTopupMasterEntityRepository.save(newTopup);
        const savedTopup =
          await this.LoyaltyCardTopupMasterEntityRepository.save(newTopup);
        const company = await this.CompanyMasterEntityRepository.findOne({
          where: { id: companyId },
        });

        const topupsForBalance =
          await this.LoyaltyCardTopupMasterEntityRepository.find({
            where: { cardNumber, cardType: 'loyalty' },
          });

        const totalBalance = topupsForBalance.reduce(
          (sum, t) => sum + t.currentAmount,
          0,
        );
        console.log('totalBalance: ', totalBalance);

        await this.sendSmsTemplate(
          customer.mobileNumber,
          companyId,
          'normal-thanks-after-point-redemption',
          {
            customer_name: customer.customerName,
            company_name: company?.companyName || '',
            loyalty_point: totalBalance,
          },
        );

        return {
          message: 'success',
          status: 200,
          topupValue: savedTopup.topupValue,
        };
      }

      return { message: 'success', status: 200 };
    }

    // 3. Points Card Logic
    else if (cardType === 1) {
      if (!redeemValue || redeemValue <= 0) {
        throw new BadRequestException(
          'Redeem value is required for this card type.',
        );
      }

      const redeemRecord = await this.RedeemPointEntityRepository.findOne({
        where: mobileNumber
          ? { mobileNumber, companyId, storeCode }
          : { cardNumber, companyId, storeCode },
      });

      if (!redeemRecord) {
        throw new BadRequestException('No redeem record found.');
      }

      // const monthlyRedemptions =
      //   await this.RedeemTransactionEntityRepository.find({
      //     where: mobileNumber
      //       ? {
      //           mobileNumber,
      //           companyId,
      //           planId,
      //           createdAt: Between(startOfMonth, endOfMonth),
      //         }
      //       : {
      //           cardNumber,
      //           companyId,
      //           planId,
      //           createdAt: Between(startOfMonth, endOfMonth),
      //         },
      //   });

      const allRedemptionsThisMonth =
        await this.RedeemTransactionEntityRepository.find({
          where: mobileNumber
            ? {
                mobileNumber,
                companyId,
                createdAt: Between(startOfMonth, endOfMonth),
              }
            : {
                cardNumber,
                companyId,
                createdAt: Between(startOfMonth, endOfMonth),
              },
        });

      // Sum of redemption done under *same* plan this month
      const samePlanRedemptions = allRedemptionsThisMonth.filter(
        (tx) => tx.planId === customer.planId,
      );

      const totalRedeemedUnderSamePlan = samePlanRedemptions.reduce(
        (sum, tx) => sum + tx.redeemValue,
        0,
      );

      // Now check monthly limit only for *same plan*
      if (
        totalRedeemedUnderSamePlan + redeemValue >
        redeemRecord.monthlyLimit
      ) {
        throw new BadRequestException(
          `Monthly limit exceeded under current plan! Already redeemed ${totalRedeemedUnderSamePlan}, limit is ${redeemRecord.monthlyLimit}.`,
        );
      }

      const availablePoints =
        redeemRecord.redeemPoint - (redeemRecord.spendPoint || 0);
      if (redeemValue > availablePoints) {
        throw new BadRequestException(
          `Insufficient points. Available: ${availablePoints}.`,
        );
      }

      redeemRecord.spendPoint = (redeemRecord.spendPoint || 0) + redeemValue;
      redeemRecord.pendingPoint =
        redeemRecord.redeemPoint - redeemRecord.spendPoint;
      redeemRecord.lastRedeemDate = new Date(now.setHours(0, 0, 0, 0));
      await this.RedeemPointEntityRepository.save(redeemRecord);
      console.log(
        'Da',
        redeemValue,
        mobileNumber,
        cardNumber,
        companyId,
        // planId: customer.planId,
        // createdAt: new Date(),
        storeCode,
      );
      await this.RedeemTransactionEntityRepository.save({
        redeemValue,
        mobileNumber,
        cardNumber,
        companyId,
        planId: customer.planId,
        createdAt: new Date(),
        storeCode,
      });
      const company = await this.CompanyMasterEntityRepository.findOne({
        where: { id: companyId },
      });

      const smsPayload = {
        customer_name: customer.customerName,
        company_name: company?.companyName || '',
        total_points: redeemRecord.pendingPoint,
      };
      console.log('smsPayload: ', smsPayload);
      await this.sendSmsTemplate(
        customer.mobileNumber,
        companyId,
        'prepaid-thanks',
        {
          customer_name: customer.customerName,
          company_name: company?.companyName || '',
          total_points: redeemRecord.pendingPoint,
        },
      );

      console.log(' SMS sent.');
      return { message: 'Points redeemed successfully.', status: 200 };
    }

    // 4. Unknown cardType
    else {
      throw new BadRequestException('Invalid card type.');
    }
  }

  //without otp while shoppning  if user don't used any redeem value then user hit only.
  async shoppingWithoutOtpShopping(
    value: number,
    redeemValue: number,
    mobileNumber?: number,
    cardNumber?: number,
    storeCode?: string,
    companyId?: number,
    userId?: number,
  ) {
    console.log('storeCode: ', storeCode);
    if (!mobileNumber && !cardNumber) {
      throw new BadRequestException(
        'Either mobile number or card number must be provided.',
      );
    }
    if (!companyId) {
      throw new BadRequestException('Company ID is required.');
    }
    // 1. Fetch customer based on companyId + either mobileNumber or cardNumber
    const customer = await this.RegisterCustomerEntityRepository.findOne({
      where: mobileNumber
        ? { mobileNumber, companyId, storeCode }
        : { cardNumber, companyId, storeCode },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found for this company.');
    }

    const cardType = customer.cardType;

    // 2. Top-up Card Logic
    if (cardType === 2) {
      let remainingToRedeem = redeemValue || 0;

      const topups = await this.LoyaltyCardTopupMasterEntityRepository.find({
        where: { cardNumber, cardType: 'loyalty' },
        order: { createdAt: 'ASC' },
      });

      const totalAvailablePoints = topups.reduce(
        (sum, t) => sum + t.currentAmount,
        0,
      );
      if (remainingToRedeem > totalAvailablePoints) {
        throw new BadRequestException('Not enough redeemable points.');
      }

      for (const topup of topups) {
        if (remainingToRedeem <= 0) break;

        const deduction = Math.min(topup.currentAmount, remainingToRedeem);

        if (deduction > 0) {
          topup.currentAmount -= deduction;
          remainingToRedeem -= deduction;
          await this.LoyaltyCardTopupMasterEntityRepository.save(topup);
        }
      }

      if (value && value > 0) {
        let tier = await this.CompanyTierMasterEntityRepository.findOne({
          where: {
            companyId,
            fromAmount: LessThanOrEqual(value),
            toAmount: MoreThanOrEqual(value),
          },
        });

        if (!tier) {
          tier =
            await this.CompanyTierMasterEntityRepository.createQueryBuilder(
              'tier',
            )
              .where('tier.companyId = :companyId', { companyId })
              .andWhere('tier.toAmount < :value', { value })
              .orderBy('tier.toAmount', 'DESC')
              .getOne();
        }

        if (!tier) {
          throw new BadRequestException('No tier matched for shopping amount.');
        }

        const topUpValue = (value * tier.topupPercent) / 100;

        let validTill;

        if (tier.validity === 0) {
          const now = new Date();
          validTill = new Date(9999, now.getMonth(), now.getDate()); // year=9999, same month/day as today
        } else {
          validTill = dayjs().add(tier.validity, 'month').toDate();
        }

        console.log('validTill', validTill);
        const newTopup = this.LoyaltyCardTopupMasterEntityRepository.create({
          companyId,
          mobileNumber: customer.mobileNumber,
          cardNumber,
          cardType: 'loyalty',
          shoppingAmount: value,
          discountedShoppingValue: redeemValue ? value - redeemValue : value,
          topupPercent: tier.topupPercent,
          topupValue: topUpValue,
          currentAmount: topUpValue,
          validTill,
          storeCode,
          createdAt: new Date(),
        });

        // await this.LoyaltyCardTopupMasterEntityRepository.save(newTopup);
        const savedTopup =
          await this.LoyaltyCardTopupMasterEntityRepository.save(newTopup);

        // Send thanks-for-shopping SMS after topup, only for cardType 2
        try {
          if (customer.cardType === 2) {
            const company = await this.CompanyMasterEntityRepository.findOne({
              where: { id: companyId },
            });

            // Sum all currentAmount values for this card
            const allTopups =
              await this.LoyaltyCardTopupMasterEntityRepository.find({
                where: {
                  cardNumber: customer.cardNumber,
                  companyId: customer.companyId,
                },
              });

            const availablePoints = allTopups.reduce(
              (sum, row) => sum + Number(row.currentAmount || 0),
              0,
            );

            // Send SMS using the loyalty-Thanks template
            await this.sendSmsTemplate(
              customer.mobileNumber,
              companyId,
              'earn-loyalty-point-without-redeem', //  correct template key
              {
                customer_name: customer?.customerName || '',
                company_name: company?.companyName || '',
                loyalty_points: savedTopup.topupValue.toFixed(2),
                available_points: availablePoints.toFixed(2),
              },
            );
          }
        } catch (error) {
          console.error(
            'Failed to send earn-loyalty-point-without-redeem SMS:',
            error.message,
          );
        }

        return {
          message: 'success',
          status: 200,
          topupValue: savedTopup.topupValue,
        };
      }

      return { message: 'success', status: 200 };
    }

    // 4. Unknown cardType
    else {
      throw new BadRequestException('Invalid card type.');
    }
  }

  async sendOtpAndPrepareRedemption(
    mobileNumber: number,
    storeCode: string,
    redeemPayload: {
      value: number;
      redeemValue: number;
      cardNumber?: number;
    },
  ) {
    if (!mobileNumber) {
      throw new BadRequestException('Mobile number is required');
    }

    const cardNumber = redeemPayload.cardNumber;
    if (!cardNumber) {
      throw new BadRequestException(
        'Card number is required to check monthly limit',
      );
    }

    // Step 1: Get cardType from registered customer table
    const customer = await this.RegisterCustomerEntityRepository.findOne({
      where: { cardNumber: cardNumber },
    });

    if (!customer) {
      throw new BadRequestException(
        'Registered customer not found for this card number',
      );
    }

    const cardType = Number(customer.cardType);
    const redeemValue = Number(redeemPayload.redeemValue);

    // Step 2: Check plan for is_one_time_redeem
    const plan = await this.LoyaltyPlanMasterEntityRepository.findOne({
      where: { id: customer.planId, companyId: customer.companyId },
    });
    console.log('plan: ', plan);

    const isOneTimeRedeem = plan?.isOneTimeRedeem === 1;
    console.log('isOneTimeRedeem: ', isOneTimeRedeem);

    // Step 3: If plan is NOT one-time redeem, perform monthly limit validation
    if (!isOneTimeRedeem && cardType === 1) {
      let monthlyLimit = 0;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);

      if (cardType === 1) {
        const purchasePlan = await this.RedeemPointEntityRepository.findOne({
          where: { cardNumber: cardNumber },
        });

        if (!purchasePlan) {
          throw new BadRequestException(
            'No purchase plan found for the given card number',
          );
        }

        monthlyLimit = Number(purchasePlan.monthlyLimit);
      } else if (cardType === 2) {
        const loyaltyPlans =
          await this.LoyaltyCardTopupMasterEntityRepository.find({
            where: { cardNumber: cardNumber },
          });

        if (!loyaltyPlans || loyaltyPlans.length === 0) {
          throw new BadRequestException(
            'No loyalty plan records found for the given card number',
          );
        }

        const currentMonthPlans = loyaltyPlans.filter((lp) => {
          const createdAt = new Date(lp.createdAt);
          return createdAt >= startOfMonth && createdAt < endOfMonth;
        });

        monthlyLimit = currentMonthPlans.reduce(
          (sum, plan) => sum + Number(plan.currentAmount || 0),
          0,
        );
      } else {
        throw new BadRequestException('Invalid card type');
      }

      // Step 4: Validate redemption limit
      if (redeemValue < 0) {
        throw new BadRequestException('Redeem value must not be negative');
      }

      const transactions = await this.RedeemTransactionEntityRepository.find({
        where: {
          cardNumber: cardNumber,
          createdAt: Between(startOfMonth, endOfMonth),
          status: 'dr',
          planId: customer.planId, // <-- key fix
        },
      });
      const totalRedeemed = transactions.reduce(
        (sum, txn) => sum + Number(txn.redeemValue),
        0,
      );

      if (totalRedeemed + redeemValue > monthlyLimit) {
        console.log('kl', monthlyLimit, totalRedeemed);
        const remainingLimit = Math.max(0, monthlyLimit - totalRedeemed);
        console.log('remainingLimit: ', remainingLimit);
        return {
          message: `You have exceeded your monthly redemption limit. You can redeem only ₹${remainingLimit} this month.`,
          status: 403,
        };
      }
    }

    // Step 5: Generate OTP and store it
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(mobileNumber.toString(), {
      otp,
      expiresAt,
      redeemPayload: {
        ...redeemPayload,
        mobileNumber,
      },
    });
    // --- NEW: fetch & compute current balance ---
    let currentAmount = 0;
    if (cardType === 1) {
      // for one‑time / purchase plans we store “pendingPoints” on RedeemPointEntity
      const purchasePlan = await this.RedeemPointEntityRepository.findOne({
        where: { cardNumber },
      });
      if (!purchasePlan) {
        throw new BadRequestException(
          'No purchase plan found for computing balance',
        );
      }
      currentAmount = Number(purchasePlan.pendingPoint || 0);
      console.log('currentAmount: ', currentAmount);
    } else {
      // for top‑up cards we sum up all `currentAmount` fields this month (or overall)
      const loyaltyPlans =
        await this.LoyaltyCardTopupMasterEntityRepository.find({
          where: { cardNumber },
        });
      currentAmount = loyaltyPlans.reduce(
        (sum, lp) => sum + Number(lp.currentAmount || 0),
        0,
      );
      console.log('currentAmount: ', currentAmount);
    }
    // --- END new balance logic ---

    try {
      // 2. Fetch company details
      const company = await this.CompanyMasterEntityRepository.findOne({
        where: { id: customer.companyId },
      });

      // Skip OTP SMS for cardType 2 when redeemValue is 0
      if (cardType === 2 && redeemValue === 0) {
        console.log(
          'kkk',
          redeemPayload.value,
          redeemValue,
          mobileNumber,
          cardNumber,
          customer.companyId,
          customer.id,
        );
        return await this.shoppingWithoutOtpShopping(
          redeemPayload.value,
          redeemValue,
          mobileNumber,
          cardNumber,
          storeCode,
          customer.companyId,
          customer.id, // or userId if you pass it
        );
      }
      // 1. Send OTP to email (optional)
      // await this.sendOtpToEmail(customer.customerEmail, otp);
      // 3. Send OTP SMS using point-redeem template

      await this.sendSmsTemplate(
        mobileNumber,
        customer.companyId,
        'otp-point-redeem',
        {
          customer_name: customer.customerName,
          loyalty_points: redeemPayload.redeemValue,
          company_name: company?.companyName || '',
          otp: otp,
          valid_time: 5,
          current_amount: currentAmount,
        },
      );

      return { message: 'success', status: 200 };
    } catch (error) {
      console.error('Error sending OTP SMS:', error.message);
      throw new BadRequestException('Error sending OTP');
    }
  }

  async verifyOtpAndRedeem(
    storeCode: string,
    mobileNumber: number,
    otp: string,
    req: any,
  ) {
    const companyId = req.user.companyId;
    console.log('storeCode:2 ', storeCode);
    const stored = otpStore.get(mobileNumber.toString());
    console.log('stored: ', stored);

    if (!stored) {
      throw new BadRequestException('No OTP requested or OTP expired.');
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(mobileNumber.toString());
      throw new BadRequestException('OTP has expired.');
    }

    if (stored.otp !== otp) {
      throw new BadRequestException('Invalid OTP.');
    }

    // OTP is valid, delete immediately (one-time use)
    otpStore.delete(mobileNumber.toString());

    const redeemResult = await this.redeemPoints(
      stored.redeemPayload.value,
      stored.redeemPayload.redeemValue,
      stored.redeemPayload.mobileNumber,
      stored.redeemPayload.cardNumber,
      companyId,
      storeCode,
    );

    return redeemResult;
  }
  async resendOtp(
    mobileNumber: number,
    storeCode: string,
    redeemPayload: {
      value: number;
      redeemValue: number;
      cardNumber?: number;
    },
  ) {
    if (!mobileNumber) {
      throw new BadRequestException('Mobile number is required');
    }

    const cardNumber = redeemPayload.cardNumber;
    if (!cardNumber) {
      throw new BadRequestException(
        'Card number is required to check monthly limit',
      );
    }

    // Step 1: Get cardType from registered customer table
    const customer = await this.RegisterCustomerEntityRepository.findOne({
      where: { cardNumber: cardNumber },
    });

    if (!customer) {
      throw new BadRequestException(
        'Registered customer not found for this card number',
      );
    }

    const cardType = Number(customer.cardType);
    const redeemValue = Number(redeemPayload.redeemValue);

    // Step 2: Check plan for is_one_time_redeem
    const plan = await this.LoyaltyPlanMasterEntityRepository.findOne({
      where: { id: customer.planId, companyId: customer.companyId },
    });
    console.log('plan: ', plan);

    const isOneTimeRedeem = plan?.isOneTimeRedeem === 1;
    console.log('isOneTimeRedeem: ', isOneTimeRedeem);

    // Step 3: If plan is NOT one-time redeem, perform monthly limit validation
    if (!isOneTimeRedeem && cardType === 1) {
      let monthlyLimit = 0;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);

      if (cardType === 1) {
        const purchasePlan = await this.RedeemPointEntityRepository.findOne({
          where: { cardNumber: cardNumber },
        });

        if (!purchasePlan) {
          throw new BadRequestException(
            'No purchase plan found for the given card number',
          );
        }

        monthlyLimit = Number(purchasePlan.monthlyLimit);
      } else if (cardType === 2) {
        const loyaltyPlans =
          await this.LoyaltyCardTopupMasterEntityRepository.find({
            where: { cardNumber: cardNumber },
          });

        if (!loyaltyPlans || loyaltyPlans.length === 0) {
          throw new BadRequestException(
            'No loyalty plan records found for the given card number',
          );
        }

        const currentMonthPlans = loyaltyPlans.filter((lp) => {
          const createdAt = new Date(lp.createdAt);
          return createdAt >= startOfMonth && createdAt < endOfMonth;
        });

        monthlyLimit = currentMonthPlans.reduce(
          (sum, plan) => sum + Number(plan.currentAmount || 0),
          0,
        );
      } else {
        throw new BadRequestException('Invalid card type');
      }

      // Step 4: Validate redemption limit
      if (redeemValue < 0) {
        throw new BadRequestException('Redeem value must not be negative');
      }

      const transactions = await this.RedeemTransactionEntityRepository.find({
        where: {
          cardNumber: cardNumber,
          createdAt: Between(startOfMonth, endOfMonth),
          status: 'dr',
          planId: customer.planId, // <-- key fix
        },
      });
      const totalRedeemed = transactions.reduce(
        (sum, txn) => sum + Number(txn.redeemValue),
        0,
      );

      if (totalRedeemed + redeemValue > monthlyLimit) {
        console.log('kl', monthlyLimit, totalRedeemed);
        const remainingLimit = Math.max(0, monthlyLimit - totalRedeemed);
        console.log('remainingLimit: ', remainingLimit);
        return {
          message: `You have exceeded your monthly redemption limit. You can redeem only ₹${remainingLimit} this month.`,
          status: 403,
        };
      }
    }

    // Step 5: Generate OTP and store it
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(mobileNumber.toString(), {
      otp,
      expiresAt,
      redeemPayload: {
        ...redeemPayload,
        mobileNumber,
      },
    });
    // --- NEW: fetch & compute current balance ---
    let currentAmount = 0;
    if (cardType === 1) {
      // for one‑time / purchase plans we store “pendingPoints” on RedeemPointEntity
      const purchasePlan = await this.RedeemPointEntityRepository.findOne({
        where: { cardNumber },
      });
      if (!purchasePlan) {
        throw new BadRequestException(
          'No purchase plan found for computing balance',
        );
      }
      currentAmount = Number(purchasePlan.pendingPoint || 0);
      console.log('currentAmount: ', currentAmount);
    } else {
      // for top‑up cards we sum up all `currentAmount` fields this month (or overall)
      const loyaltyPlans =
        await this.LoyaltyCardTopupMasterEntityRepository.find({
          where: { cardNumber },
        });
      currentAmount = loyaltyPlans.reduce(
        (sum, lp) => sum + Number(lp.currentAmount || 0),
        0,
      );
      console.log('currentAmount: ', currentAmount);
    }
    // --- END new balance logic ---

    try {
      // 2. Fetch company details
      const company = await this.CompanyMasterEntityRepository.findOne({
        where: { id: customer.companyId },
      });

      // Skip OTP SMS for cardType 2 when redeemValue is 0
      if (cardType === 2 && redeemValue === 0) {
        console.log(
          'kkk',
          redeemPayload.value,
          redeemValue,
          mobileNumber,
          cardNumber,
          customer.companyId,
          customer.id,
        );
        return await this.shoppingWithoutOtpShopping(
          redeemPayload.value,
          redeemValue,
          mobileNumber,
          cardNumber,
          storeCode,
          customer.companyId,
          customer.id, // or userId if you pass it
        );
      }
      // 1. Send OTP to email (optional)
      // await this.sendOtpToEmail(customer.customerEmail, otp);
      // 3. Send OTP SMS using point-redeem template

      await this.sendSmsTemplate(
        mobileNumber,
        customer.companyId,
        'otp-point-redeem',
        {
          customer_name: customer.customerName,
          loyalty_points: redeemPayload.redeemValue,
          company_name: company?.companyName || '',
          otp: otp,
          valid_time: 5,
          current_amount: currentAmount,
        },
      );

      return { message: 'success', status: 200 };
    } catch (error) {
      console.error('Error sending OTP SMS:', error.message);
      throw new BadRequestException('Error sending OTP');
    }
  }
  // =========================================================================
  async renewPlan(req: any, renewPlanDto: RenewPlanDto) {
    const { mobileNumber, cardNumber, planId } = renewPlanDto;

    // STEP 1: Fetch existing redeem point record
    const existingRedeem = await this.RedeemPointEntityRepository.findOne({
      where: [{ mobileNumber }, { cardNumber }],
      order: { validTill: 'DESC' },
    });

    if (!existingRedeem) {
      throw new BadRequestException(
        'No redeem point record found for this customer.',
      );
    }

    // STEP 2: Fetch new loyalty plan
    const plan = await this.LoyaltyPlanMasterEntityRepository.findOne({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException(
        'Loyalty plan not found for the provided ID.',
      );
    }

    // STEP 3: Redeem point calculations based on NEW plan only
    const newRedeemPoint = Number(plan.actualValue); // Fresh plan, full value
    const amountToCashier = Number(plan.denominationValue); // Full payment since fresh plan
    const monthlyLimit = Number(plan.monthlyUnit);
    const validMonth = Number(plan.validMonth);

    // STEP 4: Calculate new validTill date
    const today = new Date();
    const validTill = new Date(
      today.getFullYear(),
      today.getMonth() + validMonth,
      today.getDate(),
    );

    // STEP 5: Update RedeemPointEntity with fresh plan details
    existingRedeem.planId = plan.id;
    existingRedeem.denominationValue = plan.denominationValue;
    existingRedeem.actualValue = plan.actualValue;
    existingRedeem.validMonth = validMonth;
    existingRedeem.monthlyLimit = monthlyLimit;
    existingRedeem.redeemPoint = newRedeemPoint;
    existingRedeem.amountPayCashier = amountToCashier;
    existingRedeem.validTill = validTill;
    existingRedeem.spendPoint = 0;
    existingRedeem.pendingPoint = newRedeemPoint;
    existingRedeem.lastRedeemDate = null;

    await this.RedeemPointEntityRepository.save(existingRedeem);

    // STEP 6: Update RegisterUser planId
    await this.RegisterCustomerEntityRepository.update(
      { mobileNumber, cardNumber },
      { planId: plan.id },
    );

    const customer = await this.RegisterCustomerEntityRepository.findOne({
      where: { mobileNumber, cardNumber },
    });

    if (customer?.customerEmail) {
      await this.sendRenewalEmail(customer.customerEmail, existingRedeem); // Renewal email
    }

    return { message: 'success', status: 200 };
  }
  async sendRenewalEmail(
    email: string,
    redeem: RedeemPointEntity,
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'signfeedai@gmail.com',
        pass: 'vxskzhptpmztfknc',
      },
    });

    const mailOptions = {
      from: 'signfeedai@gmail.com',
      to: email,
      subject: 'Your Loyalty Plan Has Been Renewed 🎉',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Plan Renewed</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;800&display=swap" rel="stylesheet" />
  <style>
    body, table, td {
      font-family: "Poppins", Arial, sans-serif !important;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4">
  <table width="100%" height="100%" cellpadding="0" cellspacing="0" border="0" style="height: 100vh">
    <tr>
      <td align="center" valign="middle">
        <table width="800" cellpadding="0" cellspacing="0" border="0" style="background-color: #e2ffe6; border-radius: 8px; padding: 50px 70px">
          <tr>
            <td align="center" style="font-size: 34px; font-weight: 600; color: #2e7d32; padding-bottom: 20px;">
              🔄 Plan Renewed Successfully!
            </td>
          </tr>
          <tr>
            <td align="center" style="font-size: 16px; font-weight: 500; color: #333; line-height: 24px; padding: 0 70px 30px;">
              Thank you for renewing your loyalty plan! Here are your updated plan details.
            </td>
          </tr>
          <tr>
            <td>
              <table width="100%" cellpadding="15" cellspacing="0" border="0" style="background-color: #4caf50; border-radius: 12px; color: #ffffff;">
                <tr>
                  <td style="font-size: 16px">Card Number:</td>
                  <td align="right" style="font-size: 16px">${redeem.cardNumber}</td>
                </tr>
                <tr>
                  <td style="font-size: 16px">Total Loyalty Points:</td>
                  <td align="right" style="font-size: 16px">${redeem.actualValue}</td>
                </tr>
                <tr>
                  <td style="font-size: 16px">Monthly Redeem Limit:</td>
                  <td align="right" style="font-size: 16px">${redeem.monthlyLimit}</td>
                </tr>
                <tr>
                  <td style="font-size: 16px">Plan Valid Till:</td>
                  <td align="right" style="font-size: 16px">${new Date(redeem.validTill).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
    };

    await transporter.sendMail(mailOptions);
  }

  // bonus point
  async addBonusToLatestTopup(dto: AddBonusPointDto, req: any) {
    const companyId = req.user.companyId;
    const userId = req.user.userId;
    const { number, bonusPoint, bonusType, expiryDate } = dto;

    if (!number || !bonusPoint) {
      throw new BadRequestException('Number and bonusPoint are required.');
    }

    // Try mobileNumber first
    let lastTopup = await this.LoyaltyCardTopupMasterEntityRepository.findOne({
      where: {
        companyId,
        mobileNumber: number,
        cardType: 'loyalty',
      },
      order: { createdAt: 'DESC' },
    });

    // If not found, try cardNumber
    if (!lastTopup) {
      lastTopup = await this.LoyaltyCardTopupMasterEntityRepository.findOne({
        where: {
          companyId,
          cardNumber: number,
          cardType: 'loyalty',
        },
        order: { createdAt: 'DESC' },
      });
    }

    if (!lastTopup) {
      throw new NotFoundException('No matching top-up record found.');
    }

    // Add bonus to currentAmount
    lastTopup.currentAmount += bonusPoint;
    await this.LoyaltyCardTopupMasterEntityRepository.save(lastTopup);

    const expiry = expiryDate
      ? new Date(expiryDate)
      : moment().add(1, 'year').toDate();

    // Save bonus record (optional if still used)
    const bonusRecord = this.BonusRecordMasterEntityRepository.create({
      phoneNumber: lastTopup.mobileNumber,
      cardNumber: lastTopup.cardNumber,
      bonusAmount: bonusPoint,
      bonusType: bonusType || 'manual',
      bonusDate: new Date(),
      expiryStatus: false,
      expiryDate: expiry,
      storeCode: dto.storeCode,
      userId,
      companyId,
    });
    await this.BonusRecordMasterEntityRepository.save(bonusRecord);

    //  Save to BonusPointTracker
    const bonusTracker = this.BonusAmountManageMasterEntityRepository.create({
      phoneNumber: lastTopup.mobileNumber,
      cardNumber: lastTopup.cardNumber,
      bonusAmount: bonusPoint,
      bonusType: bonusType || 'manual',
      bonusDate: new Date(),
      expiryStatus: false, // Default false
      expiryDate: expiry,
      usedAmount: 0,
      remainingAmount: bonusPoint,
      storeCode: dto.storeCode,
      userId,
      companyId,
    });
    await this.BonusAmountManageMasterEntityRepository.save(bonusTracker);

    // Fetch customer name
    const customer = await this.RegisterCustomerEntityRepository.findOne({
      where: { mobileNumber: lastTopup.mobileNumber },
    });

    const customerName = customer?.customerName || 'Customer';

    const allTopups = await this.LoyaltyCardTopupMasterEntityRepository.find({
      where: {
        cardNumber: lastTopup.cardNumber,
        companyId,
        cardType: 'loyalty',
      },
    });

    const totalPoints = allTopups.reduce(
      (sum, record) => sum + Number(record.currentAmount || 0),
      0,
    );

    // Send SMS using new template
    await this.sendSmsTemplate(
      lastTopup.mobileNumber,
      companyId,
      'loyalty-bonus-point',
      {
        customer_name: customerName,
        bonus_points: bonusPoint.toFixed(2),
        updated_points: totalPoints.toFixed(2),
      },
    );

    return {
      message: 'success',
      status: 200,
    };
  }

  // sms for birthday and aniversary
  @Cron('0 8 * * *') // Every day at 08:00 AM
  async handleBirthdayAndAnniversarySMS() {
    console.log('job called');

    // Get today's date in IST
    const today = dayjs().tz('Asia/Kolkata');
    const todayMMDD = today.format('MM-DD');
    console.log(`🕗 Cron Started for date: ${todayMMDD}`);

    // Fetch matching customers using raw SQL with timezone conversion
    const customers = await this.RegisterCustomerEntityRepository.query(
      `
    SELECT * FROM register_customer 
    WHERE 
      DATE_FORMAT(CONVERT_TZ(birth_date, '+00:00', '+05:30'), '%m-%d') = ? 
      OR DATE_FORMAT(CONVERT_TZ(anniversary_date, '+00:00', '+05:30'), '%m-%d') = ?
    `,
      [todayMMDD, todayMMDD],
    );

    console.log('🎯 Customers matching today:', customers.length);

    for (const customer of customers) {
      const birthDateMMDD = customer.birth_date
        ? dayjs(customer.birth_date).tz('Asia/Kolkata').format('MM-DD')
        : null;

      const anniversaryDateMMDD = customer.anniversary_date
        ? dayjs(customer.anniversary_date).tz('Asia/Kolkata').format('MM-DD')
        : null;

      const matchesBirthday = birthDateMMDD === todayMMDD;
      const matchesAnniversary = anniversaryDateMMDD === todayMMDD;

      console.log(
        `${customer.customer_name} → Birthday: ${matchesBirthday}, Anniversary: ${matchesAnniversary}`,
      );

      const company = await this.CompanyMasterEntityRepository.findOne({
        where: { id: customer.company_id },
      });

      if (matchesBirthday) {
        await this.sendSmsTemplate(
          customer.mobile_number,
          customer.company_id,
          'happy-birthday-msg',
          {
            customer_name: customer.customer_name,
            company_name: company.companyName,
          },
        );
        console.log(`🎂 Sent birthday SMS to ${customer.customer_name}`);
      }

      if (matchesAnniversary) {
        await this.sendSmsTemplate(
          customer.mobile_number,
          customer.company_id,
          'happy-anniversary-msg',
          {
            customer_name: customer.customer_name,
            company_name: company.companyName,
          },
        );
        console.log(` Sent anniversary SMS to ${customer.customer_name}`);
      }
    }

    console.log(` Cron completed for ${customers.length} customer(s).`);
  }
  // Bonus expiry cron job
  @Cron('1 0 * * *')
  async handleBonusExpiry() {
    console.log('Cron job started for bonus expiry');
    const now = new Date();

    // Get all expired bonus records where some remaining is still there
    const expiredBonuses =
      await this.BonusAmountManageMasterEntityRepository.find({
        where: {
          expiryDate: LessThanOrEqual(now),
          expiryStatus: false,
          remainingAmount: MoreThan(0),
        },
      });

    console.log('expiredBonuses: ', expiredBonuses);

    for (const bonus of expiredBonuses) {
      const { remainingAmount, cardNumber, companyId, phoneNumber } = bonus;
      let toDeduct = remainingAmount;
      const topups = await this.LoyaltyCardTopupMasterEntityRepository.find({
        where: {
          cardNumber,
          companyId,
          cardType: 'loyalty',
        },
        order: { createdAt: 'DESC' },
      });

      for (const topup of topups) {
        if (toDeduct <= 0) break;

        const deduction = Math.min(topup.currentAmount, toDeduct);
        topup.currentAmount -= deduction;
        toDeduct -= deduction;
        await this.LoyaltyCardTopupMasterEntityRepository.save(topup);
      }

      // Update bonus record
      bonus.remainingAmount = 0;
      bonus.expiryStatus = true;
      await this.BonusAmountManageMasterEntityRepository.save(bonus);

      this.logger.log(
        `Expired bonus for card ${cardNumber}: ${remainingAmount} points removed.`,
      );
    }
  }
  // expired loyalty points cron job
  @Cron('1 0 * * *') // Runs every minute
  async handleTopupExpiry() {
    console.log('Cron job started for loyalty top-up expiry');
    const now = new Date();

    // Get all expired loyalty top-ups
    const expiredTopups =
      await this.LoyaltyCardTopupMasterEntityRepository.find({
        where: {
          validTill: LessThanOrEqual(now),
          currentAmount: MoreThan(0),
          cardType: 'loyalty',
        },
      });

    console.log('Expired top-ups: ', expiredTopups);

    for (const topup of expiredTopups) {
      const deduction = Math.min(topup.currentAmount, topup.topupValue); // avoid going negative
      topup.currentAmount -= deduction;

      await this.LoyaltyCardTopupMasterEntityRepository.save(topup);

      this.logger.log(
        `Expired top-up for card ${topup.cardNumber}: Deducted ${deduction}, Remaining ${topup.currentAmount}`,
      );
    }
  }
}
