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

// Node modules

// Custom modules
import config from '../../../config/index.ts';
import { logger } from '../../../lib/winston.ts';

// Models
import Token from '../../../models/token.ts';

// Types
import type { Request, Response } from 'express';

const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken as string;
    if (refreshToken) {
      await Token.deleteOne({ token: refreshToken });
      logger.info('User refresh token deleted successfully.');
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.sendStatus(204);
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
export default logout;
