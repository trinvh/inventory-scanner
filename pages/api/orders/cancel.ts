// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { cancel } from '../../../services/repositories/orderRepository';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    const { orderId } = req.body;

    await cancel(orderId);

    return res.json({
        status: true,
    });
}
