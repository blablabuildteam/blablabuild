/**
 * Jest setup file
 * Runs before all tests
 */

// Load environment variables from .env.local
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Set test environment variables
process.env.NODE_ENV = 'test';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock console to reduce noise during tests (but keep error)
const originalConsole = { ...console };
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: originalConsole.error, // Keep error for debugging
};

// Global test utilities
declare global {
  function sleep(ms: number): Promise<void>;
}

global.sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
