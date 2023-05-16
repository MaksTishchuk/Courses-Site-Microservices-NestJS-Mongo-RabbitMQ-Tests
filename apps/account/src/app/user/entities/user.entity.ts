import {IDomainInterface, IUser, IUserCourses, PurchaseState, UserRole} from "@courses/interfaces";
import {compare, genSalt, hash} from "bcryptjs";
import {AccountChangedCourse} from "@courses/contracts";

export class UserEntity implements IUser {
  _id?: string
  email: string
  password: string
  role: UserRole
  courses?: IUserCourses[]
  username?: string
  events: IDomainInterface[] = []


  constructor(user: IUser) {
    this._id = user._id
    this.email = user.email
    this.password = user.password
    this.username = user.username
    this.role = user.role
    this.courses = user.courses
  }

  public getUserInfo() {
    return {
      id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
      courses: this.courses
    }
  }

  public setCourseStatus(courseId: string, state: PurchaseState) {
    const findCourse = this.courses.find(course => course.courseId === courseId)
    if (!findCourse) {
      this.courses.push({
        courseId,
        purchaseState: state
      })
      return this
    }
    if (state === PurchaseState.Canceled) {
      this.courses = this.courses.filter(course => course.courseId !== courseId)
      return this
    }
    this.courses = this.courses.map(course => {
      if (course.courseId === courseId) {
        course.purchaseState = state
        return course
      }
      return course
    })
    this.events.push({
      topic: AccountChangedCourse.topic,
      data: {courseId, userId: this._id, state}
    })
    return this
  }

  public getCourseState(courseId: string): PurchaseState {
    return this.courses.find(course => course.courseId === courseId)?.purchaseState ?? PurchaseState.Started
  }

  public async setPassword(password: string) {
    const salt = await genSalt(10)
    this.password = await hash(password, salt)
    return this
  }

  public validatePassword(password: string) {
    return compare(password, this.password)
  }

  public updateProfile(username: string) {
    this.username = username
    return this
  }
}
