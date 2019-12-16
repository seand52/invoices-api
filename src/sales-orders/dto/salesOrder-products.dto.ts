import { IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class SalesOrderProductsDto {
  @IsNotEmpty()
  @ApiModelProperty({ description: 'Product quantity' })
  quantity: number;

  @IsNotEmpty()
  @ApiModelProperty({ description: 'Product discount' })
  discount: number;

  @IsNotEmpty()
  @ApiModelProperty({
    description: 'Product price at the time of making the sales order',
  })
  price: number;

  @IsNotEmpty()
  @ApiModelProperty({
    description: 'Product description',
  })
  reference: string;
}
