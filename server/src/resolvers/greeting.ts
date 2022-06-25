import { Context } from './../types/context';
import { checkAuth } from '../middleware/checkAuth';
import { Ctx, Query, Resolver, UseMiddleware } from 'type-graphql';
import { User } from '../entities/User';

@Resolver()
export class GreetingResolver {
  @Query((_return) => String)
  @UseMiddleware(checkAuth)
  async hello(@Ctx() { user }: Context): Promise<string> {
    const existingUser = await User.findOne({
      where: {
        id: user.userId,
      },
    });
    return `Hello ${existingUser ? existingUser.username : 'World'}`;
  }
}
