import { Resend } from 'resend';
import { APP_NAME, SENDER_EMAIL } from '@/lib/constants';
import { Order } from '@/types';
import PurchaseReceiptEmail from './purchase-receipt';

export const sendPurchaseReceipt = async ({ order }: { order: Order }) => {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        throw new Error('RESEND_API_KEY is not configured');
    }

    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
        from: `${APP_NAME} <${SENDER_EMAIL}>`,
        to: order.user.email,
        subject: `Order Confirmation ${order.id}`,
        react: <PurchaseReceiptEmail order={order} />,
    });

    if (error) {
        throw new Error(`Failed to send receipt email: ${error.message}`);
    }
};