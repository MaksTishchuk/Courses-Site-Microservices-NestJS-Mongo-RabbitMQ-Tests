import {Document, Types} from 'mongoose'
import {IUser, UserRole} from "@courses/interfaces";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {UserCourses, UserCoursesSchema} from "./user-courses.model";

@Schema()
export class User extends Document implements IUser{
  @Prop({ required: true})
  email: string

  @Prop({ required: true})
  password: string

  @Prop()
  username: string

  @Prop({ required: true, enum: UserRole, type: String, default: UserRole.Student})
  role: UserRole

  @Prop({type: [UserCoursesSchema], _id: false})
  courses: Types.Array<UserCourses>
}

export const UserSchema = SchemaFactory.createForClass(User)
