import { AuthenticationError } from 'apollo-server-express';
import { Secret, verify } from 'jsonwebtoken';
import { MiddlewareFn } from 'type-graphql';
import { UserAuthPayload } from 'types/UserAuthPayload';
import { Context } from 'types/Context';

export const checkAuth: MiddlewareFn<Context> = ({ context }, next) => {
  try {
    const authHeader = context.req.header('Authorization');
    const accesssToken = authHeader && authHeader.split(' ')[1];

    if (!accesssToken) throw new AuthenticationError('Not authenticated to perform GraphQL operation');

    const decodedUser = verify(accesssToken, process.env.ACCESS_TOKEN_SECRET as Secret) as UserAuthPayload;

    context.user = decodedUser;

    return next();
  } catch (error) {
    throw new AuthenticationError(`Error authenticating user, ${JSON.stringify(error)}`);
  }
};
