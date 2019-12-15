import { IsNotEmpty, IsOptional, IsEnum, Max, Min } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { PaymentType } from '../../invoices/invoices.entity';

export class SalesOrderSettings {
  @IsNotEmpty()
  @ApiModelProperty({ description: 'id of client selected' })
  clientId: number;

  @IsNotEmpty()
  @ApiModelProperty({ description: 'Invoice date' })
  date: string;

  @IsOptional()
  @ApiModelProperty({ description: 'Date of expiration' })
  expirationDate: string;

  @IsOptional()
  @Min(0)
  @Max(1)
  @ApiModelProperty({
    description:
      'user selection of re. This is the value as a decimal, i.e 0.052 for 5.2%',
  })
  re: number;

  @IsOptional()
  @ApiModelProperty({ description: 'transport price' })
  transportPrice: number;

  @IsNotEmpty()
  @IsEnum(PaymentType)
  @ApiModelProperty({ description: 'transport price' })
  paymentType: PaymentType;

  @IsOptional()
  @Min(0)
  @Max(1)
  @ApiModelProperty({
    description:
      'tax selection. This is the value as a decimal, i.e 0.21 for 21%',
  })
  tax: number;
}
