import { Prop } from '@nestjs/mongoose';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Matches, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, Validate } from 'class-validator';

// Predefined city coordinates
const CITY_COORDINATES: Record<string, { latitude: number; longtitude: number }> = {
  'Đà nẵng': { latitude: 16.0544, longtitude: 108.2022 },
  'Huế': { latitude: 16.463713, longtitude: 107.590866 },
  'Quảng Ngãi': { latitude: 15.122330, longtitude: 108.799362 },
  'Phú Yên': { latitude: 13.092338, longtitude: 109.294493 },
  'Nha Trang': { latitude: 12.249265, longtitude: 109.192804 },
  'Bình Định': { latitude: 14.174993, longtitude: 109.052671 },
};

// Custom validator for city coordinates
@ValidatorConstraint({ name: 'CityCoordinates', async: false })
export class CityCoordinatesValidator implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    return !!CITY_COORDINATES[value];
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid city with predefined coordinates (e.g., Đà Nẵng, HCM, Hà Nội)`;
  }
}

export class CreateTripDto {
  @IsNotEmpty()
  @IsString()
  tripId: string;

  @IsNotEmpty()
  @IsString()
  @Prop({ required: true, type: String, ref: 'Company' })
  companyId: string;

  @IsNotEmpty()
  @IsString()
  vehicleId: string;

  @IsNotEmpty()
  @IsString()
  driverId: string;

  @IsNotEmpty()
  @IsString()
  @Validate(CityCoordinatesValidator)
  departurePoint: string;

  @IsNotEmpty()
  @IsString()
  @Validate(CityCoordinatesValidator)
  destinationPoint: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}-\d{2}-\d{4}$/)
  departureDate: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  departureHour: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}-\d{2}-\d{4}$/)
  arrivalDate: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  arrivalHour: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsEnum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status: string;

  // Coordinates for departure point
  @IsNotEmpty()
  @IsNumber()
  departureLatitude: number;

  @IsNotEmpty()
  @IsNumber()
  departureLongtitude: number;

  // Coordinates for destination point
  @IsNotEmpty()
  @IsNumber()
  destinationLatitude: number;

  @IsNotEmpty()
  @IsNumber()
  destinationLongtitude: number;

  // Method to set default coordinates
   setDefaultCoordinates() {
    if (CITY_COORDINATES[this.departurePoint]) {
      this.departureLatitude = CITY_COORDINATES[this.departurePoint].latitude;
      this.departureLongtitude = CITY_COORDINATES[this.departurePoint].longtitude;
    }
    if (CITY_COORDINATES[this.destinationPoint]) {
      this.destinationLatitude = CITY_COORDINATES[this.destinationPoint].latitude;
      this.destinationLongtitude = CITY_COORDINATES[this.destinationPoint].longtitude;
    }
  }
}
