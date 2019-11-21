import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class InvoiceSettingsDto {
  @IsNotEmpty()
  @ApiModelProperty({ description: 'id of client selected' })
  clientId: number;

  @IsNotEmpty()
  @ApiModelProperty({ description: 'Invoice date' })
  date: string;

  @IsOptional()
  @ApiModelProperty({ description: 'user selection of re' })
  re: boolean;

  @IsOptional()
  @ApiModelProperty({ description: 'transport price' })
  transportPrice: boolean;

  @IsOptional()
  @ApiModelProperty({ description: 'tax selection' })
  tax: boolean;
}
