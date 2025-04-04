import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface User {
    _id: Types.ObjectId; 
    username: string;
    password?: string;
    email: string;
    role: string;
    emailVerified: boolean;
}

@Schema()
export class User {
    @Prop()
    avatar: string; 
    
    @Prop({ required: true , unique: true})
    username: string;

    @Prop({ required: true })
    password?: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, default: 'user' })
    role: string;

    @Prop({ required: true, default: false })
    emailVerified: boolean;

    @Prop()
    firstName: string;

    @Prop()
    lastName: string;

    @Prop()
    dob: Date;

    @Prop()
    gender: string;
    
    @Prop()
    phone: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);