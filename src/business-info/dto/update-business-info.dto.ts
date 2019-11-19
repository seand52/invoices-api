import { IsNotEmpty, MaxLength, IsOptional, IsEmail } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class UpdateBusinessInfoDto {
  @IsOptional()
  @ApiModelProperty({description: 'Business name'})
  name?: string;

  @IsOptional()
  @ApiModelProperty({description: 'cif number of business'})
  @MaxLength(11)
  cif?: string;

  @IsOptional()
  @ApiModelProperty({description: 'Business full address'})
  address?: string;

  @IsOptional()
  @ApiModelProperty({description: 'Business postcode'})
  @MaxLength(7)
  postcode?: string;

  @IsOptional()
  @ApiModelProperty({description: 'Business city'})
  city?: string;

  @IsOptional()
  @ApiModelProperty({description: 'Business country'})
  country?: string;

  @IsOptional()
  @ApiModelProperty({description: 'Telephone number of business'})
  @MaxLength(12)
  telephone?: string;

  @IsOptional()
  @ApiModelProperty({description: 'Business email'})
  @IsEmail()
  email?: string;

}
