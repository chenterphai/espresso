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

// Node Modules
import { Router } from 'express';
import { param, query, body } from 'express-validator';

// Middleware
import authenticate from '../../middlewares/authenticate.ts';
import validationError from '../../middlewares/validation-error.ts';
import authorize from '../../middlewares/authorize.ts';

// Controllers
import getCurrentUser from '../../controllers/v1/user/get-current-user.ts';
import updateCuurrentUser from '../../controllers/v1/user/update-current-user.ts';
import deleteCurrentUser from '../../controllers/v1/user/delete-current-user.ts';

// Models
import User from '../../models/user.ts';

const router = Router();

router.get('/me', authenticate, authorize(['admin', 'user']), getCurrentUser);

router.put(
  '/me',
  authenticate,
  authorize(['admin', 'user']),
  body('username')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Username must be less than 20 chars.')
    .custom(async (value) => {
      const userExists = await User.findOne({ username: value });
      if (userExists) {
        throw new Error(`Username is already taken.`);
      }
    }),
  body('email')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Email must be less than 50 chars.')
    .isEmail()
    .withMessage('Invalid email address.')
    .custom(async (value) => {
      const userExists = await User.findOne({ email: value });
      if (userExists) {
        throw new Error(`Email is already taken.`);
      }
    }),
  validationError,
  updateCuurrentUser,
);

router.delete(
  '/me',
  authenticate,
  authorize(['admin', 'user']),
  deleteCurrentUser,
);

export default router;
