import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class Credentials {

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
  }