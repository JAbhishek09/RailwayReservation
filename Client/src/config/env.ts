/**
 * Application environment configuration.
 * Change API_BASE_URL to match your local IP address where Express server is running.
 */
export const ENV = {
  // Replace with your local machine's IP address (e.g. http://192.168.1.50:3000/api)
  // For Android Emulator, http://10.0.2.2:3000/api can also be used.
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://10.65.149.176:3000/api',
  
  // Seeded user ID for current lab version
  DEFAULT_USER_ID: 1,

  // Force offline mock mode for testing without a running backend server
  USE_MOCK_API: false,

  // Timeout in milliseconds for API requests
  API_TIMEOUT: 10000,
};

