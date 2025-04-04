import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { Document } from 'mongoose';

export type TripDocument = Trip & Document;

@Schema({ timestamps: true , collection : 'trip'})
export class Trip {
  @Prop({ required: true })
  tripId: string;

  @Prop({required: true, type: String, ref : 'Company' })
  companyId: string;

  @Prop({ required: true, type: String, ref: 'Vehicle' }) 
  vehicleId: string;

  @Prop({ required: true, type: String, ref: 'Driver' }) 
  driverId: string;

  @Prop({ required: true })
  departurePoint: string;

  @Prop({ required: true })
  destinationPoint: string;

  @Prop({ required: true, type: Date })
  departureTime: Date;

  @Prop({ required: true, type: Date })
  arrivalTime: Date;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  status: string;
}

export const TripSchema = SchemaFactory.createForClass(Trip);

TripSchema.pre('save', async function (next) {
  const trip = this as TripDocument;
  const company = await this.model('Company').findOne({companyId: trip.companyId}).exec();
  const vehicle = await this.model('Vehicle').findOne({vehicleId: trip.vehicleId}).exec();
  const driver = await this.model('Driver').findOne({driverId: trip.driverId}).exec();
  if (!company) {
    const error = new Error(`Company with ID ${trip.companyId} does not exist`);
    return next(error);
  }
  if (!vehicle) {
    const error = new Error(`Vehicle with ID ${trip.vehicleId} does not exist`);
    return next(error);
  }
  if (!driver) {
    const error = new Error(`Driver with ID ${trip.driverId} does not exist`);
    return next(error);
  }

  next();
});