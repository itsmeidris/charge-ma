const env = {
  appName: import.meta.env.VITE_APP_NAME || 'find-ev-charge',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
};

export default env;
