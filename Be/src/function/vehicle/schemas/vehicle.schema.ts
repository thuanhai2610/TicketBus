import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VehicleDocument = Vehicle & Document;

@Schema({ timestamps: true , collection : 'vehicle'})
export class Vehicle {
  @Prop({required: true, type: String})
      vehicleId: string;
      @Prop({required: true, type: String, ref : 'Vehicle' })
      companyId: string;
      @Prop({required: true})
    lisencePlate: string;
    @Prop({required: true, enum : ['GIUONGNAM' , 'NGOI']})
    vehicleType: string;
    @Prop({required: true, type: Number})
    seatCount: number;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);

VehicleSchema.pre('save', async function (next) {
  const vehicle = this as VehicleDocument;
  const company = await this.model('Company').findOne({companyId: vehicle.companyId}).exec();
  if (!company) {
    const error = new Error(`company with ID ${vehicle.companyId} does not exist`);
    return next(error);
  }

  next();
});