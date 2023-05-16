import {Document} from 'mongoose'
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {IUserCourses, PurchaseState} from "@courses/interfaces";

@Schema()
export class UserCourses extends Document implements IUserCourses{

  @Prop({required: true})
  courseId: string

  @Prop({required: true, enum: PurchaseState, type: String})
  purchaseState: PurchaseState

}

export const UserCoursesSchema = SchemaFactory.createForClass(UserCourses)
