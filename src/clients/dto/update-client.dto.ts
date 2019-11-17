import {  MaxLength, IsOptional, IsEmail } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class UpdateClientDto {
  @IsOptional()
  @ApiModelProperty({description: 'Client name'})
  name?: string;

  @IsOptional()
  @ApiModelProperty({description: 'Client shop name'})
  shopName?: string;

  @IsOptional()
  @ApiModelProperty({description: 'Client full address'})
  address?: string;

  @IsOptional()
  @ApiModelProperty({description: 'Client city'})
  city?: string;

  @IsOptional()
  @ApiModelProperty({description: 'Client province'})
  province?: string;

  @IsOptional()
  @ApiModelProperty({description: 'Client postcode'})
  @MaxLength(7)
  postcode?: string;

  @IsOptional()
  @ApiModelProperty({description: 'nif number of client'})
  @MaxLength(11)
  numNif?: string;

  @IsOptional()
  @ApiModelProperty({description: 'cif number of client'})
  @MaxLength(11)
  numCif?: string;

  @IsOptional()
  @ApiModelProperty({description: 'Telephone number of client'})
  @MaxLength(12)
  telephone1?: string;

  @IsOptional()
  @ApiModelProperty({description: 'Telephone number of client'})
  @MaxLength(12)
  telephone2?: string;

  @IsOptional()
  @ApiModelProperty({description: 'Client email'})
  @IsEmail()
  email?: string;

}
