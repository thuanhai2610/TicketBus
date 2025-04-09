import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./user.schema";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Roles } from "src/auth/roles.decorator";

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}


  @Roles('admin')
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}