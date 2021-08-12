import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  //metadata를 얻기위해서 reflector를 얻는다.
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    //console.log('roles');
    if (!roles) {
      return true;
    }
    //console.log(context);
    const gqlContext = GqlExecutionContext.create(context).getContext();
    console.log(gqlContext.token);
    const user: User = gqlContext['user'];
    //console.log(user);
    if (!user) {
      return false; //user찾지못했다.login하지않았기때문에 user를 만들수없다는의미.
    }
    if (roles.includes('Any')) {
      return true;
    }
    return roles.includes(user.role);
  }
}
