import dotenv from 'dotenv';
dotenv.config();

/**
 * Ensures that the specified environment variable is present.
 * @param key - The name of the environment variable.
 * @returns The value of the environment variable.
 * @throws Error if the environment variable is not set.
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable "${key}" is required but was not found.`);
  }
  return value;
}

// Example usage with your configuration
export const envConfig = {
  appPort: parseInt(requireEnv('APP_PORT')),
  nodeEnv: requireEnv('NODE_ENV'),
  app:{
    frontendUrl: requireEnv('FRONTEND_URL'),
    backendUrl: requireEnv('BACKEND_URL'),
    serviceName: requireEnv('SERVICE_NAME'),
    cookieDomain: requireEnv('COOKIE_DOMAIN'),
  },
  database: {
    url: requireEnv('DATABASE_URL'),
    user: requireEnv('POSTGRES_USER'),
    password: requireEnv('POSTGRES_PASSWORD'),
    dbName: requireEnv('POSTGRES_DB'),
    port: parseInt(requireEnv('POSTGRES_PORT')),
  },
  redis: {
    port: parseInt(requireEnv('REDIS_PORT')),
    password: requireEnv('REDIS_PASSWORD'),
    host: requireEnv('REDIS_HOST')
  },
  pgAdmin: {
    email: requireEnv('PGADMIN_DEFAULT_EMAIL'),
    password: requireEnv('PGADMIN_DEFAULT_PASSWORD'),
    port: parseInt(requireEnv('PGADMIN_PORT')),
  },
  openIdApi: requireEnv('OPENID_API'),
  prodBackEndUrl: requireEnv('PROD_BACKEND_URL'),
};
