import { IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @IsOptional()
  @ApiModelProperty({ description: 'Product description' })
  reference: string;

  @IsOptional()
  @ApiModelProperty({ description: 'The price without IVA' })
  price: number;
}
