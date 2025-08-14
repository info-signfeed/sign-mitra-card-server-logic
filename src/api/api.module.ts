import { Logger, Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterCustomerEntity } from './Entity/CustomerMasterEntity';
import { AdminModule } from 'src/admin/admin.module';
import { LoyaltyPlanMasterEntity } from 'src/admin/Entity/LoyaltyPlanMasterEntity';
import { RedeemPointEntity } from './Entity/RedeemPointEntity';
import { RedeemTransactionEntity } from './Entity/RedeemTransactionEntity';
import { TopUpDataMasterEntity } from './Entity/TopUpRecordMasterEntity';
import { CompanyTierMasterEntity } from 'src/admin/Entity/CompanyTierMasterEntity';
import { LoyaltyCardTypeEntity } from 'src/admin/Entity/LoyaltyCardTypeEntity';
import { LoyaltyCardTopupMasterEntity } from './Entity/LoyaltyTopUpCardMasterEntity';
import { CompanyMasterEntity } from 'src/admin/Entity/CompanyMasterEntity';
import { CompanySmsTemplateEntity } from 'src/admin/Entity/CompanySmsTemplateEntity';
import { BonusRecordMasterEntity } from './Entity/BonusRecordMatserEntity';
import { BonusAmountManageMasterEntity } from './Entity/BonusAmountManageMatserEntity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RegisterCustomerEntity,
      LoyaltyPlanMasterEntity,
      RedeemPointEntity,
      RedeemTransactionEntity,
      TopUpDataMasterEntity,
      CompanyTierMasterEntity,
      LoyaltyCardTypeEntity,
      LoyaltyCardTopupMasterEntity,
      CompanyMasterEntity,
      CompanySmsTemplateEntity,
      BonusRecordMasterEntity,
      BonusAmountManageMasterEntity,
    ]),
    AdminModule,
  ],
  controllers: [ApiController],
  providers: [ApiService, Logger, { provide: Request, useValue: Request }],
})
export class ApiModule {}
