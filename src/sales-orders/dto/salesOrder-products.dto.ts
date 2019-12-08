import { IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class SalesOrderProductsDto {
  @IsNotEmpty()
  @ApiModelProperty({ description: 'id of product selected' })
  id: number;

  @IsNotEmpty()
  @ApiModelProperty({ description: 'Product quantiy' })
  quantity: number;

  @IsNotEmpty()
  @ApiModelProperty({ description: 'product discount' })
  discount: number;
}
