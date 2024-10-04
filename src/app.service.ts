import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot(): { message: string; version: string; status: string } {
    return {
      message: 'Welcome to the Site Logistics API',
      version: '0.0.1',
      status: 'Running',
    };
  }
}
