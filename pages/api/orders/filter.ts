// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { findAll } from "../../../services/repositories/orderRepository"
import { Order } from '@prisma/client';
import moment from 'moment'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { marketplace, dateRange, deliveryType } = req.body

  const orders = await findAll(marketplace, deliveryType, dateRange)

  return res.json({
    orders: orders
  })
}
