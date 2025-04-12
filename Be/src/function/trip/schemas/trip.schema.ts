import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { Document } from 'mongoose';

export type TripDocument = Trip & Document;

@Schema({ timestamps: true, collection: 'trip' })
export class Trip {
  @Prop({ required: true, type: String, index: true, unique: true })
  tripId: string;

  @Prop({ required: true, type: String, ref: 'Company', index: true })
  companyId: string;

  @Prop({ required: true, type: String, ref: 'Vehicle',  index: true }) 
  vehicleId: string;

  @Prop({ required: true, type: String, ref: 'Driver', index: true }) 
  driverId: string;

  @Prop({ required: true })
  departurePoint: string;

  @Prop({ required: true })
  destinationPoint: string;
  @Prop({ required: true, type: Number })
  departureLatitude: number;

  @Prop({ required: true, type: Number })
  departureLongtitude: number;
  @Prop({ required: true, type: Number })
  destinationLatitude: number;

  @Prop({ required: true, type: Number })
  destinationLongtitude: number;
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

// Manually configure indexes after schema creation
TripSchema.index({ tripId: 1 }, { unique: true });
TripSchema.index({ companyId: 1 }, { unique: false }); 
TripSchema.index({ driverId: 1 }, { unique: false });
TripSchema.index({ vehicleId: 1 }, { unique: false });

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
  const existingTrip = await this.model('Trip').findOne({
    driverId: trip.driverId,
    status: { $in: ['PENDING', 'IN_PROGRESS'] },
    _id: { $ne: trip._id } // Exclude current document if it's an update
  }).exec();

  if (existingTrip) {
    const error = new Error(`Tài xế ${trip.driverId} đã được phân công cho chuyến đi khác và chưa hoàn thành`);
    return next(error);
  }
  const existingTripWithVehicle = await this.model('Trip').findOne({
    vehicleId: trip.vehicleId,
    status: { $in: ['PENDING', 'IN_PROGRESS'] },
    _id: { $ne: trip._id } // Exclude current document if it's an update
  }).exec();

  if (existingTripWithVehicle) {
    const error = new Error(`Phương tiện ${trip.vehicleId} đã được phân công cho chuyến đi khác và chưa hoàn thành`);
    return next(error);
  }

  next();
});