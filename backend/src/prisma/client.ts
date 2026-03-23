// Singleton Prisma client instance — reused across the app
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
