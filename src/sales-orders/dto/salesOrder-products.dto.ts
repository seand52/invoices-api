import { IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class SalesOrderProductsDto {
  @IsNotEmpty()
  @ApiModelProperty({ description: 'id of client selected' })
  id: number;

  @IsNotEmpty()
  @ApiModelProperty({ description: 'Invoice date' })
  quantity: number;
}
