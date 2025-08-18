import {
  Controller,
  Get,
  UseGuards,
  Logger,
  Inject,
  Post,
  Body,
  Query,
  ValidationPipe,
  UsePipes,
  Req,
  UseInterceptors,
  UploadedFiles,
  UnauthorizedException,
  UploadedFile,
  BadRequestException,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CreateCompanyDto } from './dto/CreateCompanyDto';
import { UpdateCompanyDto } from './dto/UpdateCompanyDto';
import { SearchCompanyDto } from './dto/SearchCompanyDto';
import { SearchLocationDto } from './dto/SearchLocationDto';
import { CreateLocationDto } from './dto/CreateLocationDto';
import { UpdateLocationDto } from './dto/UpdateLocationDto';
import { CreateUserDto } from './dto/CreateUserDto';
import { UpdateUserDto } from './dto/UpdateUserDto';
import {
  RequestWithProtocol,
  RequestWithUser,
} from './interfaces/request.interface';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { Response } from 'express';
import { CreateUserRoleDto } from './dto/CreateUserRoleDto';
import { CreateUserPermissionDto } from './dto/CreateUserPermissionDto';
import { AddUserRolePermissionDto } from './dto/AddUserRolePermissionDto';
import { SearchUserRoleDto } from './dto/SearchUserRoleDto';
import { SearchUserPermissionDto } from './dto/SearchUserPermissionDto';
import { SearchUserRolePermissionDto } from './dto/SearchUserRolePermissionDto';
import { CreateCategoryDto } from './dto/CreateCategoryDto';
import { CreateLoyaltyPlanDto } from './dto/CreateLoyaltyPlanDto';
import { UpdateLoyaltyPlanDto } from './dto/UpdateLoyaltyPlanDto';
import { RegisterCustomerDto } from '../api/dto/RegisterCustomerDto';
import { CreateCompanyTierDto } from './dto/CreateCompanyTierDto';
import { CreateStoreMasterDto } from './dto/CreateStoreMasterDto';
import { UpdateStoreMasterDto } from './dto/UpdateStoreDto';
import { CreateRewardActionDto } from './dto/createRewardActionDto';
import { AssignCompanyRewardActionDto } from './dto/companyRewardActionDto';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly _adminService: AdminService,
    @Inject(Logger) private readonly logger: Logger,
    @Inject(Request) private readonly req: Request,
  ) {}

  @Post('create-user')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this._adminService.createUser(createUserDto);
  }

  @Post('update-user')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async updateUser(@Body() updateUserDto: UpdateUserDto) {
    return this._adminService.updateUser(updateUserDto);
  }
  @Get('delete-user')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async deleteUser(@Query('id') id: number) {
    return this._adminService.deleteUser(id);
  }

  @Get('user-list')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async adminUserList(@Req() req: RequestWithUser) {
    this.logger.log('adminUserList');
    return this._adminService.adminUserList(req);
  }

  // @Get('user-profile')
  // @UseGuards(JwtAuthGuard) // Use JwtAuthGuard instead of AuthGuard
  // userProfile(@Req() req: RequestWithUser) {
  //     console.log('=========User Profile========')
  //     console.log('Full request user object:', req.user);
  //     const username = req.user?.username;
  //     if (!username) {
  //         throw new UnauthorizedException('User ID not found in token');
  //     }
  //     return this._adminService.getUserProfile(username);
  // }
  @Get('user-profile')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  userProfile(@Req() req: RequestWithUser) {
    console.log('Decoded JWT user: ', req.user);
    const username = req.user?.username;
    console.log('username: ', req.user);

    if (!username) {
      throw new UnauthorizedException('User ID not found in token');
    }

    return this._adminService.getUserProfile(username);
  }

  @Get('state-list')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async stateList() {
    this.logger.log('State List');
    return this._adminService.stateList();
  }
  @Get('company-list')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async companyList(@Req() request: Request) {
    this.logger.log('Company List');
    return this._adminService.companyList(request);
  }
  @Get('company-detail-list')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async companyDetailList(@Query('id') id: number) {
    this.logger.log('Company List');
    return this._adminService.companyDetailList(id);
  }
  @Get('search-company')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async searchCompany(@Query() searchCompanyDto: SearchCompanyDto) {
    this.logger.log('Company Search');
    return this._adminService.searchCompany(searchCompanyDto);
  }
  @Post('create-company')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FilesInterceptor('file'))
  async createCompany(
    @UploadedFiles() file: Multer.File[],
    @Body() createCompanyDto: CreateCompanyDto,
  ) {
    this.logger.log('Create New Company');
    return this._adminService.createCompany(file, createCompanyDto);
  }

  @Post('update-company')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async updateCompany(
    @Req() request: Request,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    this.logger.log('Update Old Company');
    return this._adminService.updateCompany(request, updateCompanyDto);
  }

  // LOCATION MASTER API
  @Get('location-list')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async locationList(@Query() searchCompanyDto: SearchCompanyDto) {
    this.logger.log('Location Search');
    return this._adminService.locationList(searchCompanyDto);
  }
  // @Get('location-list')
  // @UseGuards(JwtAuthGuard)
  // @UsePipes(new ValidationPipe())
  // async locationList(@Req() request: Request ,@Query() searchCompanyDto: SearchCompanyDto ){
  //     this.logger.log("Location Search")
  //     return this._adminService.locationList(request,searchCompanyDto);
  // }

  @Get('search-location')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async searchLocation(@Query() searchLocationDto: SearchLocationDto) {
    this.logger.log('Location Search');
    return this._adminService.searchLocation(searchLocationDto);
  }
  @Post('create-location')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async createLocation(
    @Req() req: RequestWithProtocol,
    @Body() createLocationDto: CreateLocationDto,
  ) {
    this.logger.log('Create New Location');
    return this._adminService.createLocation(req, createLocationDto);
  }
  @Post('update-location')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async updateLocation(@Body() updateLocationDto: UpdateLocationDto) {
    this.logger.log('Update Old Company');
    return this._adminService.updateLocation(updateLocationDto);
  }

  // ROLE MANAGEMENT
  @Post('add-user-role')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async addUserRoleMaster(@Body() createUserRoleDto: CreateUserRoleDto) {
    this.logger.log('Add Role Master');
    return this._adminService.addUserRoleMaster(createUserRoleDto);
  }
  @Post('add-user-permission')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async addUserPermissionMaster(
    @Body() createUserPermissionDto: CreateUserPermissionDto,
  ) {
    this.logger.log('Add Role Master');
    return this._adminService.addUserPermissionMaster(createUserPermissionDto);
  }

  @Post('add-role-permission')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async addUserRolePermission(
    @Body() addUserRolePermissionDto: AddUserRolePermissionDto[],
  ) {
    this.logger.log('Add Role Permission');
    return this._adminService.addUserRolePermission(addUserRolePermissionDto);
  }

  @Get('list-user-role')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async listUserRoleMaster(@Query() searchUserRoleDto: SearchUserRoleDto) {
    this.logger.log('Search Role');
    return this._adminService.listUserRoleMaster(searchUserRoleDto);
  }

  @Get('list-user-permission')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async listUserPermissionMaster(
    @Query() searchUserPermissionDto: SearchUserPermissionDto,
  ) {
    this.logger.log('Search Permission');
    return this._adminService.listUserPermissionMaster(searchUserPermissionDto);
  }

  @Get('list-role-permission')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async listUserRolePermission(
    @Query() searchUserRolePermissionDto: SearchUserRolePermissionDto,
  ) {
    this.logger.log('Search Permission');
    return this._adminService.listUserRolePermission(
      searchUserRolePermissionDto,
    );
  }

  @Post('create-loyalty-plan')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async createLoyaltyPlan(
    @Req() req: RequestWithProtocol,
    @Body() createLoyaltyPlanDto: CreateLoyaltyPlanDto,
  ) {
    this.logger.log('Create New Loyalty Plan');
    return this._adminService.createLoyaltyPlan(req, createLoyaltyPlanDto);
  }

  @Post('update-loyalty-plan')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async updateLoyaltyPlan(@Body() updateLoyaltyPlanDto: UpdateLoyaltyPlanDto) {
    this.logger.log('Update Old Plan');
    return this._adminService.updateLoyaltyPlan(updateLoyaltyPlanDto);
  }
  // @Get('loyalty-plan-list')
  // @UseGuards(JwtAuthGuard)
  // @UsePipes(new ValidationPipe())
  // async loyaltyPlanList(@Req() req: RequestWithProtocol) {
  //     this.logger.log("Plan Search");
  //     return this._adminService.loyaltyPlanList(req);
  // }

  @Get('loyalty-plan-list')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async loyaltyPlanList(@Req() req: RequestWithProtocol) {
    this.logger.log('plan Search');
    return this._adminService.loyaltyPlanList(req);
  }

  @Get('register-customer-list')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async customerList(@Req() req: RequestWithProtocol) {
    this.logger.log('Plan Search');
    return this._adminService.customerList(req);
  }

  @Get('card-type-list')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async cardTypeList() {
    this.logger.log('Plan Search');
    return this._adminService.cardTypeList();
  }

  @Post('create-company-tier')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async createCompanyTier(
    @Req() req: RequestWithProtocol,
    @Body() createCompanyTierDto: CreateCompanyTierDto,
  ) {
    this.logger.log('Create Company Tier');
    return this._adminService.createCompanyTier(req, createCompanyTierDto);
  }
  @Get('company-tier-list')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async CompanyTierList(@Req() req: RequestWithProtocol) {
    this.logger.log('Tier Search');
    return this._adminService.CompanyTierList(req);
  }

  @Get('report')
  async downloadExcel(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('companyId', ParseIntPipe) companyId: number,
    @Query('storeCode') storeCode: string,
    @Query('fromDate') fromDate: string, // e.g., '2025-07-01'
    @Query('toDate') toDate: string, // e.g., '2025-07-10'
    @Res() res: Response,
  ) {
    const buffer = await this._adminService.generateAnnualReport(
      userId,
      companyId,
      storeCode,
      fromDate,
      toDate,
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Customer_Report.xlsx"',
    );

    res.end(buffer);
  }

  @Get('transaction-data-list')
  @UseGuards(JwtAuthGuard)
  async getReportAsJson(
    @Req() req: RequestWithProtocol,
    @Query('storeCode') storeCode: string,
  ): Promise<any[]> {
    return await this._adminService.transactionData(req, storeCode);
  }

  // dashboard api
  @Get('dashboard-count')
  @UseGuards(JwtAuthGuard)
  async getTotalLoyaltyMember(
    @Query('userId') userId: number,
    @Query('companyId') companyId: number,
  ): Promise<any[]> {
    return await this._adminService.getTotalLoyaltyMember(userId, companyId);
  }

  @Get('chart-data')
  @UseGuards(JwtAuthGuard)
  async getMonthlyMemberStats(
    @Query('userId') userId: number,
    @Query('companyId') companyId: number,
  ): Promise<any[]> {
    return await this._adminService.getMonthlyMemberStats(userId, companyId);
  }
  // store master
  @Post('create-store')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async createStore(
    @Req() req: RequestWithUser,
    @Body() createStoreMasterDto: CreateStoreMasterDto,
  ) {
    return this._adminService.createStore(req, createStoreMasterDto);
  }

  @Post('update-store')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async updateStore(
    @Req() req: RequestWithUser,
    @Body() updateStoreMasterDto: UpdateStoreMasterDto,
  ) {
    return this._adminService.updateStore(req, updateStoreMasterDto);
  }
  @Get('delete-store')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async deleteStore(@Query('id') id: number) {
    return this._adminService.deleteStore(id);
  }

  @Get('store-list')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async storeList(
    @Query('companyId') companyId: number,
    @Req() req: RequestWithUser,
  ) {
    this.logger.log('adminUserList');
    return this._adminService.storeList(companyId, req);
  }
  @Post('reward-actions')
  // @UseGuards(JwtAuthGuard)
  createRewardAction(@Body() dto: CreateRewardActionDto) {
    return this._adminService.createRewardAction(dto);
  }

  @Post('company-reward-actions')
  // @UseGuards(JwtAuthGuard)
  async assignActionToCompany(
    @Body() dto: AssignCompanyRewardActionDto[] | AssignCompanyRewardActionDto,
  ) {
    return this._adminService.assignActionToCompany(dto);
  }

  @Get('company-reward-actions/:companyId')
  @UseGuards(JwtAuthGuard)
  getCompanyActions(@Query('companyId') companyId: number) {
    return this._adminService.getCompanyActions(companyId);
  }
}
