import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PendingUserDocument = PendingUser & Document;

@Schema()
export class PendingUser {
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    email: string;

    @Prop({ default: 'user' })
    role: string;

    @Prop({ default: false })
    isEmailVerified: boolean;

    @Prop({ required: true, default: Date.now })
    createdAt: Date;
}
export interface PendingUser {
    _id: Types.ObjectId;
    username: string;
    password: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    createdAt: Date;
}

export const PendingUserSchema = SchemaFactory.createForClass(PendingUser);