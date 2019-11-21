import { ValidateNested } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { InvoiceSettingsDto } from './invoice-settings.dto';
import { Type } from 'class-transformer';
import { InvoiceProductsDto } from './invoice-products.dto';

export class CreateInvoiceDto {
  @ValidateNested({ each: true })
  @Type(() => InvoiceSettingsDto)
  @ApiModelProperty({
    description:
      'Object that contains invoice options the user picked such as transport price, re, payment type...',
  })
  settings: InvoiceSettingsDto;

  @ValidateNested({ each: true })
  @Type(() => InvoiceProductsDto)
  @ApiModelProperty({ description: 'Array of product id' })
  products: InvoiceProductsDto[];
}
