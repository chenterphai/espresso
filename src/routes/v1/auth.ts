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

import { Router } from 'express';
import { body, cookie } from 'express-validator';
import bcrypt from 'bcrypt';

import register from '../../controllers/v1/auth/register.ts';
import login from '../../controllers/v1/auth/login.ts';
import authenticate from '../../middlewares/authenticate.ts';
import logout from '../../controllers/v1/auth/logout.ts';
import refreshToken from '../../controllers/v1/auth/refresh-token.ts';

import validationError from '../../middlewares/validation-error.ts';

import User from '../../models/user.ts';

const router = Router();

router.post(
  '/register',
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required!')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (value) => {
      const userExists = await User.exists({ email: value });
      if (userExists) {
        throw new Error('User already exists.');
      }
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 chars long.'),
  body('role')
    .optional()
    .isString()
    .withMessage('Role must be a string.')
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user.'),
  validationError,
  register,
);

router.post(
  '/login',
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required!')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (value) => {
      const userExists = await User.exists({ email: value });
      if (!userExists) {
        throw new Error('User email or password is invalid.');
      }
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 chars long.')
    .custom(async (value, { req }) => {
      const { email } = req.body as { email: string };
      const user = await User.findOne({ email })
        .select('password')
        .lean()
        .exec();

      if (!user) {
        throw new Error('User email or password is invalid!');
      }
      const passwordMatch = await bcrypt.compare(value, user.password);

      if (!passwordMatch) {
        throw new Error('Password is incorrect.');
      }
    }),
  validationError,
  login,
);

router.post(
  '/refresh-token',
  cookie('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required.')
    .isJWT()
    .withMessage('Invalid refresh token.'),
  refreshToken,
);

router.post('/logout', authenticate, logout);

export default router;
