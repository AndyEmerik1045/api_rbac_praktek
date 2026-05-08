import "dotenv/config";

export const env = {
  PORT: process.env.PORT || "4000",
  NODE_ENV: process.env.NODE_ENV || "development",
  DB_URL: process.env.DB_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS || "10"),
};
