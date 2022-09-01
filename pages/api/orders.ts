// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { save, paginate } from "../../services/repositories/orderRepository"
import { Order } from '@prisma/client';
import moment from 'moment'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === 'POST') {
    const { orders } = req.body;
    for(const order of orders) {
      try {
        order.deliveryDueDate = moment(order.deliveryDueDate).toDate()
        await save(order)
      } catch {}
    }
    
    return res.json(orders)
  } else if (req.method === 'GET') {
    const { page, limit, type } = req.query
    const result = await paginate(page ? Number(page) : 1, limit ? Number(limit) : 20, String(type))
    return res.json(result)
  }

  return res.json({ success: true })
}
