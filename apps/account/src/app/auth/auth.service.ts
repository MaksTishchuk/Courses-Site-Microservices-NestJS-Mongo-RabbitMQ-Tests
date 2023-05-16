import {BadRequestException, Injectable} from '@nestjs/common';
import {UserRepository} from "../user/repositories/user.repository";
import {UserEntity} from "../user/entities/user.entity";
import {UserRole} from "@courses/interfaces";
import {JwtService} from "@nestjs/jwt";
import {AccountLogin, AccountRegister} from "@courses/contracts";

@Injectable()
export class AuthService {

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register({email, password, username}: AccountRegister.Request): Promise<AccountRegister.Response> {
    const oldUser = await this.userRepository.findUser(email)
    if (oldUser) {throw new BadRequestException('User already exists!')}
    const newUserEntity = await new UserEntity({
      email,
      username,
      password: '',
      role: UserRole.Student
    }).setPassword(password)
    const newUser = await this.userRepository.createUser(newUserEntity);
		return { email: newUser.email }
  }

  async login({email, password}: AccountLogin.Request): Promise<AccountLogin.Response> {
    const user = await this.userRepository.findUser(email)
    if (!user) {throw new BadRequestException('Invalid credentials!')}
    const userEntity = new UserEntity(user)
    const isCorrectPassword = await userEntity.validatePassword(password)
    if (!isCorrectPassword) {
      throw new BadRequestException('Invalid credentials!')
    }
    return {
      accessToken: await this.jwtService.signAsync({id: userEntity._id})
    }
  }
}
