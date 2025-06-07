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

import { logger } from '../../../lib/winston.ts';
import config from '../../../config/index.ts';

import User from '../../../models/user.ts';
import Token from '../../../models/token.ts';

import type { Request, Response } from 'express';
import type { IUser } from '../../../models/user.ts';
import { genUsername } from '../../../utils/index.ts';
import { generateAccessToken, generateRefreshToken } from '../../../lib/jwt.ts';

type UserData = Pick<IUser, 'email' | 'password' | 'role'>;

const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, role } = req.body as UserData;

  if (role === 'admin' && !config.WHITELIST_ADMIN_MAIL.includes(email)) {
    res.status(403).json({
      status: {
        code: 1,
        status: 'Forbidden',
        msg: 'You cannot register as an admin',
      },
      content: {},
    });
    return;
  }

  try {
    const username = genUsername();

    const newUser = await User.create({
      username,
      email,
      password,
      role,
    });

    // Generate access token
    const accessToken = generateAccessToken(newUser._id);

    const refreshToken = generateRefreshToken(newUser._id);

    // Store refresh token
    await Token.create({ token: refreshToken, userId: newUser._id });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(201).json({
      status: {
        code: 0,
        status: 'success',
        msg: 'New user created!',
      },
      content: {
        data: {
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
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

export default register;
