'use server';

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { CartItem, PaymentResult } from "@/types";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";


type SalesDataType = {
    month: string;
    totalSales: number
}[]


export async function createOrder() {

    try {

        const session = await auth();
        if (!session) throw new Error('User is not authenticated');

        const cart = await getMyCart();
        const userId = session?.user?.id;
        if (!userId) throw new Error('User not found');

        const user = await getUserById(userId);

        if (!cart || cart.items.length === 0) {
            return { success: false, message: 'Your cart is empty', redirecTo: '/cart' }
        }

        if (!user.address) {
            return { success: false, message: 'No shipping address', redirecTo: '/shipping-address' }
        }

        if (!user.paymentMethod) {
            return { success: false, message: 'No payment method', redirecTo: '/payment-method' }
        }


        const order = insertOrderSchema.parse({
            userId: user.id,
            shippingAddress: user.address,
            paymentMethod: user.paymentMethod,
            itemsPrice: cart.itemsPrice,
            shippingPrice: cart.shippingPrice,
            taxPrice: cart.taxPrice,
            totalPrice: cart.totalPrice,
        });

        const insertedOrderId = await prisma.$transaction(async (tx) => {
            const insertedOrder = await tx.order.create({ data: order });
            for (const item of cart.items as CartItem[]) {
                await tx.orderItem.create({
                    data: {
                        ...item,
                        price: item.price,
                        orderId: insertedOrder.id
                    }
                })
            }

            await tx.cart.update({
                where: { id: cart.id },
                data: {
                    items: [],
                    totalPrice: 0,
                    taxPrice: 0,
                    shippingPrice: 0,
                    itemsPrice: 0
                }
            })

            return insertedOrder.id
        });


        if (!insertedOrderId) throw new Error('Order not created');


        return { success: true, message: 'Order created', redirectTo: `/order/${insertedOrderId}` }

    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { success: false, message: formatError(error) }
    }
}


// Get Order by Id
export async function getOrderById(orderId: string) {
    const data = await prisma.order.findFirst({
        where: {
            id: orderId,
        },
        include: {
            orderItems: true,
            user: { select: { name: true, email: true } },
        }
    });

    return convertToPlainObject(data)
}


//Create new paypal order
export async function createPayPalorder(orderId: string) {
    try {

        const order = await prisma.order.findFirst({
            where: {
                id: orderId
            }
        });
        if (order) {
            const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

            await prisma.order.update({
                where: { id: orderId },
                data: {
                    paymentResult: {
                        id: paypalOrder.id,
                        email_address: '',
                        status: '',
                        pricePaid: 0
                    }
                }
            });

            return {
                success: true,
                message: 'Order created with paypal successfully',
                data: paypalOrder.id
            }

        } else {
            throw new Error('Order not found')
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

//Approve paypal order and update order to paid
export async function approvePayPalOrder(
    orderId: string,
    data: { orderID: string }
) {
    try {

        const order = await prisma.order.findFirst({
            where: {
                id: orderId
            }
        });

        if (!order) throw new Error('Order not found');

        const captureData = await paypal.capturePayment(data.orderID);

        if (!captureData || captureData.id !== (order.paymentResult as PaymentResult)?.id || captureData.status !== 'COMPLETED') {
            throw new Error('Error in PayPal payment')
        }

        //update order to paid
        await updateOrderToPaid({
            orderId,
            paymentResult: {
                id: captureData.id,
                status: captureData.status,
                email_address: captureData.payer.email_address,
                pricePaid: captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
            }
        })

        revalidatePath(`/order/${orderId}`);

        return {
            success: true,
            message: 'Your order has been paid'
        }

    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}


//Update order to paid
async function updateOrderToPaid({
    orderId,
    paymentResult
}: {
    orderId: string;
    paymentResult?: PaymentResult
}) {

    const order = await prisma.order.findFirst({
        where: {
            id: orderId
        },
        include: {
            orderItems: true
        }
    });

    if (!order) throw new Error('Order not found');

    await prisma.$transaction(async (tx) => {
        for (const item of order.orderItems) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.qty } }
            })
        }

        //Set the order to paid

        await tx.order.update({
            where: { id: orderId },
            data: {
                isPaid: true,
                paidAt: new Date(),
                paymentResult,
            }
        })
    });

    //Get updated order after transaction
    const updatedOrder = await prisma.order.findFirst({
        where: { id: orderId },
        include: {
            orderItems: true,
            user: { select: { name: true, email: true } }
        }
    });

    if (!updatedOrder) throw new Error('Order not found')
}

// Get user's orders
export async function getMyOrders({
    limit = PAGE_SIZE,
    page,
}: {
    limit?: number;
    page: number;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("User is not authenticated");
    }

    const userId = session.user.id;

    const data = await prisma.order.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: limit,
        skip: (page - 1) * limit,
    });

    const dataCount = await prisma.order.count({
        where: {
            userId,
        },
    });

    return {
        data,
        totalPages: Math.ceil(dataCount / limit)
    };
}




// Get sales data and order summary
export async function getOrderSummary() {
    //Get counts for each resource

    const ordersCount = await prisma.order.count();
    const productsCount = await prisma.product.count();
    const usersCount = await prisma.user.count();


    //Calculate the total sales

    const totalSales = await prisma.order.aggregate({
        _sum: { totalPrice: true }
    })

    //Get monthly sales

    const salesDataRaw = await prisma.$queryRaw<
        Array<{ month: string; totalSales: Prisma.Decimal }>
    >`
  SELECT
    to_char("createdAt", 'MM/YY') AS "month",
    SUM("totalPrice") AS "totalSales"
  FROM "Order"
  GROUP BY to_char("createdAt", 'MM/YY')
`;


    const salesData: SalesDataType = salesDataRaw.map((entry) => ({
        month: entry.month,
        totalSales: Number(entry.totalSales)
    }));


    //Get latest Sales

    const latestSales = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true } }
        },

        take: 6,
    });

    return {
        ordersCount,
        productsCount,
        usersCount,
        totalSales,
        latestSales,
        salesData
    }
}

//Get All orders
export async function getAllOrders({
    limit = PAGE_SIZE,
    page,
    query
}: {
    limit?: number;
    page: number;
    query: string
}) {

    const queryFilter: Prisma.OrderWhereInput = query && query !== 'all' ? {
        user: {
            name: {
                contains: query,
                mode: 'insensitive'
            } as Prisma.StringFilter
        }
    } : {}

    const data = await prisma.order.findMany({
        where: {
            ...queryFilter
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
        include: { user: { select: { name: true } } }
    });

    const dataCount = await prisma.order.count();

    return {
        data,
        totalPages: Math.ceil(dataCount / limit)
    }
}

//Delete an order
export async function deleteOrder(id: string) {
    try {

        await prisma.order.delete({ where: { id } });

        revalidatePath('/admin/orders');


        return {
            success: true,
            message: 'Order Delted Successfully'
        }

    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

//Update COD order to paid
export async function updateOrderToPaidCOD(orderId: string) {
    try {

        await updateOrderToPaid({ orderId });

        revalidatePath(`/order/${orderId}`);

    } catch (error) {

        return { success: false, message: formatError(error) }
    }
}

// Update COD order to delivered
export async function deliverOrder(orderId: string) {
    try {

        const order = await prisma.order.findFirst({
            where: {
                id: orderId
            }
        });

        if (!order) throw new Error('Order not found');
        if (!order.isPaid) throw new Error('Order is not paid')

        await prisma.order.update({
            where: { id: orderId },
            data: {
                isDelivered: true,
                deliveredAt: new Date()
            }
        });


        revalidatePath(`/order/${orderId}`);

        return {
            success: true,
            message: 'Order has been marked delivered'
        }

    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}