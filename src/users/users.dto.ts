import {IsNotEmpty, IsString, MinLength} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class UserDto {
  @IsNotEmpty()
  @IsString()
  @ApiModelProperty({description: 'Username of choice', required: true})
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @ApiModelProperty({description: 'Username of choice', required: true, minLength: 6})
  password: string;
}

export interface UserPayload {
  username: string;
  id: number;
}
