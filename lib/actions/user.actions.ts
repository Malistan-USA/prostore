'use server';

import { signIn, signOut } from '@/auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

import { signInFormSchema } from '../validators';

const signInWithCredentials = async (
    _prevState: unknown,
    formData: FormData
) => {
    try {
        const credentials = signInFormSchema.parse({
            email: formData.get('email'),
            password: formData.get('password'),
        });

        await signIn('credentials', credentials);

        return {
            success: true,
            message: 'Signed in successfully',
        };
    } catch (error) {
        if (isRedirectError(error)) throw error;

        return {
            success: false,
            message: 'Invalid email or password',
        };
    }
};

const signOutUser = async () => {
    await signOut();
};

export { signInWithCredentials, signOutUser };