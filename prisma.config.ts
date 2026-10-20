import dotenv from 'dotenv';
import path from 'path';

// Charge explicitement le fichier .env situé à la racine du projet
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export default {
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
};