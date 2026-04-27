const env = {
  appName: import.meta.env.VITE_APP_NAME || 'charge-ma',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
};

export default env;
