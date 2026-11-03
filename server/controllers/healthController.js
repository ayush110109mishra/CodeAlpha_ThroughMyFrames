import mongoose from 'mongoose';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * ==============================================================================
 * Health Controller
 * ==============================================================================
 * WHY THIS FILE EXISTS:
 * Used for deployment health-checks (Railway, Render, AWS, Docker), monitoring
 * systems, and developer sanity testing to confirm the API and database are online.
 */

export const getHealth = async (req, res) => {
  const mongoStates = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  const status = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: {
      status: mongoStates[mongoose.connection.readyState] || 'Unknown',
      connected: mongoose.connection.readyState === 1,
      name: mongoose.connection.name || 'N/A',
    },
    environment: process.env.NODE_ENV || 'development',
  };

  return sendSuccess(res, status, 'Through My Frames 2.0 API is running smoothly');
};
