// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { statistics } from "../../../services/repositories/orderRepository"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const result = await statistics()

  return res.json(result)
}
