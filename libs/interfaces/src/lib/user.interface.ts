export enum UserRole {
  Teacher = 'Teacher',
  Student = 'Student'
}

export enum PurchaseState {
  Started = 'Started',
  WaitingForPayment = 'WaitingForPayment',
  Purchased = 'Purchased',
  Canceled = 'Canceled'
}

export interface IUser {
  _id?: string
  username?: string
  email: string
  password: string
  role: UserRole
  courses?: IUserCourses[]
}

export interface IUserCourses {
  courseId: string
  purchaseState: PurchaseState
}
