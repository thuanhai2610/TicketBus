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
    @Prop({required: true, type: Number, default: 32})
    seatCount: number;
    @Prop({required: true, type: Number, default: function () {
      return this.seatCount || 32;
    },})
availableSeats: number;
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

VehicleSchema.pre('save', function (next) {
  const vehicle = this as VehicleDocument;
  if (vehicle.availableSeats < 0 || vehicle.availableSeats > vehicle.seatCount) {
    return next(new Error('availableSeats must be between 0 and seatCount'));
  }
  next();
});