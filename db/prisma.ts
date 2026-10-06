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

        cart: {
            itemsPrice: {
                needs: { itemsPrice: true },
                compute(cart) {
                    return cart.itemsPrice.toString()
                }
            },
            shippingPrice: {
                needs: { shippingPrice: true },
                compute(cart) {
                    return cart.shippingPrice.toString()
                }
            },
            taxPrice: {
                needs: { taxPrice: true },
                compute(cart) {
                    return cart.taxPrice.toString()
                }
            },
            totalPrice: {
                needs: { totalPrice: true },
                compute(cart) {
                    return cart.totalPrice.toString()
                }
            }
        },

        order: {
            itemsPrice: {
                needs: { itemsPrice: true },
                compute(cart) {
                    return cart.itemsPrice.toString()
                }
            },
            shippingPrice: {
                needs: { shippingPrice: true },
                compute(cart) {
                    return cart.shippingPrice.toString()
                }
            },
            taxPrice: {
                needs: { taxPrice: true },
                compute(cart) {
                    return cart.taxPrice.toString()
                }
            },
            totalPrice: {
                needs: { totalPrice: true },
                compute(cart) {
                    return cart.totalPrice.toString()
                }
            }
        },

        orderItem: {
            price: {
                compute(cart) {
                    return cart.price.toString()
                }
            }
        }
    },
});