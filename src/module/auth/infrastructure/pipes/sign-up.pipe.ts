import { Injectable, PipeTransform } from '@nestjs/common';
import { SignUpRequest } from '../../application/requests/sign-up-request';

@Injectable()
export class SignUpPipe implements PipeTransform<SignUpRequest> {
  transform(value: SignUpRequest) {
    // TODO : Implement a validation for the mail and password using value objects
    return value;
  }
}
