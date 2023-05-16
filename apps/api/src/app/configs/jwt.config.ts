import { ConfigModule, ConfigService } from '@nestjs/config';
import {JwtModuleAsyncOptions, JwtModuleOptions} from '@nestjs/jwt'

export const getJWTConfig = (): JwtModuleAsyncOptions => ({
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => ({
		secret: configService.get('JWT_SECRET')
	})
})
