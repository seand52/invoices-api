import { IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class InvoiceProductsDto {
  @IsNotEmpty()
  @ApiModelProperty({ description: 'id of product selected' })
  id: number;

  @IsNotEmpty()
  @ApiModelProperty({ description: 'Product quantity' })
  quantity: number;

  @IsNotEmpty()
  @ApiModelProperty({ description: 'Product discount' })
  discount: number;

  @IsNotEmpty()
  @ApiModelProperty({
    description: 'Product price at the time of making the invoice',
  })
  price: number;
}
