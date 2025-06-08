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

// Custom Modules
import { logger } from '../lib/winston.ts';

// Models
import User from '../models/user.ts';

// Types
import type { Request, Response, NextFunction } from 'express';

export type AuthRole = 'admin' | 'user';

const authorize = (role: AuthRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    try {
      const user = await User.findById(userId).select('role').exec();

      if (!user) {
        res.status(404).json({
          status: {
            code: 1,
            status: 'Not found',
            msg: 'User not found',
          },
        });
        return;
      }
      if (!role.includes(user.role)) {
        res.status(403).json({
          status: {
            code: 1,
            status: 'Forbidden',
            msg: 'Access denied, insufficient permissions',
          },
        });
        return;
      }

      return next();
    } catch (error) {
      res.status(500).json({
        status: {
          code: 1,
          status: 'Internal server error',
          msg: 'Internal server error',
        },
      });

      logger.error(`Error while authorizing user: `, error);
    }
  };
};

export default authorize;
