import {IsEmail, IsOptional, IsString, MinLength} from "class-validator";

export namespace AccountRegister {
  export const topic = 'account.register.command'

  export class Request {
    @IsEmail()
    email: string

    @IsString()
    @MinLength(5)
    password: string

    @IsOptional()
    @IsString()
    username?: string
  }

  export class Response {
    email: string
  }
}

