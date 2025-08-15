import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Connection } from 'mysql2';
import { CompanyMasterEntity } from './Entity/CompanyMasterEntity';
import {
  Repository,
  Not,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  In,
  LessThan,
  Raw,
} from 'typeorm';
import { CompanyListDto } from './dto/CompanyListDto';
import { CreateCompanyDto } from './dto/CreateCompanyDto';
import { UpdateCompanyDto } from './dto/UpdateCompanyDto';
import { SearchCompanyDto } from './dto/SearchCompanyDto';
import { LocationMasterEntity } from './Entity/LocationMasterEntity';
import { LocationListDto } from './dto/LocationListDto';
import { SearchLocationDto } from './dto/SearchLocationDto';
import { CreateLocationDto } from './dto/CreateLocationDto';
import { UpdateLocationDto } from './dto/UpdateLocationDto';
import { StateMasterEntity } from './Entity/StateMasterEntity';
import { CreateUserDto } from './dto/CreateUserDto';
import * as bcrypt from 'bcrypt';
import moment from 'moment-timezone';
import { UpdateUserDto } from './dto/UpdateUserDto';
import {
  CompanyDto,
  LocationDto,
  PermissionDto,
  UserProfileDto,
} from './dto/UserProfileDto';
import { Multer } from 'multer';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as appRoot from 'app-root-path';
import { Workbook } from 'exceljs';

import { CreateUserRoleDto } from './dto/CreateUserRoleDto';
import { UserRoleMasterEntity } from './Entity/UserRoleMasterEntity';
import { UserPermissionMasterEntity } from './Entity/UserPermissionMasterEntity';
import { UserRolePermissionEntity } from './Entity/UserRolePermissionEntity';
import { CreateUserPermissionDto } from './dto/CreateUserPermissionDto';
import { AddUserRolePermissionDto } from './dto/AddUserRolePermissionDto';
import { SearchUserRoleDto } from './dto/SearchUserRoleDto';
import { SearchUserPermissionDto } from './dto/SearchUserPermissionDto';
import { SearchUserRolePermissionDto } from './dto/SearchUserRolePermissionDto';
import { UserRolePermissionResultDto } from './dto/UserRolePermissionResultDto';
import * as nodemailer from 'nodemailer';
import { RequestWithProtocol } from './interfaces/request.interface';
import { AuthUserEntity } from './Entity/AuthUserEntity';

import { CounterMasterEntity } from './Entity/CounterMasterEntity';
import { LoyaltyPlanMasterEntity } from './Entity/LoyaltyPlanMasterEntity';
import { CreateLoyaltyPlanDto } from './dto/CreateLoyaltyPlanDto';
import { UpdateLoyaltyPlanDto } from './dto/UpdateLoyaltyPlanDto';
import { LoyaltyPlanListDto } from './dto/LoyaltyPlanListDto';
import { RegisterCustomerEntity } from '../api/Entity/CustomerMasterEntity';
import { RegisterCustomerDto } from '../api/dto/RegisterCustomerDto';
import { SearchCustomerDto } from './dto/SearchCustomerDto';
import { LoyaltyCardTypeEntity } from './Entity/LoyaltyCardTypeEntity';
import { RedeemPointEntity } from 'src/api/Entity/RedeemPointEntity';
import { RedeemTransactionEntity } from 'src/api/Entity/RedeemTransactionEntity';
import { CompanyTierMasterEntity } from './Entity/CompanyTierMasterEntity';
import { CreateCompanyTierDto } from './dto/CreateCompanyTierDto';
import { CompanySmsTemplateEntity } from './Entity/CompanySmsTemplateEntity';
import { BonusRecordMasterEntity } from 'src/api/Entity/BonusRecordMatserEntity';
import { LoyaltyCardTopupMasterEntity } from 'src/api/Entity/LoyaltyTopUpCardMasterEntity';
import { StoreMasterEntity } from './Entity/StoreMasterEntity';
import { CreateStoreMasterDto } from './dto/CreateStoreMasterDto';
import { UpdateStoreMasterDto } from './dto/UpdateStoreDto';
import { JwtService } from '@nestjs/jwt';
import { RewardActionMasterEntity } from './Entity/RewardActionMasterEntity';
import { CreateRewardActionDto } from './dto/createRewardActionDto';
import { AssignCompanyRewardActionDto } from './dto/companyRewardActionDto';
import { CompanyRewardActionEntity } from './Entity/CompanyRewardMasterEntity';

interface EntryType {
  createdAt: Date;
  status: string;
  planName?: string;
  planType?: number | string;
  redeemPoint?: number;
  top_up_value?: number;
  bonusAmount?: number;
  redeemValue?: number;
}

@Injectable()
export class AdminService {
  private transporter: nodemailer.Transporter;
  constructor(
    private readonly jwtService: JwtService,
    @InjectDataSource() private readonly connection: Connection,
    @InjectRepository(CompanyMasterEntity)
    private readonly companyMasterRepository: Repository<CompanyMasterEntity>,
    @InjectRepository(LocationMasterEntity)
    private readonly locationMasterRepository: Repository<LocationMasterEntity>,
    @InjectRepository(CounterMasterEntity)
    private readonly counterMasterRepository: Repository<CounterMasterEntity>,
    @InjectRepository(StateMasterEntity)
    private readonly stateMasterRepository: Repository<StateMasterEntity>,
    @InjectRepository(AuthUserEntity)
    private readonly authUserRepository: Repository<AuthUserEntity>,
    @InjectRepository(UserRoleMasterEntity)
    private readonly userRoleMasterRepository: Repository<UserRoleMasterEntity>,
    @InjectRepository(UserPermissionMasterEntity)
    private readonly userPermissionMasterRepository: Repository<UserPermissionMasterEntity>,
    @InjectRepository(UserRolePermissionEntity)
    private readonly userRolePermissionRepository: Repository<UserRolePermissionEntity>,
    @InjectRepository(LoyaltyPlanMasterEntity)
    private readonly loyaltyPlanMasterEntityRepository: Repository<LoyaltyPlanMasterEntity>,
    @InjectRepository(RegisterCustomerEntity)
    private readonly registerCustomerEntityRepository: Repository<RegisterCustomerEntity>,
    @InjectRepository(RedeemPointEntity)
    private readonly RedeemPointEntityRepository: Repository<RedeemPointEntity>,
    @InjectRepository(RedeemTransactionEntity)
    private readonly RedeemTransactionEntityRepository: Repository<RedeemTransactionEntity>,
    @InjectRepository(LoyaltyCardTypeEntity)
    private readonly LoyaltyCardTypeEntityRepository: Repository<LoyaltyCardTypeEntity>,
    @InjectRepository(CompanyTierMasterEntity)
    private readonly CompanyTierMasterEntityRepository: Repository<CompanyTierMasterEntity>,
    @InjectRepository(CompanySmsTemplateEntity)
    private readonly CompanySmsTemplateEntityRepository: Repository<CompanySmsTemplateEntity>,
    @InjectRepository(BonusRecordMasterEntity)
    private readonly BonusRecordMasterEntityRepository: Repository<BonusRecordMasterEntity>,
    @InjectRepository(LoyaltyCardTopupMasterEntity)
    private readonly LoyaltyCardTopupMasterEntityRepository: Repository<LoyaltyCardTopupMasterEntity>,
    @InjectRepository(StoreMasterEntity)
    private readonly StoreMasterEntityRepository: Repository<StoreMasterEntity>,
    @InjectRepository(CompanyRewardActionEntity)
    private readonly CompanyRewardActionEntityRepository: Repository<CompanyRewardActionEntity>,
    @InjectRepository(RewardActionMasterEntity)
    private readonly RewardActionMasterEntityRepository: Repository<RewardActionMasterEntity>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'signfeedai@gmail.com',
        pass: 'vxskzhptpmztfknc',
      },
    });
  }
  async sendServiceTicketEmail(emailOptions: {
    cc: string[];
    htmlBody: string;
    subject: string;
    to: string;
    ticketId: number;
    attachments?: any[];
  }): Promise<void> {
    const { to, cc, subject, ticketId, htmlBody, attachments } = emailOptions;

    const mailOptions: nodemailer.SendMailOptions = {
      from: '"Service Desk" <signfeedai@gmail.com>',
      to: to,
      cc: cc,
      subject: `Service Ticket ${ticketId}: ${subject}`,
      html: htmlBody,
      attachments: attachments,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Service ticket email sent to ${to}`);
    } catch (error) {
      console.error('Error sending service ticket email:', error);
      throw new Error('Failed to send service ticket email');
    }
  }
  async adminUserList(req: any) {
    const roleName = req.user.roleName;
    console.log('req.user: ', req.user);
    const companyId = req.user.companyId;
    console.log('companyId: ', companyId);
    console.log('roleName: ', roleName);

    let query = `
    SELECT *
    FROM auth_user
  `;

    console.log('roleName: ', roleName);
    if (roleName === 'superAdmin') {
      query += ` WHERE username != 'superAdmin'`;
    } else {
      query += ` WHERE company_id = ${companyId}`;
    }

    query += ` ORDER BY created_on DESC`;

    const userList = await this.connection.query(query);

    return {
      message: 'success',
      status: 200,
      userlist: userList,
    };
  }

  async createUser(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.userPassword, 10);

    // Check if username already exists
    const checkUsername = await this.authUserRepository.findOne({
      where: { username: createUserDto.userName },
    });
    if (checkUsername) {
      throw new BadRequestException('Username Already Registered');
    }

    // Check if email already exists
    const checkEmail = await this.authUserRepository.findOne({
      where: { email: createUserDto.userEmail },
    });
    if (checkEmail) {
      throw new BadRequestException('Email Already Registered');
    }

    // Check if mobile already exists
    const checkMobile = await this.authUserRepository.findOne({
      where: { mobile: createUserDto.userMobile },
    });
    if (checkMobile) {
      throw new BadRequestException('User Mobile Already Registered');
    }

    // If all validations pass, create the user
    const userData: AuthUserEntity = new AuthUserEntity();
    userData.firstName = createUserDto.firstName;
    userData.lastName = createUserDto.lastName;
    userData.email = createUserDto.userEmail;
    userData.mobile = createUserDto.userMobile;
    userData.password = hashedPassword;
    userData.username = createUserDto.userName;
    userData.department = createUserDto.userDepartment;
    userData.userRole = createUserDto.userRole;
    userData.createdOn = new Date();
    userData.createdBy = 'admin';
    userData.isActive = createUserDto.isActive;
    userData.companyId = createUserDto.companyId;
    // userData.userType = createUserDto.userType;

    await this.authUserRepository.save(userData);
    return { message: 'success', status: 200 };
  }
  async updateUser(updateUserDto: UpdateUserDto) {
    const checkUser = await this.authUserRepository.findOne({
      where: { id: updateUserDto.id },
    });

    if (!checkUser) {
      throw new BadRequestException('User not found');
    }

    // Check if username is already used by another user
    const existingUsername = await this.authUserRepository.findOne({
      where: {
        username: updateUserDto.userName,
        id: Not(updateUserDto.id),
      },
    });
    if (existingUsername) {
      throw new BadRequestException('Username already registered');
    }

    // Check if email is already used by another user
    const existingEmail = await this.authUserRepository.findOne({
      where: {
        email: updateUserDto.userEmail,
        id: Not(updateUserDto.id),
      },
    });
    if (existingEmail) {
      throw new BadRequestException('Email already registered');
    }

    // Check if mobile is already used by another user
    const existingMobile = await this.authUserRepository.findOne({
      where: {
        mobile: updateUserDto.userMobile,
        id: Not(updateUserDto.id),
      },
    });
    if (existingMobile) {
      throw new BadRequestException('Mobile number already registered');
    }

    // Update all fields
    checkUser.firstName = updateUserDto.firstName;
    checkUser.lastName = updateUserDto.lastName;
    checkUser.email = updateUserDto.userEmail;
    checkUser.mobile = updateUserDto.userMobile;
    checkUser.username = updateUserDto.userName;
    checkUser.department = updateUserDto.userDepartment;
    checkUser.userRole = updateUserDto.userRole;
    // checkUser.userType = updateUserDto.userType;
    checkUser.isActive = updateUserDto.isActive;
    checkUser.companyId = updateUserDto.companyId;

    // Optional password update
    if (
      updateUserDto.userPassword &&
      updateUserDto.userPassword.trim() !== ''
    ) {
      const hashedPassword = await bcrypt.hash(updateUserDto.userPassword, 10);
      checkUser.password = hashedPassword;
    }

    await this.authUserRepository.save(checkUser);
    return { message: 'success', status: 200 };
  }
  async deleteUser(id: number) {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const checkUser = await this.authUserRepository.findOne({ where: { id } });

    if (!checkUser) {
      throw new BadRequestException('User not found');
    }

    checkUser.isActive = false;
    await this.authUserRepository.save(checkUser);

    return { message: 'succes', status: 200 };
  }
  async getUserProfile(username: string) {
    console.log('username: ', username);

    const userInfo = await this.authUserRepository.findOne({
      where: { username: username },
    });

    if (!userInfo) {
      throw new BadRequestException('User not found');
    }

    const userProfile = new UserProfileDto();
    userProfile.id = userInfo.id;
    userProfile.firstName = userInfo.firstName;
    userProfile.lastName = userInfo.lastName;
    userProfile.email = userInfo.email;
    userProfile.mobile = userInfo.mobile;
    userProfile.department = userInfo.department;
    userProfile.userRole = userInfo.userRole;

    if (userInfo.username === 'superAdmin') {
      const allCompanies = await this.companyMasterRepository.find();
      const allLocations = await this.locationMasterRepository.find();
      // const allCounters = await this.counterMasterRepository.find();
      const allPermissions = await this.userPermissionMasterRepository.find();

      const allLocationIds = allLocations.map((loc) => loc.id);

      userProfile.location = allLocations.map((loc) => {
        let locationDto = new LocationDto();
        locationDto.locationId = loc.id;
        locationDto.locationName = loc.locationName;
        return locationDto;
      });

      userProfile.company = allCompanies.map((comp) => ({
        companyId: comp.id,
        companyName: comp.companyName,
      }));

      userProfile.permission = allPermissions.map((perm) => ({
        permissionId: perm.id,
        permissionName: perm.permissionName,
      }));

      return {
        message: 'success',
        status: 200,
        userProfile,
      };
    } else {
      const companyInfo = await this.companyMasterRepository.find({
        where: { id: userInfo.companyId },
      });

      const locationInfo = await this.locationMasterRepository.find({
        where: { companyId: userInfo.companyId },
      });

      const locationIds = locationInfo.map((loc) => loc.id);

      const rolePermissions = await this.userRolePermissionRepository.find({
        where: {
          roleId: userInfo.userRole,
          isActive: true,
        },
      });

      const userPermissions = await Promise.all(
        rolePermissions.map(async (item) => {
          const permissionDet =
            await this.userPermissionMasterRepository.findOne({
              where: { id: item.permissionId },
            });

          if (!permissionDet) {
            throw new BadRequestException(
              'Permission Missing. Please contact administrator.',
            );
          }

          return {
            permissionId: permissionDet.id,
            permissionName: permissionDet.permissionName,
          };
        }),
      );
      userProfile.company = companyInfo.map((comp) => ({
        companyId: comp.id,
        companyName: comp.companyName,
      }));
      userProfile.location = locationInfo.map((loc) => {
        const locationDto = new LocationDto();
        locationDto.locationId = loc.id;
        locationDto.locationName = loc.locationName;

        return locationDto;
      });

      userProfile.permission = userPermissions;

      return {
        message: 'success',
        status: 200,
        userProfile,
      };
    }
  }
  async stateList() {
    let stateData = await this.stateMasterRepository.find();
    return {
      message: 'success',
      status: 200,
      stateData,
    };
  }
  // Company List API
  async companyList(request: any) {
    const userName = request.user.username;

    // Check if the user is superAdmin
    if (userName === 'superAdmin') {
      const allCompanies = await this.companyMasterRepository.find();
      return allCompanies.map((company) => this.toCompanyDto(company));
    }
    let checkUserCompany = await this.authUserRepository.findOne({
      where: {
        username: userName,
      },
    });

    if (checkUserCompany) {
      const companyList = await this.companyMasterRepository.find({
        where: {
          id: checkUserCompany.companyId,
        },
      });
      return companyList.map((company) => this.toCompanyDto(company));
    }
  }
  async companyDetailList(id: number) {
    if (!id) {
      throw new BadRequestException('Company ID is required.');
    }

    const company = await this.companyMasterRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new BadRequestException('Company not found!');
    }

    return this.toCompanyDto(company);
  }
  private toCompanyDto(company: CompanyMasterEntity): CompanyListDto {
    const companyDto = new CompanyListDto();
    companyDto.id = company.id;
    companyDto.companyName = company.companyName;
    companyDto.companyAddress1 = company.address1;
    companyDto.companyAddress2 = company.address2;
    companyDto.companyCity = company.city;
    companyDto.companyState = company.state;
    companyDto.isActive = company.isActive;

    // Map other fields as needed
    return companyDto;
  }
  // End of Company List API
  async searchCompany(searchCompanyDto: SearchCompanyDto) {
    let companyData = await this.companyMasterRepository.findOne({
      where: {
        id: searchCompanyDto.companyId,
      },
    });
    if (companyData) {
      const companyDto = new CompanyListDto();
      companyDto.companyName = companyData.companyName;
      companyDto.companyAddress1 = companyData.address1;
      companyDto.companyAddress2 = companyData.address2;
      companyDto.companyCity = companyData.city;
      companyDto.companyState = companyData.state;
      companyDto.isActive = companyData.isActive;
      return companyDto;
    } else {
      throw new BadRequestException('Company Does Not Exist');
    }
  }
  // Create New Company
  async createCompany(file: Multer.File[], createCompanyDto: CreateCompanyDto) {
    // Check if same company name + location already exists
    const checkCompany = await this.companyMasterRepository.findOne({
      where: {
        companyName: createCompanyDto.companyName,
        city: createCompanyDto.companyCity, // or locationName if you have that field
      },
    });

    if (checkCompany) {
      throw new BadRequestException(
        'Company with this name and location already exists',
      );
    }

    const companyData: CompanyMasterEntity = new CompanyMasterEntity();
    companyData.companyName = createCompanyDto.companyName;
    companyData.address1 = createCompanyDto.companyAddress1;
    companyData.address2 = createCompanyDto.companyAddress2;
    companyData.city = createCompanyDto.companyCity;
    companyData.state = createCompanyDto.companyState;
    companyData.isActive = createCompanyDto.isActive;

    if (file && file.length > 0) {
      if (!this.validateFileType(file[0]) || !this.validateFileSize(file[0])) {
        throw new BadRequestException('Invalid file type or size.');
      }

      const fileNameDigit = this.generateRandomDigits(20);
      const newFileName = `${fileNameDigit}`;
      const filename = file[0].originalname;
      const fileExtension = path.extname(filename);
      const storedAsFileName = newFileName + fileExtension;
      await this.saveFileToDirectory(file[0], storedAsFileName);

      companyData.companyLogo = '/uploads/' + storedAsFileName;
    }

    await this.companyMasterRepository.save(companyData);
    const securityToken = this.jwtService.sign(
      {
        companyId: companyData.id,
        companyName: companyData.companyName,
      },
      {
        secret: process.env.JWT_SECRET || 'yourSecretKey',
        expiresIn: '365d',
      },
    );

    companyData.companyUrlString = securityToken;
    await this.companyMasterRepository.save(companyData);

    const templates = [
      {
        template_key: 'register-customer',
        template_text: `Dear {customer_name}! Welcome to {company_name} Loyalty Program. Enjoy exclusive rewards and offers. Thank you for joining us. Powered by Harij Softech.`,
        template_id: '684bcf7b8b4c1e76cc38d861',
      },
      {
        template_key: 'otp-point-redeem',
        template_text: `Hi {customer_name}! Your OTP for redeeming {loyalty_points} loyalty points at {company_name} is {otp}. This code is valid for {valid_time} minutes. Please do not share it with anyone. Your current loyalty point balance is {current_amount}. Powered by Harij Softech.`,
        template_id: '684bd04525d44f28a31288f2', // replace with actual ID if you have one
      },
      {
        template_key: 'earn-loyalty-point-without-redeem',
        template_text: `Hi {customer_name}! Thank you for shopping with {company_name}. You’ve earned {loyalty_points} loyalty points. Your updated loyalty point balance is {available_points}. Keep enjoying your rewards. Powered by Harij Softech.
`,
        template_id: '687630102fa55517997a7c03',
      },
      {
        template_key: 'loyalty-bonus-point',
        template_text: `Congratulations, ##customer_name##! You've earned ##bonus_points## loyalty bonus points! Your updated loyalty point balance is ##updated_points##. Keep enjoying the rewards and happy shopping! 

Powered by Harij Softech`,
        template_id: '686ca2c719d51f0a702d9c25', // replace with your new actual ID
      },

      {
        template_key: 'happy-birthday-msg',
        template_text: `Happy Birthday, ##customer_name##! To make your celebration even more special, visit ##company_name## and receive your bonus loyalty points today! Celebrate with rewards—because you deserve it. Happy Shopping!`,
        template_id: '686ca598ebb0d10a206ab0f5', // replace with your new actual ID
      },
      {
        template_key: 'happy-anniversary-msg',
        template_text: `Happy Anniversary, ##customer_name##! To make your celebration even more special, visit ##company_name## and receive your bonus loyalty points today! Celebrate with rewards—because you deserve it. Happy Shopping!`,
        template_id: '686ca6036b77f672076a9f72', // replace with your new actual ID
      },
      {
        template_key: 'normal-thanks-after-point-redemption',
        template_text: `Hi {customer_name}! Thank you for shopping with {company_name}. Your current loyalty point balance is {loyalty_point}. Keep enjoying your rewards.
        Powered by Harij Softech.`,
        template_id: '6876038f4f909047c02d0f9a',
      },
      {
        template_key: 'prepaid-welcome',
        template_text: `Hi {customer_name}! Thank you for choosing {company_name} Loyalty Program. Your current point balance is {total_point}. Happy shopping. 

Powered by Harij Softech.`,
        template_id: '68773fbf7a3ed71fe65d3e96',
      },
      {
        template_key: 'prepaid-thanks',
        template_text: `Hi {customer_name}! Thank you for shopping with {company_name}. Your current point balance is {total_points}. Happy shopping. 

Powered by Harij Softech.`,
        template_id: '6877406d7a3ed71fe65d3e99',
      },
    ];

    for (const tmpl of templates) {
      const smsTemplate = new CompanySmsTemplateEntity();
      smsTemplate.companyId = companyData.id;
      smsTemplate.companyName = createCompanyDto.companyName;
      smsTemplate.templateKey = tmpl.template_key;
      smsTemplate.templateId = tmpl.template_id;
      smsTemplate.templateText = tmpl.template_text;
      await this.CompanySmsTemplateEntityRepository.save(smsTemplate);
    }

    return { message: 'success', status: 200 };
  }
  // Update Existing Company
  async updateCompany(request: any, updateCompanyDto: UpdateCompanyDto) {
    const userName = request.user.username;
    let checkCompanyName = await this.companyMasterRepository.findOne({
      where: {
        companyName: updateCompanyDto.companyName,
        id: Not(updateCompanyDto.companyId),
      },
    });
    if (checkCompanyName) {
      throw new BadRequestException('Company Name Already Exist');
    } else {
      let checkCompany = await this.companyMasterRepository.findOne({
        where: {
          id: updateCompanyDto.companyId,
        },
      });
      if (checkCompany) {
        checkCompany.companyName = updateCompanyDto.companyName;
        checkCompany.address1 = updateCompanyDto.companyAddress1;
        checkCompany.address2 = updateCompanyDto.companyAddress2;
        checkCompany.city = updateCompanyDto.companyCity;
        checkCompany.state = updateCompanyDto.companyState;
        checkCompany.isActive = updateCompanyDto.isActive;
        await this.companyMasterRepository.save(checkCompany);
        return { message: 'success', status: 200 };
      } else {
        throw new BadRequestException('Company Does Not Exist');
      }
    }
  }
  // Search location by company ID
  async locationList(searchCompanyDto: SearchCompanyDto) {
    let checkCompany = await this.companyMasterRepository.findOne({
      where: {
        id: searchCompanyDto.companyId,
      },
    });
    if (checkCompany) {
      let locationData = await this.locationMasterRepository.find({
        where: {
          companyId: checkCompany.id,
        },
      });
      let locationList = await locationData.map((location) =>
        this.toLocationDto(location, checkCompany.companyName),
      );
      return locationList;
    } else {
      throw new BadRequestException('No record found!');
    }
  }
  private toLocationDto(
    location: LocationMasterEntity,
    companyName: string,
  ): LocationListDto {
    const LocationDto = new LocationListDto();
    LocationDto.id = location.id;
    LocationDto.locationName = location.locationName;
    LocationDto.locationAddress1 = location.locationAdd1;
    LocationDto.locationAddress2 = location.locationAdd2;
    LocationDto.locationCity = location.city;
    LocationDto.locationState = location.state;
    LocationDto.isActive = location.isActive;
    LocationDto.companyName = companyName;
    LocationDto.locationUrlString = location.locationUrlString;

    return LocationDto;
  }
  async searchLocation(searchLocationDto: SearchLocationDto) {
    let locationData = await this.locationMasterRepository.findOne({
      where: {
        id: searchLocationDto.locationId,
      },
    });
    if (locationData) {
      let locationDto = new LocationListDto();
      locationDto.locationName = locationData.locationName;
      locationDto.locationAddress1 = locationData.locationAdd1;
      locationDto.locationAddress2 = locationData.locationAdd2;
      locationDto.locationCity = locationData.city;
      locationDto.locationState = locationData.state;
      locationDto.isActive = locationData.isActive;
      return locationDto;
    }
  }
  async createLocation(request: any, createLocationDto: CreateLocationDto) {
    const companyId = request.user.companyId;

    // Check for duplicate location for the same company
    const checkLocationName = await this.locationMasterRepository.findOne({
      where: {
        locationName: createLocationDto.locationName,
        companyId: companyId,
      },
    });

    if (checkLocationName) {
      throw new BadRequestException(
        'Location with this name already exists for the company!',
      );
    }

    // Create base location entity
    const locationData = new LocationMasterEntity();
    locationData.locationName = createLocationDto.locationName;
    locationData.locationAdd1 = createLocationDto.locationAddress1;
    locationData.locationAdd2 = createLocationDto.locationAddress2;
    locationData.city = createLocationDto.locationCity;
    locationData.state = createLocationDto.locationState;
    locationData.isActive = createLocationDto.isActive;
    locationData.companyId = companyId;

    locationData.locationUrlString = await this.generateRandomString(20);

    await this.locationMasterRepository.save(locationData);

    return { message: 'success', status: 200 };
  }
  async updateLocation(updateLocationDto: UpdateLocationDto) {
    let checkLocation = await this.locationMasterRepository.findOne({
      where: {
        id: updateLocationDto.locationId,
      },
    });
    if (checkLocation) {
      let checkLocationName = await this.locationMasterRepository.findOne({
        where: {
          locationName: updateLocationDto.locationName,
          id: Not(updateLocationDto.locationId),
        },
      });
      if (checkLocationName) {
        throw new BadRequestException('Location Name Already Exist!');
      } else {
        checkLocation.locationName = updateLocationDto.locationName;
        checkLocation.locationAdd1 = updateLocationDto.locationAddress1;
        checkLocation.locationAdd2 = updateLocationDto.locationAddress2;
        checkLocation.city = updateLocationDto.locationCity;
        checkLocation.state = updateLocationDto.locationState;
        checkLocation.companyId = updateLocationDto.companyId;
        checkLocation.isActive = updateLocationDto.isActive;

        await this.locationMasterRepository.save(checkLocation);
        return { message: 'success', status: 200 };
      }
    }
  }
  async addUserRoleMaster(createUserRoleDto: CreateUserRoleDto) {
    let checkUserRoleName = await this.userRoleMasterRepository.findOne({
      where: {
        roleName: createUserRoleDto.roleName,
      },
    });
    if (checkUserRoleName) {
      throw new BadRequestException('Role Name Already Exist!');
    } else {
      let userRole: UserRoleMasterEntity = new UserRoleMasterEntity();
      userRole.roleName = createUserRoleDto.roleName;
      userRole.isActive = createUserRoleDto.isActive;
      await this.userRoleMasterRepository.save(userRole);
      return { message: 'success', status: 200 };
    }
  }
  async addUserPermissionMaster(
    createUserPermissionDto: CreateUserPermissionDto,
  ) {
    let checkUserPermissionName =
      await this.userPermissionMasterRepository.findOne({
        where: {
          permissionName: createUserPermissionDto.permissionName,
        },
      });
    if (checkUserPermissionName) {
      throw new BadRequestException('Permission Name Already Exist!');
    } else {
      let userPermission: UserPermissionMasterEntity =
        new UserPermissionMasterEntity();
      userPermission.permissionName = createUserPermissionDto.permissionName;
      userPermission.isActive = createUserPermissionDto.isActive;
      await this.userPermissionMasterRepository.save(userPermission);
      return { message: 'success', status: 200 };
    }
  }
  async addUserRolePermission(
    addUserRolePermissionDto: AddUserRolePermissionDto[],
  ) {
    try {
      const results = await Promise.all(
        addUserRolePermissionDto.map(async (permissionItem) => {
          let permission = await this.userRolePermissionRepository.findOne({
            where: {
              roleId: permissionItem.roleId,
              permissionId: permissionItem.permissionId,
            },
          });

          if (permission) {
            permission.isActive = permissionItem.isActive;
          } else {
            permission = this.userRolePermissionRepository.create({
              roleId: permissionItem.roleId,
              permissionId: permissionItem.permissionId,
              isActive: permissionItem.isActive,
            });
          }

          return this.userRolePermissionRepository.save(permission);
        }),
      );

      return { message: 'success', status: 200, data: results };
    } catch (error) {
      // Log the error here
      return {
        message: 'An error occurred',
        status: 500,
        error: error.message,
      };
    }
  }
  async listUserRoleMaster(searchUserRoleDto: SearchUserRoleDto) {
    if (searchUserRoleDto.roleId) {
      let checkRoleId = await this.userRoleMasterRepository.findOne({
        where: {
          id: searchUserRoleDto.roleId,
        },
      });
      if (checkRoleId) {
        return checkRoleId;
      } else {
        throw new BadRequestException('Role Does Not Exist!');
      }
    } else {
      let userRoleList = await this.userRoleMasterRepository.find();
      return userRoleList;
    }
  }
  async listUserPermissionMaster(
    searchUserPermissionDto: SearchUserPermissionDto,
  ) {
    if (searchUserPermissionDto.permissionId) {
      let checkPermissionId = await this.userPermissionMasterRepository.findOne(
        {
          where: {
            id: searchUserPermissionDto.permissionId,
          },
        },
      );
      if (checkPermissionId) {
        return checkPermissionId;
      } else {
        throw new BadRequestException('Permission Does Not Exist!');
      }
    } else {
      let userPermissionList = await this.userPermissionMasterRepository.find();
      return userPermissionList;
    }
  }
  async listUserRolePermission(
    searchUserRolePermissionDto: SearchUserRolePermissionDto,
  ) {
    if (!searchUserRolePermissionDto.roleId) {
      throw new BadRequestException('Parameter Missing');
    }

    try {
      const rolePermissions = await this.userRolePermissionRepository.find({
        where: {
          roleId: searchUserRolePermissionDto.roleId,
          isActive: true,
        },
      });

      if (rolePermissions.length === 0) {
        return [];
      }

      const userPermissions = await Promise.all(
        rolePermissions.map(async (item) => {
          const permissionDet =
            await this.userPermissionMasterRepository.findOne({
              where: {
                id: item.permissionId,
              },
            });

          if (!permissionDet) {
            throw new BadRequestException(
              'Permission Missing. Please contact administrator.',
            );
          }

          return {
            permissionId: permissionDet.id,
            permissionName: permissionDet.permissionName,
            isActive: permissionDet.isActive,
          };
        }),
      );

      return userPermissions;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Log the error here
      throw new InternalServerErrorException(
        'An error occurred while fetching user role permissions',
      );
    }
  }
  validateFileType(file: Multer.File): boolean {
    // Define the allowed file types (e.g., image/jpeg, application/pdf)
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
    ];
    return allowedTypes.includes(file.mimetype);
  }
  validateFileSize(file: Multer.File): boolean {
    // Define the maximum file size in bytes (e.g., 50MB)
    const maxSize = 50 * 1024 * 1024; // 5MB
    return file.size <= maxSize;
  }
  async saveFileToDirectory(file: Multer.File, filename): Promise<string> {
    const uploadDir = path.join(appRoot.toString(), 'uploads'); // Use app-root-path to get the root directory
    await fs.ensureDir(uploadDir); // Make sure the directory exists
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, file.buffer);
    return filePath;
  }
  private generateRandomDigits(length: number): string {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  private async generateRandomString(length: number): Promise<string> {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  async createLoyaltyPlan(
    request: any,
    createLoyaltyPlanDto: CreateLoyaltyPlanDto,
  ) {
    const companyId = request.user.companyId;
    const userId = request.user.userId;
    console.log('userId: ', userId);

    // Step 1: Validate that denominationValue is less than actualValue
    if (
      createLoyaltyPlanDto.denominationValue >= createLoyaltyPlanDto.actualValue
    ) {
      throw new BadRequestException(
        'Denomination value must be less than the actual value!',
      );
    }

    // Step 2: Check if a loyalty plan with the same name already exists for the company
    const existingPlan = await this.loyaltyPlanMasterEntityRepository.findOne({
      where: {
        planName: createLoyaltyPlanDto.planName,
        companyId: companyId,
      },
    });

    if (existingPlan) {
      throw new BadRequestException(
        'Loyalty plan with this name already exists for the company!',
      );
    }

    // Step 3: Create new loyalty plan
    const loyaltyPlan = new LoyaltyPlanMasterEntity();
    loyaltyPlan.planName = createLoyaltyPlanDto.planName;
    loyaltyPlan.actualValue = createLoyaltyPlanDto.actualValue;
    loyaltyPlan.denominationValue = createLoyaltyPlanDto.denominationValue;
    loyaltyPlan.validMonth = createLoyaltyPlanDto.validMonth;
    loyaltyPlan.isOneTimeRedeem = createLoyaltyPlanDto.isOneTimeRedeem || 0;
    // Step 4: Calculate the monthly unit
    const unit =
      createLoyaltyPlanDto.validMonth > 0
        ? createLoyaltyPlanDto.actualValue / createLoyaltyPlanDto.validMonth
        : 0;
    loyaltyPlan.monthlyUnit = Math.round(unit);

    // Step 5: Set plan status, company, and user IDs
    loyaltyPlan.status = createLoyaltyPlanDto.status ?? 1;
    loyaltyPlan.companyId = companyId;
    loyaltyPlan.userId = userId;

    // Step 6: Save the loyalty plan to the database
    await this.loyaltyPlanMasterEntityRepository.save(loyaltyPlan);

    // Step 7: Return success response
    return {
      message: 'success',
      status: 200,
    };
  }
  async updateLoyaltyPlan(updateLoyaltyPlanDto: UpdateLoyaltyPlanDto) {
    // Step 1: Check if the loyalty plan exists
    let checkPlan = await this.loyaltyPlanMasterEntityRepository.findOne({
      where: {
        id: updateLoyaltyPlanDto.planId,
      },
    });

    if (!checkPlan) {
      throw new BadRequestException('Loyalty plan not found!');
    }

    // Step 2: Validate that denominationValue is less than actualValue
    if (
      updateLoyaltyPlanDto.denominationValue >= updateLoyaltyPlanDto.actualValue
    ) {
      throw new BadRequestException(
        'Denomination value must be less than the actual value!',
      );
    }

    // Step 3: Check if the plan name already exists (excluding the current plan)
    let checkPlanName = await this.loyaltyPlanMasterEntityRepository.findOne({
      where: {
        planName: updateLoyaltyPlanDto.planName,
        id: Not(updateLoyaltyPlanDto.planId),
      },
    });

    if (checkPlanName) {
      throw new BadRequestException('Plan name already exists!');
    }

    // Step 4: Update the loyalty plan fields
    checkPlan.planName = updateLoyaltyPlanDto.planName;
    checkPlan.actualValue = updateLoyaltyPlanDto.actualValue;
    checkPlan.denominationValue = updateLoyaltyPlanDto.denominationValue;
    checkPlan.validMonth = updateLoyaltyPlanDto.validMonth;
    checkPlan.isOneTimeRedeem =
      updateLoyaltyPlanDto.isOneTimeRedeem || checkPlan.isOneTimeRedeem;
    // Step 5: Calculate the monthly unit
    const unit =
      updateLoyaltyPlanDto.validMonth > 0
        ? updateLoyaltyPlanDto.denominationValue /
          updateLoyaltyPlanDto.validMonth
        : 0;
    checkPlan.monthlyUnit = Math.round(unit);

    // Step 6: Update the status
    checkPlan.status = updateLoyaltyPlanDto.status ?? 1;

    // Step 7: Save the updated plan to the database
    await this.loyaltyPlanMasterEntityRepository.save(checkPlan);

    // Step 8: Return success response
    return { message: 'success', status: 200 };
  }

  async loyaltyPlanList(req: any) {
    const { companyId, username } = req.user;
    console.log('jk', companyId, username);
    if (username === 'superAdmin') {
      // Return all company tiers for superAdmin
      const tiers = await this.loyaltyPlanMasterEntityRepository.find();
      return {
        message: 'success',
        status: 200,
        tiers,
      };
    }
    if (!companyId) {
      throw new BadRequestException('Company ID not found in request!');
    }
    // Return tiers for specific company
    const tiers = await this.loyaltyPlanMasterEntityRepository.find({
      where: { companyId },
    });
    return {
      message: 'success',
      status: 200,
      tiers,
    };
  }

  async customerList(req: any) {
    const companyId = req.user.companyId;
    if (!companyId) {
      throw new BadRequestException('Company ID is required');
    }

    // Step 1: Get all customers by companyId
    const customers = await this.registerCustomerEntityRepository.find({
      where: { companyId },
    });

    if (!customers || customers.length === 0) {
      throw new NotFoundException('No customers found for this company');
    }

    const customerData = [];

    for (const customer of customers) {
      let totalBalance = 0;

      if (customer.cardType === 2) {
        // Loyalty Card
        const topups = await this.LoyaltyCardTopupMasterEntityRepository.find({
          where: [
            { cardNumber: customer.cardNumber, companyId },
            { mobileNumber: customer.mobileNumber, companyId },
          ],
        });

        const bonuses = await this.BonusRecordMasterEntityRepository.find({
          where: [
            { cardNumber: customer.cardNumber, companyId },
            { phoneNumber: customer.mobileNumber, companyId },
          ],
        });

        const totalTopup = topups.reduce(
          (sum, t) => sum + (t.currentAmount || 0),
          0,
        );

        totalBalance = Math.max(0, totalTopup);
      } else if (customer.cardType === 1) {
        // Purchase Card
        const points = await this.RedeemPointEntityRepository.find({
          where: [
            { cardNumber: customer.cardNumber, companyId },
            { mobileNumber: customer.mobileNumber, companyId },
          ],
        });

        const transactions = await this.RedeemTransactionEntityRepository.find({
          where: [
            { cardNumber: customer.cardNumber, companyId },
            { mobileNumber: customer.mobileNumber, companyId },
          ],
        });

        const pointBalance = points.reduce(
          (sum, p) => sum + (p.pendingPoint || 0),
          0,
        );

        console.log('pointBalance: ', pointBalance);
        totalBalance = Math.max(0, pointBalance);
      }

      customerData.push({
        ...customer,
        totalBalance,
      });
    }

    return customerData;
  }

  private toCustomerDto(
    customer: RegisterCustomerEntity,
    companyName: string,
  ): SearchCustomerDto {
    const dto = new SearchCustomerDto();
    dto.id = customer.id;
    dto.mobileNumber = customer.mobileNumber;
    dto.cardNumber = customer.cardNumber;
    dto.customerName = customer.customerName;
    dto.customerEmail = customer.customerEmail;
    dto.gender = customer.gender;
    dto.birthDate = customer.birthDate;
    dto.anniversaryDate = customer.anniversaryDate;
    dto.planId = customer.planId;
    dto.termsAccepted = customer.termsAccepted;
    dto.status = customer.status;

    return dto;
  }
  async cardTypeList() {
    const data = await this.LoyaltyCardTypeEntityRepository.find();
    return {
      message: 'success',
      status: 200,
      data,
    };
  }
  async createCompanyTier(
    request: any,
    createCompanyTierDto: CreateCompanyTierDto,
  ) {
    const userId = request.user.userId;
    const companyId = createCompanyTierDto.companyId;

    const tiersToSave: CompanyTierMasterEntity[] = [];

    for (const tier of createCompanyTierDto.tiers) {
      const existing = await this.CompanyTierMasterEntityRepository.findOne({
        where: {
          companyId,
          fromAmount: tier.fromAmount,
          toAmount: tier.toAmount,
        },
      });

      if (existing) {
        // Skip or log duplicates (optional: throw error if you prefer)
        console.warn(
          `Duplicate tier found for companyId=${companyId}, from=${tier.fromAmount}, to=${tier.toAmount}`,
        );
        continue;
      }

      const companyTier = new CompanyTierMasterEntity();
      companyTier.companyId = companyId;
      companyTier.fromAmount = tier.fromAmount;
      companyTier.toAmount = tier.toAmount;
      companyTier.topupPercent = tier.topupPercent;
      companyTier.validity = tier.validity;

      tiersToSave.push(companyTier);
    }

    if (tiersToSave.length > 0) {
      await this.CompanyTierMasterEntityRepository.save(tiersToSave);
    }

    return {
      message: 'success',
      status: 200,
    };
  }
  async CompanyTierList(req: any) {
    const { companyId, username } = req.user;
    if (username === 'superAdmin') {
      // Return all company tiers for superAdmin
      const allTiers = await this.CompanyTierMasterEntityRepository.find();
      return allTiers;
    }
    if (!companyId) {
      throw new BadRequestException('Company ID not found in request!');
    }
    // Return tiers for specific company
    const tiers = await this.CompanyTierMasterEntityRepository.find({
      where: { companyId },
    });
    return tiers;
  }
  async generateAnnualReport(
    userId: number,
    companyId: number,
    storeCode: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<Uint8Array> {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (from) from.setHours(0, 0, 0, 0);
    if (to) to.setHours(23, 59, 59, 999);

    const customerWhere: any = { userId, companyId, storeCode };
    if (from && to) customerWhere.createdAt = Between(from, to);

    const [
      customers,
      plans,
      transactions,
      bonuses,
      topups,
      planMasters,
      cardTypes,
    ] = await Promise.all([
      this.registerCustomerEntityRepository.find({ where: customerWhere }),
      this.RedeemPointEntityRepository.find({
        where: { userId, companyId, storeCode },
      }),
      this.RedeemTransactionEntityRepository.find({
        where: { companyId, storeCode },
      }),
      this.BonusRecordMasterEntityRepository.find({
        where: { userId, companyId, storeCode },
      }),
      this.LoyaltyCardTopupMasterEntityRepository.find({
        where: { companyId, storeCode },
      }),
      this.loyaltyPlanMasterEntityRepository.find({
        where: { userId, companyId },
      }),
      this.LoyaltyCardTypeEntityRepository.find(),
    ]);

    const planMap = new Map(planMasters.map((p) => [p.id, p.planName || '-']));
    const cardTypeMap = new Map(
      cardTypes.map((c) => [c.id, c.cardType || '-']),
    );

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Annual Report');
    sheet.columns = Array(13).fill({ width: 20 });
    sheet.addRow([
      'Customer Name',
      'Card Number',
      'Phone Number',
      'Card Type',
      'Created At',
      'Plan Type',
      'Plan Name',
      'Earn Points',
      'Redeem Points',
      // 'Bonus Amount',
      'Status',
      'Total Balance',
    ]);

    for (const customer of customers) {
      let balance = 0;
      const entries: EntryType[] = [
        { createdAt: customer.createdAt, status: 'REG' },
      ];

      if (customer.cardType === 1) {
        plans
          .filter(
            (p) =>
              (p.cardNumber === customer.cardNumber ||
                p.mobileNumber === customer.mobileNumber) &&
              (!from || new Date(p.createdAt) >= from) &&
              (!to || new Date(p.createdAt) <= to),
          )

          .forEach((p) =>
            entries.push({
              ...p,
              status: 'CR',
              createdAt: p.createdAt,
              planName: planMap.get(p.planId) || '-',
              planType: p.planId,
              redeemPoint: p.redeemPoint,
            }),
          );
      } else if (customer.cardType === 2) {
        topups
          .filter(
            (t) =>
              (t.cardNumber === customer.cardNumber ||
                t.mobileNumber === customer.mobileNumber) &&
              (!from || new Date(t.createdAt) >= from) &&
              (!to || new Date(t.createdAt) <= to),
          )

          .forEach((t) =>
            entries.push({
              ...t,
              status: 'CR',
              createdAt: t.createdAt,
              top_up_value: t.topupValue,
            }),
          );
      }

      bonuses
        .filter(
          (b) =>
            (b.cardNumber === customer.cardNumber ||
              b.phoneNumber === customer.mobileNumber) &&
            (!from || new Date(b.bonusDate) >= from) &&
            (!to || new Date(b.bonusDate) <= to),
        )

        .forEach((b) =>
          entries.push({
            ...b,
            status: 'BONUS',
            createdAt: b.bonusDate,
            bonusAmount: b.bonusAmount,
          }),
        );

      transactions
        .filter(
          (t) =>
            (t.cardNumber === customer.cardNumber ||
              t.mobileNumber === customer.mobileNumber) &&
            (!from || new Date(t.createdAt) >= from) &&
            (!to || new Date(t.createdAt) <= to),
        )

        .forEach((t) =>
          entries.push({
            ...t,
            status: 'DR',
            createdAt: t.createdAt,
            redeemValue: t.redeemValue,
          }),
        );

      entries.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

      for (const entry of entries) {
        const dateStr = new Date(entry.createdAt).toISOString().split('T')[0];
        let earn = '-',
          redeem = '-',
          bonusAmount = '-',
          status = entry.status,
          planType = '-',
          planName = '-';

        if (status === 'CR') {
          if (customer.cardType === 1 && entry.redeemPoint) {
            earn = entry.redeemPoint.toString();
            planType = (entry.planType ?? '-').toString();

            planName = entry.planName || '-';
            balance += entry.redeemPoint;
          } else if (customer.cardType === 2 && entry.top_up_value) {
            earn = entry.top_up_value.toString();
            balance += entry.top_up_value;
          }
        } else if (status === 'BONUS' && entry.bonusAmount) {
          bonusAmount = earn = entry.bonusAmount.toString();
          balance += entry.bonusAmount;
        } else if (status === 'DR' && entry.redeemValue) {
          redeem = entry.redeemValue.toString();
          balance = Math.max(0, balance - entry.redeemValue);
        }

        sheet.addRow([
          customer.customerName,
          customer.cardNumber,
          customer.mobileNumber,
          cardTypeMap.get(customer.cardType) || '-',
          dateStr,
          planType,
          planName,
          earn,
          redeem,
          // bonusAmount,
          status,
          balance.toString(),
        ]);
      }
    }

    const data = await workbook.xlsx.writeBuffer();
    return new Uint8Array(data);
  }

  // async transactionData(
  //   req: any,
  //   fromDate?: string,
  //   toDate?: string,
  //   filter?: 'today' | 'thisWeek' | 'thisMonth',
  // ): Promise<any[]> {
  //   const { userId, companyId } = req.user;
  //   let from = null,
  //     to = null;
  //   const now = new Date();

  //   if (filter === 'today') {
  //     from = new Date();
  //     from.setHours(0, 0, 0, 0);
  //     to = new Date();
  //     to.setHours(23, 59, 59, 999);
  //   } else if (filter === 'thisWeek') {
  //     const day = now.getDay(),
  //       diff = now.getDate() - day + (day === 0 ? -6 : 1);
  //     from = new Date(now.setDate(diff));
  //     from.setHours(0, 0, 0, 0);
  //     to = new Date();
  //     to.setHours(23, 59, 59, 999);
  //   } else if (filter === 'thisMonth') {
  //     from = new Date(now.getFullYear(), now.getMonth(), 1);
  //     from.setHours(0, 0, 0, 0);
  //     to = new Date();
  //     to.setHours(23, 59, 59, 999);
  //   }

  //   if (fromDate && toDate) {
  //     from = new Date(fromDate);
  //     from.setHours(0, 0, 0, 0);
  //     to = new Date(toDate);
  //     to.setHours(23, 59, 59, 999);
  //   }

  //   const customerWhere: any = { userId, companyId };
  //   if (from && to) customerWhere.createdAt = Between(from, to);

  //   const [
  //     customers,
  //     plans,
  //     transactions,
  //     bonuses,
  //     topups,
  //     planMasters,
  //     cardTypes,
  //   ] = await Promise.all([
  //     this.registerCustomerEntityRepository.find({ where: customerWhere }),
  //     this.RedeemPointEntityRepository.find({ where: { userId, companyId } }),
  //     this.RedeemTransactionEntityRepository.find({ where: { companyId } }),
  //     this.BonusRecordMasterEntityRepository.find({
  //       where: { userId, companyId },
  //     }),
  //     this.LoyaltyCardTopupMasterEntityRepository.find({
  //       where: { companyId },
  //     }),
  //     this.loyaltyPlanMasterEntityRepository.find({
  //       where: { userId, companyId },
  //     }),
  //     this.LoyaltyCardTypeEntityRepository.find(),
  //   ]);

  //   console.log(
  //     'm',
  //     customers,
  //     plans,
  //     transactions,
  //     bonuses,
  //     topups,
  //     planMasters,
  //     cardTypes,
  //   );

  //   const planMap = new Map(planMasters.map((p) => [p.id, p.planName || '-']));
  //   const cardTypeMap = new Map(
  //     cardTypes.map((c) => [c.id, c.cardType || '-']),
  //   );

  //   const reportData = [];

  //   for (const customer of customers) {
  //     const key = customer.cardNumber || customer.mobileNumber;
  //     let balance = 0;
  //     const entries: EntryType[] = [
  //       { createdAt: customer.createdAt, status: 'REG' },
  //     ];

  //     if (customer.cardType === 1) {
  //       plans
  //         .filter((p) => p.cardNumber === key || p.mobileNumber === key)
  //         .forEach((p) =>
  //           entries.push({
  //             ...p,
  //             status: 'CR',
  //             createdAt: p.createdAt,
  //             planName: planMap.get(p.planId),
  //             planType: p.planId,
  //             redeemPoint: p.redeemPoint,
  //           }),
  //         );
  //     } else {
  //       topups
  //         .filter((t) => t.cardNumber === key || t.mobileNumber === key)
  //         .forEach((t) =>
  //           entries.push({
  //             ...t,
  //             status: 'CR',
  //             createdAt: t.createdAt,
  //             top_up_value: t.topupValue,
  //           }),
  //         );
  //     }

  //     bonuses
  //       .filter((b) => b.cardNumber === key || b.phoneNumber === key)
  //       .forEach((b) =>
  //         entries.push({
  //           ...b,
  //           status: 'BONUS',
  //           createdAt: b.bonusDate,
  //           bonusAmount: b.bonusAmount,
  //         }),
  //       );

  //     transactions
  //       .filter((t) => t.cardNumber === key || t.mobileNumber === key)
  //       .forEach((t) =>
  //         entries.push({
  //           ...t,
  //           status: 'DR',
  //           createdAt: t.createdAt,
  //           redeemValue: t.redeemValue,
  //         }),
  //       );

  //     entries.sort(
  //       (a, b) =>
  //         new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  //     );

  //     for (const entry of entries) {
  //       // const dateStr = new Date(entry.createdAt).toISOString().slice(0, 10);
  //       const dateStr = new Date(entry.createdAt).toISOString(); // full ISO string with time

  //       let earn = '-',
  //         redeem = '-',
  //         bonusAmount = '-',
  //         planType = '-',
  //         planName = '-',
  //         status = entry.status;

  //       if (status === 'CR') {
  //         if (customer.cardType === 1 && entry.redeemPoint) {
  //           earn = entry.redeemPoint.toString();
  //           planType = (entry.planType ?? '-').toString();

  //           planName = entry.planName || '-';
  //           balance += entry.redeemPoint;
  //         } else if (customer.cardType === 2 && entry.top_up_value) {
  //           earn = entry.top_up_value.toString();
  //           balance += entry.top_up_value;
  //         }
  //       } else if (status === 'BONUS' && entry.bonusAmount) {
  //         earn = bonusAmount = entry.bonusAmount.toString();
  //         balance += entry.bonusAmount;
  //       } else if (status === 'DR' && entry.redeemValue) {
  //         redeem = entry.redeemValue.toString();
  //         balance = Math.max(0, balance - entry.redeemValue);
  //       }

  //       const createdAtDate = new Date(entry.createdAt);
  //       const dateOnly = createdAtDate
  //         .toISOString()
  //         .slice(0, 10)
  //         .split('-')
  //         .reverse()
  //         .join('-'); // date only

  //       reportData.push({
  //         customerName: customer.customerName,
  //         cardNumber: customer.cardNumber,
  //         mobileNumber: customer.mobileNumber,
  //         cardType: cardTypeMap.get(customer.cardType),
  //         createdAt: dateStr,
  //         createdDateOnly: dateOnly, //  this is your new field
  //         planType,
  //         planName,
  //         earnPoints: earn,
  //         redeemPoints: redeem,
  //         status,
  //         totalBalance: balance,
  //       });

  //       // reportData.push({
  //       //   customerName: customer.customerName,
  //       //   cardNumber: customer.cardNumber,
  //       //   mobileNumber: customer.mobileNumber,
  //       //   cardType: cardTypeMap.get(customer.cardType),
  //       //   createdAt: dateStr,
  //       //   planType,
  //       //   planName,
  //       //   earnPoints: earn,
  //       //   redeemPoints: redeem,
  //       //   // bonusAmount,
  //       //   status,
  //       //   totalBalance: balance,
  //       // });
  //     }
  //   }
  //   reportData.sort(
  //     (a, b) =>
  //       new Date(b.create_at).getTime() - new Date(a.create_at).getTime(),
  //   );

  //   return reportData;
  // }

  async transactionData(req: any, storeCode: string): Promise<any[]> {
    const { userId, companyId } = req.user;

    // Fetch all data without date filters
    const [
      customers,
      plans,
      transactions,
      bonuses,
      topups,
      planMasters,
      cardTypes,
    ] = await Promise.all([
      this.registerCustomerEntityRepository.find({
        where: { userId, companyId, storeCode },
      }),
      this.RedeemPointEntityRepository.find({
        where: { userId, companyId, storeCode },
      }),
      this.RedeemTransactionEntityRepository.find({
        where: { companyId, storeCode },
      }),
      this.BonusRecordMasterEntityRepository.find({
        where: { userId, companyId, storeCode },
      }),
      this.LoyaltyCardTopupMasterEntityRepository.find({
        where: { companyId, storeCode },
      }),
      this.loyaltyPlanMasterEntityRepository.find({
        where: { userId, companyId },
      }),
      this.LoyaltyCardTypeEntityRepository.find(),
    ]);

    const planMap = new Map(planMasters.map((p) => [p.id, p.planName || '-']));
    const cardTypeMap = new Map(
      cardTypes.map((c) => [c.id, c.cardType || 'Prepaid Card']),
    );

    const reportData: any[] = [];

    for (const customer of customers) {
      const key = customer.cardNumber || customer.mobileNumber;
      const entries: any[] = [{ createdAt: customer.createdAt, status: 'REG' }];
      let balance = 0;

      // Add Plan or Topup
      if (customer.cardType === 1) {
        plans
          .filter((p) => p.cardNumber === key || p.mobileNumber === key)
          .forEach((p) =>
            entries.push({
              ...p,
              status: 'CR',
              createdAt: p.createdAt,
              planName: planMap.get(p.planId),
              planType: p.planId,
              redeemPoint: p.redeemPoint,
            }),
          );
      } else {
        topups
          .filter((t) => t.cardNumber === key || t.mobileNumber === key)
          .forEach((t) =>
            entries.push({
              ...t,
              status: 'CR',
              createdAt: t.createdAt,
              top_up_value: t.topupValue,
            }),
          );
      }

      // Add Bonus
      bonuses
        .filter((b) => b.cardNumber === key || b.phoneNumber === key)
        .forEach((b) =>
          entries.push({
            ...b,
            status: 'BONUS',
            createdAt: b.bonusDate,
            bonusAmount: b.bonusAmount,
          }),
        );

      // Add Transactions
      transactions
        .filter((t) => t.cardNumber === key || t.mobileNumber === key)
        .forEach((t) =>
          entries.push({
            ...t,
            status: 'DR',
            createdAt: t.createdAt,
            redeemValue: t.redeemValue,
          }),
        );

      // Sort entries by date
      entries.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

      for (const entry of entries) {
        const dateStr = new Date(entry.createdAt).toISOString();
        const dateOnly = dateStr.slice(0, 10).split('-').reverse().join('-');

        let earn = '-',
          redeem = '-',
          bonusAmount = '-',
          planType = '-',
          planName = '-',
          status = entry.status;

        if (status === 'CR') {
          if (customer.cardType === 1 && entry.redeemPoint) {
            earn = entry.redeemPoint.toString();
            planType = (entry.planType ?? '-').toString();
            planName = entry.planName || '-';
            balance += entry.redeemPoint;
          } else if (customer.cardType === 2 && entry.top_up_value) {
            earn = entry.top_up_value.toString();
            balance += entry.top_up_value;
          }
        } else if (status === 'BONUS' && entry.bonusAmount) {
          earn = bonusAmount = entry.bonusAmount.toString();
          balance += entry.bonusAmount;
        } else if (status === 'DR' && entry.redeemValue) {
          redeem = entry.redeemValue.toString();
          balance = Math.max(0, balance - entry.redeemValue);
        }

        reportData.push({
          customerName: customer.customerName,
          cardNumber: customer.cardNumber,
          mobileNumber: customer.mobileNumber,
          cardType: cardTypeMap.get(customer.cardType),
          createdAt: dateStr,
          createdDateOnly: dateOnly,
          planType,
          planName,
          earnPoints: earn,
          redeemPoints: redeem,
          status,
          totalBalance: balance,
        });
      }
    }

    // Sort newest first
    reportData.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return reportData;
  }

  async getTotalLoyaltyMember(userId: number, companyId: number): Promise<any> {
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();
    const today = new Date();

    // 1. Total registered customers
    const totalCount = await this.registerCustomerEntityRepository.count({
      where: { userId, companyId },
    });

    // 2. New customers registered in the current month
    const newThisMonthCount = await this.registerCustomerEntityRepository.count(
      {
        where: {
          userId,
          companyId,
          createdAt: Between(startOfMonth, endOfMonth),
          status: true,
        },
      },
    );

    // 3. Expired cards based on valid_till in RedeemPointRepo
    const expiredCardCount = await this.RedeemPointEntityRepository.count({
      where: {
        userId: userId,
        companyId: companyId,
        validTill: LessThan(today),
      },
    });

    return {
      status: 200,
      message: 'success',
      totalCount,
      newThisMonthCount,
      expiredCardCount,
    };
  }

  async getMonthlyMemberStats(userId: number, companyId: number): Promise<any> {
    console.log('cc', companyId, userId);
    const results = [];

    for (let i = 0; i < 12; i++) {
      const monthStart = moment().month(i).startOf('month').toDate();
      const monthEnd = moment().month(i).endOf('month').toDate();

      // Count new members in the current month
      const newCount = await this.registerCustomerEntityRepository.count({
        where: {
          userId,
          companyId,
          createdAt: Between(monthStart, monthEnd),
        },
      });

      // Count old members who registered before this month
      const oldCount = await this.registerCustomerEntityRepository.count({
        where: {
          userId,
          companyId,
          createdAt: LessThan(monthStart),
        },
      });
      results.push({
        month: moment().month(i).format('MMM'),
        newCount,
        oldCount,
      });
    }
    return {
      status: 200,
      message: 'success',
      data: results,
    };
  }

  // store management methods
  async createStore(req: any, createStoreMasterDto: CreateStoreMasterDto) {
    //  Pick companyId from DTO if provided, else from req.user
    const companyId = createStoreMasterDto.companyId || req.user?.companyId;

    if (!companyId) {
      throw new BadRequestException('Company ID is required');
    }

    // Check if store name already exists in the company
    const checkStore = await this.StoreMasterEntityRepository.findOne({
      where: {
        storeName: createStoreMasterDto.storeName,
        companyId: companyId,
      },
    });

    if (checkStore) {
      throw new BadRequestException(
        'Store name already registered with this company',
      );
    }

    // Get sequence number for this company
    const storeCount = await this.StoreMasterEntityRepository.count({
      where: { companyId: companyId },
    });

    // First 4 letters of store name (uppercase, pad with X if less than 4)
    const storePrefix = createStoreMasterDto.storeName
      .substring(0, 4)
      .toUpperCase()
      .padEnd(4, 'X');

    // Sequence = count + 1 (padded to 4 digits)
    const sequence = String(storeCount + 1).padStart(4, '0');

    // Final store code
    const generatedStoreCode = `${storePrefix}${sequence}`;

    // Create and save store
    const Data: StoreMasterEntity = new StoreMasterEntity();
    Data.storeName = createStoreMasterDto.storeName;
    Data.storeCode = generatedStoreCode;
    Data.state = createStoreMasterDto.state;
    Data.addressOne = createStoreMasterDto.addressOne;
    Data.addressTwo = createStoreMasterDto.addressTwo;
    Data.city = createStoreMasterDto.city;
    Data.country = createStoreMasterDto.country;
    Data.companyId = companyId; //  Always the resolved companyId
    Data.isActive = createStoreMasterDto.isActive;
    Data.createdAt = Date.now();

    await this.StoreMasterEntityRepository.save(Data);

    return { message: 'success', storeCode: generatedStoreCode, status: 200 };
  }

  async updateStore(req: any, updateStoreMasterDto: UpdateStoreMasterDto) {
    //  Pick companyId from DTO if provided, else from req.user
    const companyId = updateStoreMasterDto.companyId || req.user?.companyId;

    if (!companyId) {
      throw new BadRequestException('Company ID is required');
    }

    //  Find the store by ID & companyId
    const existingStore = await this.StoreMasterEntityRepository.findOne({
      where: { id: updateStoreMasterDto.id, companyId: companyId },
    });

    if (!existingStore) {
      throw new NotFoundException('Store not found for this company');
    }

    //  Update only allowed fields
    existingStore.addressOne =
      updateStoreMasterDto.addressOne ?? existingStore.addressOne;
    existingStore.addressTwo =
      updateStoreMasterDto.addressTwo ?? existingStore.addressTwo;
    existingStore.city = updateStoreMasterDto.city ?? existingStore.city;
    existingStore.state = updateStoreMasterDto.state ?? existingStore.state;
    existingStore.country =
      updateStoreMasterDto.country ?? existingStore.country;
    existingStore.isActive =
      updateStoreMasterDto.isActive ?? existingStore.isActive;

    existingStore.updatedAt = Date.now();

    await this.StoreMasterEntityRepository.save(existingStore);

    return {
      message: 'success',
      storeCode: existingStore.storeCode, // storeCode remains unchanged
      status: 200,
    };
  }

  async deleteStore(id: number) {
    if (!id) {
      throw new BadRequestException('Store ID is required');
    }

    const check = await this.StoreMasterEntityRepository.findOne({
      where: { id },
    });
    if (!check) {
      throw new BadRequestException('Store not found');
    }
    check.isActive = false;
    await this.StoreMasterEntityRepository.save(check);
    return { message: 'succes', status: 200 };
  }
  async storeList(companyId: number, req: any) {
    const roleName = req.user.roleName;
    let whereCondition: any = {};

    if (companyId) {
      whereCondition = { companyId: companyId, isActive: true };
    }

    const selectFields =
      roleName === 'superAdmin'
        ? undefined // select all fields
        : {
            id: true,
            companyId: true,
            storeName: true,
            addressOne: true,
            isActive: true,
          };

    const data = await this.StoreMasterEntityRepository.find({
      where: whereCondition,
      order: { id: 'DESC' },
      select: selectFields,
    });

    return {
      message: 'success',
      status: 200,
      data: data,
    };
  }
  async createRewardAction(dto: CreateRewardActionDto) {
    const action = this.RewardActionMasterEntityRepository.create({
      actionName: dto.actionName,
      defaultPoints: dto.defaultPoints,
    });
    return await this.RewardActionMasterEntityRepository.save(action);
  }
  async assignActionToCompany(dto: AssignCompanyRewardActionDto) {
    const action = await this.RewardActionMasterEntityRepository.findOneBy({
      id: dto.actionId,
    });
    if (!action) {
      throw new Error(`Action with ID ${dto.actionId} not found`);
    }

    const mapping = this.CompanyRewardActionEntityRepository.create({
      companyId: dto.companyId,
      action, // pass the full entity
      points: dto.points,
    });

    return await this.CompanyRewardActionEntityRepository.save(mapping);
  }

  async getCompanyActions(companyId: number) {
    return await this.CompanyRewardActionEntityRepository.find({
      where: { companyId },
      relations: ['action'],
    });
  }
}
