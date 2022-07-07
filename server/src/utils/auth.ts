import { Response } from 'express';
import { Secret, sign } from 'jsonwebtoken';
import { User } from '../entities/User';

export const createToken = (type: 'accessToken' | 'refreshToken', user: User) =>
  sign(
    {
      userId: user.id,
      ...(type === 'refreshToken' ? { tokenVersion: user.tokenVersion } : {}),
    },
    type === 'accessToken' ? (process.env.ACCESS_TOKEN_SECRET as Secret) : (process.env.REFRESH_TOKEN_SECRET as Secret),
    {
      expiresIn: type === 'accessToken' ? '15s' : '60m',
    },
  );

export const sendRefreshToken = (res: Response, user: User) => {
  console.log(process.env.REFRESH_TOKEN_COOKIE_NAME)
  res.cookie(process.env.REFRESH_TOKEN_COOKIE_NAME as string, createToken('refreshToken', user), {
    maxAge: 1000 * 60 * 6,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/refresh_token',
  });
};
