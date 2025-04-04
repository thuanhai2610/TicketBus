import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate, IsEmail } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()

export class ValidateEmailPipe implements PipeTransform{
    async transform(value: any, metadata: ArgumentMetadata) {
        if(typeof value !== 'string') {
            throw new BadRequestException('Validation failed')
        }

        class EmailDto{
            @IsEmail()
            email:string;
        }
        const emailDto = plainToClass(EmailDto, {email: value});
        const errors = await validate(emailDto);

        if (errors.length > 0) {
            throw new BadRequestException('Validation failed');
        }
        return value;
    }
}