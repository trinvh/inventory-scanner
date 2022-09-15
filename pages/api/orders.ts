// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { save, batchSave, paginate } from "../../services/repositories/orderRepository"
import { Order } from '@prisma/client';
import moment from 'moment-timezone'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === 'POST') {
    const { orders } = req.body;

    try {
      const formattedInput = orders.map((order: Order) => ({
        ...order,
        deliveryDueDate: moment(order.deliveryDueDate, 'YYYY-MM-DD HH:mm').tz('Asia/Ho_Chi_Minh').toDate()
      }))
    
      await batchSave(formattedInput)
    
      return res.json(orders)
      
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message
      })
    }
  } else if (req.method === 'GET') {
    const { page, limit, type } = req.query
    const result = await paginate(page ? Number(page) : 1, limit ? Number(limit) : 20, String(type))
    return res.json(result)
  }

  return res.json({ success: true })
}
