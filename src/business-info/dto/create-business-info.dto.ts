import { IsNotEmpty, MaxLength, IsOptional, IsEmail } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class CreateBusinessInfoDto {
  @IsNotEmpty()
  @ApiModelProperty({description: 'Business name'})
  name: string;

  @IsNotEmpty()
  @ApiModelProperty({description: 'cif number of business'})
  @MaxLength(11)
  cif: string;

  @IsNotEmpty()
  @ApiModelProperty({description: 'Business full address'})
  address: string;

  @IsNotEmpty()
  @ApiModelProperty({description: 'Business postcode'})
  @MaxLength(7)
  postcode: string;

  @IsNotEmpty()
  @ApiModelProperty({description: 'Business city'})
  city: string;

  @IsNotEmpty()
  @ApiModelProperty({description: 'Business country'})
  country: string;

  @IsNotEmpty()
  @ApiModelProperty({description: 'Telephone number of business'})
  @MaxLength(12)
  telephone: string;

  @IsNotEmpty()
  @ApiModelProperty({description: 'Business email'})
  @IsEmail()
  email: string;

}
