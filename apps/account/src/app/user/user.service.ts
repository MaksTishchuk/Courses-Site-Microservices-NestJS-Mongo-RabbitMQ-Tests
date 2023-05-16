import {BadRequestException, Injectable} from "@nestjs/common";
import {AccountBuyCourse, AccountCheckPayment, AccountUpdateProfile} from "@courses/contracts";
import {UserEntity} from "./entities/user.entity";
import {UserRepository} from "./repositories/user.repository";
import {RMQService} from "nestjs-rmq";
import {BuyCourseSaga} from "./sagas/buy-course.saga";
import {UserEventEmitter} from "./user.event-emitter";

@Injectable()
export class UserService {

  constructor(
    private readonly rmqService: RMQService,
    private readonly userRepository: UserRepository,
    private readonly userEventEmitter: UserEventEmitter
  ) {}

  async changeProfile(dto: AccountUpdateProfile.Request): Promise<AccountUpdateProfile.Response> {
    const findUser = await this.checkUser(dto.id)
    const userEntity = new UserEntity(findUser).updateProfile(dto.username)
    await this.updateUserInfoAndHandleEvent(userEntity)
    delete userEntity.password
    return {user: userEntity}
  }

  async buyCourse(dto: AccountBuyCourse.Request): Promise<AccountBuyCourse.Response> {
    const findUser = await this.checkUser(dto.userId)
    const userEntity = new UserEntity(findUser)
    const saga = new BuyCourseSaga(userEntity, dto.courseId, this.rmqService)
    const {user, paymentLink} = await saga.getState().pay()
    await this.updateUserInfoAndHandleEvent(user)
    return {paymentLink}
  }

  async checkPayment(dto: AccountCheckPayment.Request): Promise<AccountCheckPayment.Response> {
    const findUser = await this.checkUser(dto.userId)
    const userEntity = new UserEntity(findUser)
    const saga = new BuyCourseSaga(userEntity, dto.courseId, this.rmqService)
    const {user, status} = await saga.getState().checkPayment()
    await this.updateUserInfoAndHandleEvent(user)
    return {status}
  }

  private async checkUser(userId) {
    const findUser = await this.userRepository.findUserById(userId)
    if (!findUser) {
      throw new BadRequestException('User not found!')
    }
    return findUser
  }

  private async updateUserInfoAndHandleEvent(user: UserEntity) {
    return Promise.all([
      this.userEventEmitter.handle(user),
      this.userRepository.updateUser(user)
    ])
  }
}
