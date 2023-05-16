import {Body, Controller} from '@nestjs/common';
import {RMQRoute, RMQValidate} from "nestjs-rmq";
import {AccountBuyCourse, AccountCheckPayment, AccountUpdateProfile} from "@courses/contracts";
import {UserService} from "./user.service";

@Controller()
export class UserCommands {
  constructor(private readonly userService: UserService) {}

  @RMQRoute(AccountUpdateProfile.topic)
  @RMQValidate()
  async changeProfile(
    @Body() dto: AccountUpdateProfile.Request
  ): Promise<AccountUpdateProfile.Response> {
    return this.userService.changeProfile(dto)
  }

  @RMQRoute(AccountBuyCourse.topic)
  @RMQValidate()
  async buyCourse(
    @Body() dto: AccountBuyCourse.Request
  ): Promise<AccountBuyCourse.Response> {
    return this.userService.buyCourse(dto)
  }

  @RMQRoute(AccountCheckPayment.topic)
  @RMQValidate()
  async checkPayment(
    @Body() dto: AccountCheckPayment.Request
  ): Promise<AccountCheckPayment.Response> {
    return this.userService.checkPayment(dto)
  }
}
