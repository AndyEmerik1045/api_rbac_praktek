import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';


const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient();

async function test() {
  const users = await prisma.user.findMany();
  console.log(users);
}

test();