import { UserMutationResponse } from './../types/UserMutationResponse';
import { User } from './../entities/User';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { RegisterInput } from '../types/RegisterInput';
import { hash, verify } from 'argon2';
import { LoginInput } from '../types/LoginInput';
import { createToken, sendRefreshToken } from '../utils/auth';
import { Context } from 'types/context';

@Resolver()
export class UserResolver {
  @Query((_return) => [User])
  async users(): Promise<User[]> {
    return await User.find();
  }

  @Mutation((_return) => UserMutationResponse)
  async register(
    @Arg('registerInput')
    { username, password }: RegisterInput,
  ): Promise<UserMutationResponse> {
    const existingUser = await User.findOne({
      where: {
        username,
      },
    });

    if (existingUser) {
      return {
        code: 400,
        success: false,
        message: 'Duplicated username',
      };
    }

    const hashedPassword = await hash(password);

    const newUser = User.create({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    return {
      code: 200,
      success: true,
      message: 'User registration successful',
      user: newUser,
    };
  }

  @Mutation((_return) => UserMutationResponse)
  async login(@Arg('loginInput') { username, password }: LoginInput, @Ctx() { res }: Context): Promise<UserMutationResponse> {
    const existingUser = await User.findOne({
      where: {
        username,
      },
    });

    if (!existingUser) {
      return {
        code: 400,
        success: false,
        message: 'User not found',
      };
    }

    const isPasswordValid = await verify(existingUser.password, password);

    if (!isPasswordValid) {
      return {
        code: 400,
        success: false,
        message: 'Incorrect password',
      };
    }

    sendRefreshToken(res, existingUser);

    return {
      code: 200,
      success: true,
      message: 'Logged in successfully',
      user: existingUser,
      accessToken: createToken('accessToken', existingUser),
    };
  }

  @Mutation((_return) => UserMutationResponse)
  async logout(@Arg('userId', (_type) => ID) userId: number, @Ctx() { res }: Context): Promise<UserMutationResponse> {
    const existingUser = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return {
        code: 400,
        success: false,
      };
    }

    existingUser.tokenVersion += 1;

    await existingUser.save();

    res.clearCookie(process.env.REFRESH_TOKEN_COOKIE_NAME as string, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/refresh_token',
    });

    return { code: 200, success: true };
  }
}
