import { Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema()
export class Otp extends Document {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' }) // Define userId as ObjectId
    userId: Types.ObjectId;

    @Prop({required: true})
    otp: string;

    @Prop({required: true, default: Date.now, expires: 300})
    createdAt: Date;
    @Prop({ required: true, default: () => new Date(Date.now() + 10 * 60 * 1000) })
    expiresAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);