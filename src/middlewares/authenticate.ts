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

import { verifyAccessToken } from '../lib/jwt.ts';
import { logger } from '../lib/winston.ts';

// Types
import type { Request, Response, NextFunction } from 'express';
import type { Types } from 'mongoose';

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      status: {
        code: 1,
        status: 'Unauthorized',
        msg: 'Access denied, no token provided',
      },
    });
    return;
  }

  const [_, token] = authHeader.split(' ');

  if (!token) {
    res.status(401).json({
      status: {
        code: 1,
        status: 'Unauthorized',
        msg: 'Access denied, token malformed',
      },
    });
    return;
  }

  try {
    const jwtPayload = verifyAccessToken(token) as { userId: Types.ObjectId };

    // logger.info(`JWT PAYLOAD: ${JSON.stringify(jwtPayload, null, 2)}`);

    req.userId = jwtPayload.userId;

    return next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        status: {
          code: 1,
          status: 'Unauthorized',
          msg: 'Access token expired, request a new one with refresh token',
        },
      });
      return;
    }
    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        status: {
          code: 1,
          status: 'Unauthorized',
          msg: 'Access token invalid.',
        },
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

export default authenticate;
