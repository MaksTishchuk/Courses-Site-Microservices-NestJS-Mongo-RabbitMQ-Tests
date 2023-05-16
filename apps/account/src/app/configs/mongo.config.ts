import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';

export const getMongoConfig = (): MongooseModuleAsyncOptions => {
	return {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
			uri: configService.get<string>('MONGODB_URI')
		})
	}
}

// export const getMongoConfig = (): MongooseModuleAsyncOptions => {
// 	return {
//     imports: [ConfigModule],
//     inject: [ConfigService],
//     useFactory: (configService: ConfigService) => ({
// 			uri: getMongoString(configService)
// 		})
// 	}
// }

// const getMongoString = (configService: ConfigService) =>
// 	'mongodb://' +
// 	configService.get('MONGO_LOGIN') +
// 	':' +
// 	configService.get('MONGO_PASSWORD') +
// 	'@' +
// 	configService.get('MONGO_HOST') +
// 	':' +
// 	configService.get('MONGO_PORT') +
// 	'/' +
// 	configService.get('MONGO_DATABASE') +
// 	'?authSource=' +
// 	configService.get('MONGO_AUTH_DATABASE')
