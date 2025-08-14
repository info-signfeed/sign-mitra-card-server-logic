import { Logger, Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterCustomerEntity } from 'src/admin/Entity/CustomerMasterEntity';
import { AdminModule } from 'src/admin/admin.module';
import { BonusRecordMasterEntity } from 'src/api/Entity/BonusRecordMatserEntity';
import { BonusAmountManageMasterEntity } from 'src/api/Entity/BonusAmountManageMatserEntity';
import { RedeemPointEntity } from 'src/api/Entity/RedeemPointEntity';
import { RedeemTransactionEntity } from 'src/api/Entity/RedeemTransactionEntity';
import { LoyaltyCardTopupMasterEntity } from 'src/api/Entity/LoyaltyTopUpCardMasterEntity';
import { LoyaltyPlanMasterEntity } from 'src/admin/Entity/LoyaltyPlanMasterEntity';
import { TopUpDataMasterEntity } from 'src/api/Entity/TopUpRecordMasterEntity';
import { CompanyTierMasterEntity } from 'src/admin/Entity/CompanyTierMasterEntity';
import { ApiModule } from 'src/api/api.module';
import { LoyaltyCardTypeEntity } from 'src/admin/Entity/LoyaltyCardTypeEntity';
import { CompanyMasterEntity } from 'src/admin/Entity/CompanyMasterEntity';
import { CompanySmsTemplateEntity } from 'src/admin/Entity/CompanySmsTemplateEntity';
import { PassportModule } from '@nestjs/passport';
import { jwtConfig } from '../auth/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/local.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register(jwtConfig),
    TypeOrmModule.forFeature([
      RegisterCustomerEntity,
      BonusRecordMasterEntity,
      BonusAmountManageMasterEntity,
      RedeemPointEntity,
      RedeemTransactionEntity,
      LoyaltyCardTopupMasterEntity,
      LoyaltyPlanMasterEntity,
      TopUpDataMasterEntity,
      CompanyTierMasterEntity,
      LoyaltyCardTypeEntity,
      CompanyMasterEntity,
      CompanySmsTemplateEntity,
    ]),
    AdminModule,
    ApiModule,
  ],
  controllers: [AccountController],
  providers: [
    AccountService,
    Logger,
    JwtStrategy,
    { provide: Request, useValue: Request },
  ],
  exports: [PassportModule, JwtModule],
})
export class AccountModule {}
