import { Module  } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersService } from "./users.service";
import { User, UserSchema } from "./user.schema";
import { UserController } from "./user.controller";
import { join } from "path";
import { ServeStaticModule } from "@nestjs/serve-static";
import { UsersRepository } from "./user.repository";


@Module({
imports: [MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'uploads'),
    serveRoot: '/uploads',
  }), ],

providers: [UsersService, UsersRepository],
exports: [UsersService],
controllers: [UserController]

})
export class UsersModule {}