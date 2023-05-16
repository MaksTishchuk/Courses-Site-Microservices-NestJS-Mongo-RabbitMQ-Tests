import {BuyCourseSagaState} from "./buy-course.state";
import {UserEntity} from "../entities/user.entity";
import {
  CourseGetCourse,
  PaymentCheck,
  PaymentGenerateLink,
  PaymentStatus
} from "@courses/contracts";
import {PurchaseState} from "@courses/interfaces";

export class BuyCourseSagaStateStarted extends BuyCourseSagaState {

  public async pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    const { course } = await this.saga.rmqService.send<CourseGetCourse.Request, CourseGetCourse.Response>(
      CourseGetCourse.topic,
      {id: this.saga.courseId}
    )
    if (!course) {
      throw new Error('No such course!')
    }
    if (course.price == 0) {
      this.saga.setState(course._id, PurchaseState.Purchased)
      return { paymentLink: null, user: this.saga.user}
    }
    const { paymentLink } = await this.saga.rmqService.send<PaymentGenerateLink.Request, PaymentGenerateLink.Response>(
      PaymentGenerateLink.topic,
      {courseId: course._id, userId: this.saga.user._id, sum: course.price}
    )
    this.saga.setState(course._id, PurchaseState.WaitingForPayment)
    return { paymentLink, user: this.saga.user}
  }

  public async checkPayment(): Promise<{ user: UserEntity, status: PaymentStatus }> {
    throw new Error('Can`t check payment which was not started!')
  }

  public async cancel(): Promise<{ user: UserEntity }> {
    this.saga.setState(this.saga.courseId, PurchaseState.Canceled)
    return {user: this.saga.user}
  }
}

export class BuyCourseSagaStateWaitingForPayment extends BuyCourseSagaState {

  public async pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    throw new Error('Can`t create payment link when payment in process!')
  }

  public async checkPayment(): Promise<{ user: UserEntity, status: PaymentStatus }> {
    const {status} = await this.saga.rmqService.send<PaymentCheck.Request, PaymentCheck.Response>(
      PaymentCheck.topic,
      {userId: this.saga.user._id, courseId: this.saga.courseId}
    )
    if (status === 'Canceled') {
      this.saga.setState(this.saga.courseId, PurchaseState.Canceled)
      return {user: this.saga.user, status}
    }
    if (status !== 'Success') {
      return {user: this.saga.user, status}
    }
    this.saga.setState(this.saga.courseId, PurchaseState.Purchased)
    return {user: this.saga.user, status}
  }

  public async cancel(): Promise<{ user: UserEntity }> {
    throw new Error('Can`t cancel payment in process!')
  }
}

export class BuyCourseSagaStatePurchased extends BuyCourseSagaState {
  public async pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    throw new Error('Can`t payment purchased course!')
  }

  public async checkPayment(): Promise<{ user: UserEntity, status: PaymentStatus }> {
    throw new Error('Can`t check payment by purchased course!')
  }

  public async cancel(): Promise<{ user: UserEntity }> {
    throw new Error('Can`t cancel payment purchased course!')
  }
}


export class BuyCourseSagaStateCanceled extends BuyCourseSagaState {
  public async pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    this.saga.setState(this.saga.courseId, PurchaseState.Started)
    return this.saga.getState().pay()
  }

  public async checkPayment(): Promise<{ user: UserEntity, status: PaymentStatus }> {
    throw new Error('Can`t check payment by canceled course!')
  }

  public async cancel(): Promise<{ user: UserEntity }> {
    throw new Error('Can`t cancel canceled course!')
  }
}
