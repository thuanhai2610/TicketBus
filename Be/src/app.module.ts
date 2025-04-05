import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemsModule } from './items/items.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './interceptors/loggin.interceptor';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { PendingUsersModule } from './pending-users/pending-users.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './function/companies/company.module';
import { VehicleModule } from './function/vehicle/vehicle.module';
import { DriverModule } from './function/driver/driver.module';
import { TripModule } from './function/trip/trip.module';
import { TicketModule } from './function/tickets/ticket.module';
import { SeatModule } from './function/seats/seat.module';
@Module({
  imports: [AuthModule, PendingUsersModule, ItemsModule, MongooseModule.forRoot('mongodb://localhost:27017/admin'),ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth : {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        }
      },
      defaults : {
        from: '"My App" <thuanhai2610@gmail.com',
      },
       template : {
        dir: join(process.cwd(), 'src/templates'),
        adapter: new HandlebarsAdapter(),
        options : {
          strict: true,
        }
       }
    }), UsersModule, CompaniesModule, VehicleModule, DriverModule, TripModule, TicketModule, SeatModule
  ],

  controllers: [AppController],
  providers: [AppService, {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
  }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer){
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
 }
