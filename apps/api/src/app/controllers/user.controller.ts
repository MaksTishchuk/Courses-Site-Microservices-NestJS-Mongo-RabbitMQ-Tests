import {
  Body,
  Controller, Get,
  Logger,
  Post,
  Put,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import {JWTAuthGuard} from "../guards/jwt.guard";
import {GetUser} from "../guards/user.decorator";
import {Cron} from "@nestjs/schedule";
import {
  AccountBuyCourse, AccountCheckPayment,
  AccountUpdateProfile,
  AccountUserCourses,
  AccountUserInfo
} from "@courses/contracts";
import {RMQService} from "nestjs-rmq";

@Controller('user')
export class UserController {

  constructor(
    private readonly rmqService: RMQService
  ) {}

  @UseGuards(JWTAuthGuard)
  @Get('profile')
  async getUserInfo(
    @GetUser() userId: string
  ) {
    try {
      return await this.rmqService.send<AccountUserInfo.Request, AccountUserInfo.Response>(
        AccountUserInfo.topic, {id: userId}
      )
    } catch (err) {
      if (err instanceof Error) {
        throw new UnauthorizedException(err.message)
      }
    }
  }

  @UseGuards(JWTAuthGuard)
  @Put('profile')
  async changeProfile(
    @GetUser() userId: string,
    @Body('username') username: string
  ) {
    try {
      return await this.rmqService.send<AccountUpdateProfile.Request, AccountUpdateProfile.Response>(
        AccountUpdateProfile.topic, {id: userId, username: username}
      )
    } catch (err) {
      if (err instanceof Error) {
        throw new UnauthorizedException(err.message)
      }
    }
  }

  @UseGuards(JWTAuthGuard)
  @Get('courses')
  async getUserCourses(
    @GetUser() userId: string
  ) {
    try {
      return await this.rmqService.send<AccountUserCourses.Request, AccountUserCourses.Response>(
        AccountUserCourses.topic, {id: userId}
      )
    } catch (err) {
      if (err instanceof Error) {
        throw new UnauthorizedException(err.message)
      }
    }
  }

  @UseGuards(JWTAuthGuard)
  @Post('buy-course')
  async buyCourse(
    @GetUser() userId: string,
    @Body('courseId') courseId: string
  ) {
    try {
      return await this.rmqService.send<AccountBuyCourse.Request, AccountBuyCourse.Response>(
        AccountBuyCourse.topic, {userId, courseId}
      )
    } catch (err) {
      if (err instanceof Error) {
        throw new UnauthorizedException(err.message)
      }
    }
  }

  @UseGuards(JWTAuthGuard)
  @Get('check-payment')
  async checkPayment(
    @GetUser() userId: string,
    @Body('courseId') courseId: string
  ) {
    try {
      return await this.rmqService.send<AccountCheckPayment.Request, AccountCheckPayment.Response>(
        AccountCheckPayment.topic, {userId, courseId}
      )
    } catch (err) {
      if (err instanceof Error) {
        throw new UnauthorizedException(err.message)
      }
    }
  }

  @Cron('*/5 * * * *') // every 5 seconds run
  async cron() {
    Logger.log('Done')
  }

}
