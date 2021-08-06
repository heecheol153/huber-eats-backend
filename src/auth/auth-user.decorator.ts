import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    console.log('gql getContext :', user);
    return user;
    //append
    //const _context = gqlContext['user'];
    //console.log('gql getContext :', _context);

    //if (_context.ok) {
    //  return _context.user;
    //} else {
    //  throw new Error();
    //}
  },
);
