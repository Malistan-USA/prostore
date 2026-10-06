'use server';

import { auth, signIn, signOut } from '@/auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

import {
    shippingAddressSchema,
    signInFormSchema,
    signUpFormSchema,
    paymentMethodSchema,
    updateUserSchema
} from '../validators';
import { hashSync } from 'bcryptjs';
import { prisma } from '@/db/prisma';
import { formatError } from '../utils';
import { ShippingAddress } from '@/types';
import z from 'zod';
import { PAGE_SIZE } from '../constants';
import { revalidatePath } from 'next/cache';

const signInWithCredentials = async (
    _prevState: unknown,
    formData: FormData
) => {
    console.log("🔥 signInWithCredentials called");

    try {
        const credentials = signInFormSchema.parse({
            email: formData.get("email"),
            password: formData.get("password"),
        });

        console.log("🔥 Parsed credentials:", credentials);

        await signIn("credentials", credentials);

        return {
            success: true,
            message: "Signed in successfully",
        };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }

        console.error("Sign in error:", error);

        return {
            success: false,
            message: 'Invalid email or password',
        };
    }
};

const signOutUser = async () => {
    await signOut();
};


const signUpUser = async (prevState: unknown, formData: FormData) => {
    try {
        const user = signUpFormSchema.parse({
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
        });

        const plainPassword = user.password;

        user.password = hashSync(user.password, 10);

        await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: user.password,
            }
        });

        await signIn('credentials', {
            email: user.email,
            password: plainPassword
        });


        return { success: true, message: 'User Registered Successfully' }


    } catch (error) {
        if (isRedirectError(error)) {
            throw error
        }

        return { success: false, message: formatError(error) }
    }
}


async function getUserById(userId: string) {
    const user = await prisma.user.findFirst({
        where: { id: userId }
    });

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}



async function updateUserAddress(data: ShippingAddress) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            throw new Error('User is not authenticated');
        }

        const currentUser = await prisma.user.findFirst({
            where: {
                id: session.user.id,
            },
        });

        if (!currentUser) {
            throw new Error('User not found');
        }

        const address = shippingAddressSchema.parse(data);

        await prisma.user.update({
            where: { id: currentUser.id },
            data: { address }
        })

        return {
            success: true,
            message: 'Address updated successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: formatError(error),
        };
    }
}


async function updateUserPaymentMethod(data: z.infer<typeof paymentMethodSchema>) {
    try {
        const session = await auth();
        const currentUser = await prisma.user.findFirst({
            where: { id: session?.user?.id }
        });

        if (!currentUser) throw new Error('User not found');

        const paymentMethod = paymentMethodSchema.parse(data);

        await prisma.user.update({
            where: { id: currentUser.id },
            data: { paymentMethod: paymentMethod.type }
        });

        return {
            success: true,
            message: 'User Updated Successfully',
        }
    } catch (error) {

        return { success: false, message: formatError(error) }
    }
}

//Update the user profile

async function updateProfile(user: { name: string; email: string }) {
    try {

        const session = await auth();
        const currentUser = await prisma.user.findFirst({
            where: {
                id: session?.user?.id
            }
        });

        if (!currentUser) throw new Error('User not Found');

        await prisma.user.update({
            where: {
                id: currentUser.id
            },
            data: {
                name: user.name
            }
        });

        return {
            success: true,
            message: 'User Updated Successfully'
        }

    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}


//Get all the users
async function getAllUsers({
    limit = PAGE_SIZE,
    page,
}: { limit?: number; page: number }) {
    const data = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
    });

    const dataCount = await prisma.user.count();

    return {
        data,
        totalPages: Math.ceil(dataCount / limit)
    }
}

//Delete a user
async function deleteUser(id: string) {
    try {
        await prisma.user.delete({ where: { id } });
        revalidatePath('/admin/users');

        return {
            success: true,
            message: 'User deleted successfully'
        }
    } catch (error) {
        return {
            success: false,
            message: formatError(error)
        }
    }
}

//Update a user
async function updateUser(user: z.infer<typeof updateUserSchema>) {
    try {

        await prisma.user.update({
            where: { id: user.id },
            data: {
                name: user.name,
                role: user.role
            }
        });

        revalidatePath('/admin/users');

        return {
            success: true,
            message: 'User updated successfully'
        }

    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

export {

    signInWithCredentials,
    signOutUser,
    signUpUser,
    getUserById,
    updateUserAddress,
    updateUserPaymentMethod,
    updateProfile,
    getAllUsers,
    deleteUser,
    updateUser
};