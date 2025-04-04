import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const {method, url, body} = request;


        console.log(`Request : ${method} ${url}`);
        console.log('Request Body: ', body)

        const now = Date.now();
        return next.handle().pipe (
            tap(()=>{
                console.log(`Response: ${method} ${url} ${Date.now() - now}ms`);
                console.log('Response status: ', response.statusCode);
            })
        )
    }
}