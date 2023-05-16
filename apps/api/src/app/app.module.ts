import { Module } from '@nestjs/common';
import {AuthController} from "./controllers/auth.controller";
import {ConfigModule} from "@nestjs/config";
import {RMQModule} from "nestjs-rmq";
import {getRMQConfig} from "./configs/rmq.config";
import {JwtModule, JwtService} from "@nestjs/jwt";
import {getJWTConfig} from "./configs/jwt.config";
import {PassportModule} from "@nestjs/passport";
import {UserController} from "./controllers/user.controller";
import {ScheduleModule} from "@nestjs/schedule";
import {JwtStrategy} from "./strategies/jwt.strategy";

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true, envFilePath: 'envs/.api.env'}),
    RMQModule.forRootAsync(getRMQConfig()),
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.registerAsync(getJWTConfig()),
    ScheduleModule.forRoot()
  ],
  controllers: [AuthController, UserController],
  providers: [JwtService, JwtStrategy]
})
export class AppModule {}
