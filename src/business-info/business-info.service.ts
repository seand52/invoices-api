import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessInfoRepository } from './business-info.repository';

@Injectable()
export class BusinessInfoService {
  constructor(
    @InjectRepository(BusinessInfoRepository)
    private businessInfoRepository: BusinessInfoRepository,
  ) {}

  async getBusinessInfo(userId) {
    const [info] = await this.businessInfoRepository.find({userId});

    if (!info) {
      return {};
    }
    return info;
  }

   async createBusinessInfo(businessInfoData, userId) {
    try {
      await this.businessInfoRepository.insert({...businessInfoData, userId});
    } catch (err) {

      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('DUPLICATE_BUSINESS');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async updateBusinessInfo(businessInfoData, userId) {
    const [info] = await this.businessInfoRepository.find({userId});

    if (info.userId !== userId) {
      throw new UnauthorizedException('You do not have permission to perform this request');
    }

    this.businessInfoRepository.update(info.id, businessInfoData);
    return 'OK';
  }
}
