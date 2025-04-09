import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DriverDocument = Driver & Document;

@Schema({ timestamps: true , collection: 'driver'})
export class Driver {
    @Prop({ required: true , type: String})
    driverId: string;
    @Prop({required: true, type: String, ref : 'Company' })
    companyId: string;
  @Prop({ required: true })
  driverName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;
}

export const DriverSchema = SchemaFactory.createForClass(Driver);

