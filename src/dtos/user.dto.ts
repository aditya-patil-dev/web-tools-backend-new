import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";

export enum LoginClient {
  ADMIN = "admin",
  CUSTOMER = "customer",
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(LoginClient)
  client?: LoginClient;
}
