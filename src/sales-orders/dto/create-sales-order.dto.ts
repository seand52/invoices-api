import { ValidateNested } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {} from './salesOrder-products.dto';
import { SalesOrderSettings } from './sales-order-settings.dto';
import { SalesOrderProductsDto } from './salesOrder-products.dto';

export class CreateSalesOrderDto {
  @ValidateNested({ each: true })
  @Type(() => SalesOrderSettings)
  @ApiModelProperty({
    description:
      'Object that contains invoice options the user picked such as transport price, re, payment type...',
  })
  settings: SalesOrderSettings;

  @ValidateNested({ each: true })
  @Type(() => SalesOrderProductsDto)
  @ApiModelProperty({ description: 'Array of product id' })
  products: SalesOrderProductsDto[];
}
