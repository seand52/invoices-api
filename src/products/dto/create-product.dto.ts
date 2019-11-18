import { IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @IsNotEmpty()
  @ApiModelProperty({description: 'Product description'})
  description: string;

  @IsNotEmpty()
  @ApiModelProperty({description: 'The price without IVA'})
  price: number;

}
