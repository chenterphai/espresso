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

// Custom modules
import { logger } from '../../../lib/winston.ts';

// Models
import User from '../../../models/user.ts';

// Types
import type { Request, Response } from 'express';

const updateCuurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId;

  const {
    username,
    email,
    // password,
    firstname,
    lastname,
    website,
    facebook,
    instagram,
    linkedin,
    github,
    x,
    youtube,
  } = req.body;

  try {
    const user = await User.findById(userId).select('-__v').exec();

    if (!user) {
      res.status(404).json({
        status: {
          code: 1,
          status: 'Not found',
          msg: 'User not found!',
        },
      });
      return;
    }

    if (username) user.username = username;
    if (email) user.email = email;
    // if (password) user.password = password;
    if (firstname) user.firstname = firstname;
    if (lastname) user.lastname = lastname;
    if (!user.socialLinks) user.socialLinks = {};

    if (website) user.socialLinks.website = website;
    if (facebook) user.socialLinks.facebook = facebook;
    if (instagram) user.socialLinks.instagram = instagram;
    if (github) user.socialLinks.github = github;
    if (linkedin) user.socialLinks.linkedin = linkedin;
    if (x) user.socialLinks.x = x;
    if (youtube) user.socialLinks.youtube = youtube;

    await user.save();

    logger.info(`User successfully updated!`);

    res.status(200).json({
      status: {
        code: 0,
        status: 'OK',
        msg: 'User successfully updated!',
      },
      content: { data: user },
    });
  } catch (error) {
    res.status(500).json({
      status: {
        code: 1,
        status: 'Internal server error',
        msg: 'Internal server error',
      },
    });
    logger.error(`Error while updating current user: `, error);
  }
};

export default updateCuurrentUser;
