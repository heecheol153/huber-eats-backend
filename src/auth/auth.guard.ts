import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Token } from 'graphql';
import { JwtService } from 'src/jwt/jwt.service';
import { UserService } from 'src/users/users.service';
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  //metadata를 얻기위해서 reflector를 얻는다.
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    //console.log('roles');
    if (!roles) {
      //roles가 없으면 guard가 그냥지나간다.roles가없으면 보호할필요가 없기때문이다.
      return true;
    }
    //console.log(context);
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const token = gqlContext.token;
    if (token) {
      //context에토큰이 있으면 토큰을 decode한다.그리고 user를 찾는다. user가없으면 false를 return한다.
      const decoded = this.jwtService.verify(token.toString());
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        const { user } = await this.userService.findById(decoded['id']);
        if (user) {
          gqlContext['user'] = user;
          if (roles.includes('Any')) {
            return true;
          }
          return roles.includes(user.role);
        }
      }
    }
    return false;
  }
}
