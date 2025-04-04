import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PendingUser, PendingUserSchema } from './schemas/pending-user.schema';
import { PendingUsersService } from './pending-users.service';


@Module({
    imports: [
        MongooseModule.forFeature([{ name: PendingUser.name, schema: PendingUserSchema }]),
    ],
    providers: [PendingUsersService],
    exports: [PendingUsersService],
})
export class PendingUsersModule {}