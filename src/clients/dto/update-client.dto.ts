import { MaxLength, IsOptional, IsEmail } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { DocumentType } from '../clients.entity';

export class UpdateClientDto {
  @IsOptional()
  @ApiModelProperty({ description: 'Client name' })
  name?: string;

  @IsOptional()
  @ApiModelProperty({ description: 'Client shop name' })
  shopName?: string;

  @IsOptional()
  @ApiModelProperty({ description: 'Client full address' })
  address?: string;

  @IsOptional()
  @ApiModelProperty({ description: 'Client city' })
  city?: string;

  @IsOptional()
  @ApiModelProperty({ description: 'Client province' })
  province?: string;

  @IsOptional()
  @ApiModelProperty({ description: 'Client postcode' })
  @MaxLength(7)
  postcode?: string;

  @IsOptional()
  @ApiModelProperty({ description: 'nif/cif number of client' })
  documentNum?: string;

  @IsOptional()
  @ApiModelProperty({ description: 'type of document' })
  documentType?: DocumentType;


  @IsOptional()
  @ApiModelProperty({ description: 'Telephone number of client' })
  @MaxLength(12)
  telephone1?: string;

  @IsOptional()
  @ApiModelProperty({ description: 'Telephone number of client' })
  @MaxLength(12)
  telephone2?: string;

  @IsOptional()
  @ApiModelProperty({ description: 'Client email' })
  email?: string;
}
