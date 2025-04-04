/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; 
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { jwtConstants } from './constants';
import { OtpModule } from 'src/otp/otp.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { PendingUsersModule } from 'src/pending-users/pending-users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FacebookStrategy } from 'src/facebook/facebook.strategy';
import { GoogleStrategy } from 'src/google/google.strategy';
@Module ({
    imports: [ConfigModule.forRoot(),
        PassportModule, 
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
              secret: configService.get<string>('JWT_SECRET') || 'default_jwt_secret',
              signOptions: { expiresIn: '1d' },
            }),
            inject: [ConfigService],
          }),
        UsersModule,
        OtpModule,
        MailerModule,
        PendingUsersModule
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy, JwtAuthGuard, FacebookStrategy, GoogleStrategy ],
    controllers: [AuthController],

})
export class AuthModule{}