import { Logger, Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthUserEntity } from './Entity/AuthUserEntity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyMasterEntity } from './Entity/CompanyMasterEntity';
import { LocationMasterEntity } from './Entity/LocationMasterEntity';
import { StateMasterEntity } from './Entity/StateMasterEntity';
import { UserPermissionMasterEntity } from './Entity/UserPermissionMasterEntity';
import { UserRoleMasterEntity } from './Entity/UserRoleMasterEntity';
import { UserRolePermissionEntity } from './Entity/UserRolePermissionEntity';
import { CounterMasterEntity } from './Entity/CounterMasterEntity';
import { LoyaltyPlanMasterEntity } from './Entity/LoyaltyPlanMasterEntity';
import { RegisterCustomerEntity } from './Entity/CustomerMasterEntity';
import { LoyaltyCardTypeEntity } from './Entity/LoyaltyCardTypeEntity';
import { RedeemPointEntity } from 'src/api/Entity/RedeemPointEntity';
import { RedeemTransactionEntity } from 'src/api/Entity/RedeemTransactionEntity';
import { CompanyTierMasterEntity } from './Entity/CompanyTierMasterEntity';
import { CompanySmsTemplateEntity } from './Entity/CompanySmsTemplateEntity';
import { BonusRecordMasterEntity } from 'src/api/Entity/BonusRecordMatserEntity';
import { LoyaltyCardTopupMasterEntity } from 'src/api/Entity/LoyaltyTopUpCardMasterEntity';
import { StoreMasterEntity } from './Entity/StoreMasterEntity';
import { JwtStrategy } from './auth/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from './auth/jwt.config';
import { RewardActionMasterEntity } from './Entity/RewardActionMasterEntity';
import { CompanyRewardActionEntity } from './Entity/CompanyRewardMasterEntity';
import { RewardActionHistoryMasterEntity } from './Entity/RewardActionHistoryMasterEntity';
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register(jwtConfig),
    TypeOrmModule.forFeature([
      AuthUserEntity,
      CompanyMasterEntity,
      LocationMasterEntity,
      StateMasterEntity,
      UserPermissionMasterEntity,
      UserRoleMasterEntity,
      UserRolePermissionEntity,
      CounterMasterEntity,
      LoyaltyPlanMasterEntity,
      RegisterCustomerEntity,
      LoyaltyCardTypeEntity,
      RedeemPointEntity,
      RedeemTransactionEntity,
      CompanyTierMasterEntity,
      CompanySmsTemplateEntity,
      BonusRecordMasterEntity,
      LoyaltyCardTopupMasterEntity,
      StoreMasterEntity,
      CompanyRewardActionEntity,
      RewardActionMasterEntity,
      RewardActionHistoryMasterEntity,
    ]),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    Logger,
    JwtStrategy,
    { provide: Request, useValue: Request },
  ],
  exports: [PassportModule, JwtModule],
})
export class AdminModule {}
