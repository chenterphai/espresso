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

import jwt from 'jsonwebtoken';
const { JsonWebTokenError, TokenExpiredError } = jwt;

import { logger } from '../../../lib/winston.ts';
import { generateAccessToken, verifyRefreshToken } from '../../../lib/jwt.ts';

/**
 * MODELS
 */
import Token from '../../../models/token.ts';

/**
 * @import
 * Type
 */
import type { Request, Response } from 'express';
import { Types } from 'mongoose';

const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken as string;
  try {
    const tokenExists = await Token.exists({ token: token });

    if (!tokenExists) {
      res.status(401).json({
        code: 1,
        status: 'Unauthorized',
        msg: 'Invalid refresh token',
      });
      return;
    }

    // Verify

    const jwtPayload = verifyRefreshToken(token) as {
      userId: Types.ObjectId;
    };

    const accessToken = generateAccessToken(jwtPayload.userId);

    res.status(200).json({
      status: {
        code: 0,
        status: 'Success',
        msg: 'Refreshed token successfully.',
      },
      content: { accessToken },
    });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        status: {
          code: 1,
          status: 'Unauthorized',
          msg: 'Refresh token expired, please login again.',
        },
        content: {},
      });
      return;
    }

    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        status: {
          code: 1,
          status: 'Unauthorized',
          msg: 'Invalid refresh token.',
        },
        content: {},
      });
      return;
    }

    res.status(500).json({
      status: {
        code: 1,
        status: 'Internal server error',
        msg: 'Internal Server Error',
      },
      error,
    });
  }
};

export default refreshToken;
