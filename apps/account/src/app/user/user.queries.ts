import {Body, Controller} from '@nestjs/common';
import {RMQRoute, RMQValidate} from "nestjs-rmq";
import {AccountUserCourses, AccountUserInfo} from "@courses/contracts";
import {UserRepository} from "./repositories/user.repository";
import {UserEntity} from "./entities/user.entity";

@Controller()
export class UserQueries {

  constructor(
    private readonly userRepository: UserRepository
  ) {}

  @RMQRoute(AccountUserInfo.topic)
  @RMQValidate()
  async getUserInfo(
    @Body() {id}: AccountUserInfo.Request
  ): Promise<AccountUserInfo.Response> {
    const user = await this.userRepository.findUserById(id)
    const userEntity = new UserEntity(user).getUserInfo()
    return {user: userEntity}
  }

  @RMQRoute(AccountUserCourses.topic)
  @RMQValidate()
  async getUserCourses(
    @Body() {id}: AccountUserCourses.Request
  ): Promise<AccountUserCourses.Response> {
    const user = await this.userRepository.findUserById(id)
    return {courses: user.courses}
  }

}
