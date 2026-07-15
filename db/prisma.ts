import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

// Enable WebSocket support for Neon in Node.js.
neonConfig.webSocketConstructor = ws;

// Create the Prisma Neon adapter.
const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
});

// Create the Prisma client and extend it with computed fields.
export const prisma = new PrismaClient({ adapter }).$extends({
    result: {
        product: {
            price: {
                compute(product) {
                    return product.price.toString();
                },
            },
            rating: {
                compute(product) {
                    return product.rating.toString();
                },
            },
        },
    },
});