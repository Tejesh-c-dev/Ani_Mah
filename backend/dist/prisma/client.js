"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Singleton Prisma client instance — reused across the app
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.default = prisma;
//# sourceMappingURL=client.js.map