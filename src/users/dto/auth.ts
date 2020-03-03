import { CreateBusinessInfoDto } from 'src/business-info/dto/create-business-info.dto';

interface BusinessInfo {
  name: string;
  cif: string;
  address: string;
  postcode: string;
  city: string;
  country: string;
  telephone: string;
  email: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  businessInfo: BusinessInfo;
}
