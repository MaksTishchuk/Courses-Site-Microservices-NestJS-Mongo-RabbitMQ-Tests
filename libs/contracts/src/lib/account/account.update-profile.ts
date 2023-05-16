import {IsString} from "class-validator";
import {IUser} from "@courses/interfaces";

export namespace AccountUpdateProfile {
  export const topic = 'account.update-profile.command'

  export class Request {
    @IsString()
    id: string

    @IsString()
    username: string
  }

  export class Response {
    user: Omit<IUser, 'password'> | null
  }
}

