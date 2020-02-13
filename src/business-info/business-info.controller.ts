import {
  Controller,
  Post,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
  Get,
  Patch,
} from '@nestjs/common';
import { BusinessInfoService } from './business-info.service';
import { CreateBusinessInfoDto } from './dto/create-business-info.dto';
import { UpdateBusinessInfoDto } from './dto/update-business-info.dto';
import { AuthGuard } from '@nestjs/passport';
import { BusinessInfo } from './business-info.entity';

@Controller('business-info')
@UseGuards(AuthGuard('jwt'))
export class BusinessInfoController {
  constructor(private businessInfoService: BusinessInfoService) {}

  @Get()
  async getBusinessInfo(@Request() req: any): Promise<BusinessInfo | {}> {
    const { userId } = req.user;
    return this.businessInfoService.getBusinessInfo(userId);
  }

  @Post()
  @UsePipes(ValidationPipe)
  async createBusinessInfo(
    @Body() businessInfoData: CreateBusinessInfoDto,
    @Request() req: any,
  ): Promise<BusinessInfo | {}> {
    const { userId } = req.user;
    await this.businessInfoService.createBusinessInfo(businessInfoData, userId);
    return this.businessInfoService.getBusinessInfo(userId);
  }

  @Patch()
  @UsePipes(ValidationPipe)
  async updateBusinessInfo(
    @Body() businessInfoData: UpdateBusinessInfoDto,
    @Request() req: any,
  ): Promise<BusinessInfo> {
    debugger;
    const { userId } = req.user;
    return this.businessInfoService.updateBusinessInfo(
      businessInfoData,
      userId,
    );
  }
}
