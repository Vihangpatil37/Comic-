// prisma singleton - prevents multiple clients in dev hot reload
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;

