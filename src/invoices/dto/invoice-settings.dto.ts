import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { PaymentType } from '../invoices.entity';
import { Transform } from 'class-transformer';

export class InvoiceSettingsDto {
  @IsNotEmpty()
  @ApiModelProperty({ description: 'id of client selected' })
  clientId: number;

  @IsNotEmpty()
  @ApiModelProperty({ description: 'Invoice date' })
  date: string;

  @IsOptional()
  @ApiModelProperty({ description: 'user selection of re' })
  re: number;

  @IsOptional()
  @ApiModelProperty({ description: 'transport price' })
  transportPrice: number;

  @IsNotEmpty()
  @IsEnum(PaymentType)
  @ApiModelProperty({ description: 'transport price' })
  paymentType: PaymentType;

  @IsOptional()
  @ApiModelProperty({ description: 'tax selection' })
  tax: number;
}
