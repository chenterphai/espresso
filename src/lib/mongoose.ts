// Copyright 2025 chen
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

import mongoose from 'mongoose';

import config from '@/config';

import type { ConnectOptions } from 'mongoose';

// Create CLient
const clientOptions: ConnectOptions = {
  dbName: 'espresso',
  appName: 'Espresso',
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
};

// Establishes a connection to the MongoDB database using Mongoose.

export const connectToDatabase = async (): Promise<void> => {
  if (!config.MONGODB_URI) {
    throw new Error(`MongoDB URI is not defined in the configuration.`);
  }
  try {
    await mongoose.connect(config.MONGODB_URI, clientOptions);
    console.log('Connected to database successfully');
  } catch (error) {
    console.log(`Connect to database unsuccessfully.`, error);
  }
};
