import {IsNotEmpty, IsString, MinLength} from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

export interface UserPayload {
  username: string;
  id: number;
}
