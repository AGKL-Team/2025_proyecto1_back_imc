import * as Joi from 'joi';

export const configSchema = Joi.object({
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_KEY: Joi.string().required(),
  FRONTEND_URL: Joi.string().uri().required(),
  DATABASE_URL: Joi.string().uri().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  JWT_SECRET: Joi.string().required(),
});
