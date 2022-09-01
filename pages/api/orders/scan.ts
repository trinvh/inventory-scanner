// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { updateToDelivered, findByOrderId } from "../../../services/repositories/orderRepository"
import { Order } from '@prisma/client';
import moment from 'moment'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  let orderId
  if (req.method === 'POST') {
    orderId = req.body.id
  } else if (req.method === 'GET') {
    orderId = req.query.id
  }
  if (!orderId) {
    return res.status(404).json({ 
      success: false,
      code: 'not_found',
      message: 'Không tìm thấy đơn hàng'
    })
  }
  const result = await findByOrderId(orderId)
  if (!result) {
    return res.status(404).json({ 
      success: false,
      code: 'not_found',
      message: 'Không tìm thấy đơn hàng'
    })
  }
  if(result.deliveryTime) {
    return res.status(400).json({ 
      success: false,
      code: 'delivered',
      message: 'Đơn hàng đã quét và đã giao cho vận chuyển'
    })
  }

  const order = await updateToDelivered(result.id)

  return res.json(order)
}
