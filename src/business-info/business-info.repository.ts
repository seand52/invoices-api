import {Repository, EntityRepository, getConnection} from 'typeorm';
import { BusinessInfo } from './business-info.entity';

@EntityRepository(BusinessInfo)
export class BusinessInfoRepository extends Repository<BusinessInfo> {


}
