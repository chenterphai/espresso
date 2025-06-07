// Copyright 2025 chenterphai
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { generateAccessToken, generateRefreshToken } from '../../../lib/jwt.ts';
import { logger } from '../../../lib/winston.ts';
import config from '../../../config/index.ts';

import User from '../../../models/user.ts';
import Token from '../../../models/token.ts';

import type { Request, Response } from 'express';
import type { IUser } from '../../../models/user.ts';

type UserDate = Pick<IUser, 'email' | 'password'>;

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as UserDate;
    const user = await User.findOne({ email })
      .select('username email password role')
      .lean()
      .exec();

    if (!user) {
      res.status(404).json({
        status: {
          code: 1,
          status: 'Not Found',
          msg: 'User not found',
        },
      });
      return;
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await Token.create({ token: refreshToken, userId: user._id });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(201).json({
      status: {
        code: 0,
        status: 'success',
        msg: 'You have successfully logged in.',
      },
      content: {
        data: {
          username: user.username,
          email: user.email,
          role: user.role,
          accessToken: accessToken,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: {
        code: 1,
        status: 'Internal server error',
        msg: 'Internal Server Error',
      },
      error,
    });
    logger.error(`Error during user registration.`, error);
  }
};
export default login;
