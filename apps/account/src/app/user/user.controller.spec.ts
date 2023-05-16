import {Test, TestingModule} from "@nestjs/testing";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {RMQModule, RMQService, RMQTestService} from "nestjs-rmq";
import {MongooseModule} from "@nestjs/mongoose";
import {getMongoConfig} from "../configs/mongo.config";
import {INestApplication} from "@nestjs/common";
import {
  AccountBuyCourse, AccountCheckPayment,
  AccountLogin,
  AccountRegister,
  AccountUserInfo,
  CourseGetCourse, PaymentCheck,
  PaymentGenerateLink, PaymentStatus
} from "@courses/contracts";
import {UserModule} from "./user.module";
import {AuthModule} from "../auth/auth.module";
import {UserRepository} from "./repositories/user.repository";
import {verify} from "jsonwebtoken";

const authLogin: AccountLogin.Request = {
  email: "maks2@gmail.com",
  password: "qwerty"
}

const authRegister: AccountRegister.Request = {
  ...authLogin,
  username: 'maks2'
}

const courseId = 'courseId'

describe('UserController', () => {
  let app: INestApplication
  let userRepository
  let rmqService: RMQTestService
  let configService: ConfigService
  let token: string
  let userId: string

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({isGlobal: true, envFilePath: 'envs/.account.env'}),
        RMQModule.forTest({}),
        MongooseModule.forRootAsync(getMongoConfig()),
        UserModule,
        AuthModule
      ]
    }).compile()

    app = module.createNestApplication()
    userRepository = app.get(UserRepository)
    rmqService = app.get(RMQService)
    configService = app.get(ConfigService)

    await app.init()

    await rmqService.triggerRoute<AccountRegister.Request, AccountRegister.Response>(
      AccountRegister.topic,
      authRegister
    )

    const {accessToken} = await rmqService.triggerRoute<AccountLogin.Request, AccountLogin.Response>(
      AccountLogin.topic,
      authLogin
    )
    token = accessToken
    const data = verify(token, configService.get('JWT_SECRET'))
    userId = data['id']
  })

  it('GetUserInfo', async () => {
    const res = await rmqService.triggerRoute<AccountUserInfo.Request, AccountUserInfo.Response>(
      AccountUserInfo.topic,
      {id: userId}
    )
    expect(res.user.username).toEqual(authRegister.username)
  })

  it('BuyCourse', async () => {
    const paymentLink = 'paymentLink'
    // Mock way to courses service
    rmqService.mockReply<CourseGetCourse.Response>(
      CourseGetCourse.topic,
      {
        course: {_id: courseId, price: 1000, title: 'Course title'}
      }
    )

    // Mock way to payment service
    rmqService.mockReply<PaymentGenerateLink.Response>(
      PaymentGenerateLink.topic,
      { paymentLink }
    )

    const res = await rmqService.triggerRoute<AccountBuyCourse.Request, AccountBuyCourse.Response>(
      AccountBuyCourse.topic,
      {userId, courseId}
    )
    expect(res.paymentLink).toEqual(paymentLink)

    // Check that second call pay method with the same course id throw error by our logic from saga steps
    await expect(
      rmqService.triggerRoute<AccountBuyCourse.Request, AccountBuyCourse.Response>(
        AccountBuyCourse.topic,
        {userId, courseId}
      )
    ).rejects.toThrowError()
  })

  it('CheckPayment', async () => {
    // Mock payment check status
    rmqService.mockReply<PaymentCheck.Response>(
      PaymentCheck.topic,
      {status: PaymentStatus.Success}
    )
    const res = await rmqService.triggerRoute<AccountCheckPayment.Request, AccountCheckPayment.Response>(
      AccountCheckPayment.topic,
      {userId, courseId}
    )
    expect(res.status).toEqual(PaymentStatus.Success)
  })

  afterAll(async () => {
    await userRepository.deleteUser(authRegister.email)
    await app.close()
  })
})
