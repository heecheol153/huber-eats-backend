import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD, //nestjs의 constant임
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
