// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { save, paginate } from "../../services/repositories/orderRepository"
import { Order } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === 'POST') {
    const orders: Order[] = req.body;
    for(const order of orders) {
      await save(order)
    }
    
    return res.json(orders)
  } else if (req.method === 'GET') {
    return await paginate(1, 20)
  }
}
