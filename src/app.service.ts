import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Connection } from "mysql2";

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource() private readonly connection: Connection,
    @Inject(Logger) private readonly logger: LoggerService
  ) {
  }
  getHello(): string {
    return 'Services Running!';
  }

}
