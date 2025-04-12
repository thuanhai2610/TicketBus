import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Validate } from 'class-validator';
import { CityCoordinatesValidator } from './create-trip.dto';

export class UpdateTripDto {
  @IsOptional()
  @IsString()
  tripId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  @Validate(CityCoordinatesValidator)
  departurePoint?: string;

  @IsOptional()
  @IsString()
  @Validate(CityCoordinatesValidator)
  destinationPoint?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}-\d{2}-\d{4}$/)
  departureDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  departureHour?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}-\d{2}-\d{4}$/)
  arrivalDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  arrivalHour?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsNumber()
  departureLatitude?: number;

  @IsOptional()
  @IsNumber()
  departureLongtitude?: number;

  @IsOptional()
  @IsNumber()
  destinationLatitude?: number;

  @IsOptional()
  @IsNumber()
  destinationLongtitude?: number;

  // Method to set default coordinates (optional for updates)
  setDefaultCoordinates() {
    const CITY_COORDINATES: Record<string, { latitude: number; longtitude: number }> = {
      'Đà Nẵng': { latitude: 16.0544, longtitude: 108.2022 },
  'Huế': { latitude: 16.463713, longtitude: 107.590866 },
  'Quảng Ngãi': { latitude: 15.122330, longtitude: 108.799362 },
  'Phú Yên': { latitude: 13.092338, longtitude: 109.294493 },
  'Nha Trang': { latitude: 12.249265, longtitude: 109.192804 },
  'Bình Định': { latitude: 14.174993, longtitude: 109.052671 },
    };
    if (this.departurePoint && CITY_COORDINATES[this.departurePoint]) {
      this.departureLatitude = CITY_COORDINATES[this.departurePoint].latitude;
      this.departureLongtitude = CITY_COORDINATES[this.departurePoint].longtitude;
    }
    if (this.destinationPoint && CITY_COORDINATES[this.destinationPoint]) {
      this.destinationLatitude = CITY_COORDINATES[this.destinationPoint].latitude;
      this.destinationLongtitude = CITY_COORDINATES[this.destinationPoint].longtitude;
    }
  }
}