import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './otp.schema';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { PendingUser, PendingUserSchema } from 'src/pending-users/schemas/pending-user.schema';
import { User, UserSchema } from 'src/users/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }, {name: PendingUser.name, schema: PendingUserSchema }
    , {name: User.name, schema: UserSchema}
  ])],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService, OtpModule],
})
export class OtpModule {}