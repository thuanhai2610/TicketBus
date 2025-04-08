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

DriverSchema.pre('save', async function (next) {
  const drivers = this as DriverDocument;
  const driver= await this.model('Driver').findOne({driverId: drivers.driverId}).exec();
  if (!driver) {
    const error = new Error(`Company with ID ${drivers.driverId} does not exist`);
    return next(error);
  }

  next();
});