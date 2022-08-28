import { PrismaClient, Order } from "@prisma/client"
import _ from "lodash"

const prisma = new PrismaClient()

export const save = async (order: Order) => {
  return await prisma.order.upsert({
    where: {
      orderId: order.orderId
    },
    update: order,
    create: order
  })
}

export const paginate = async (page: number = 1, limit: number = 20) => {
  const result = await prisma.order.findMany({
    skip: (page * limit) - page,
    take: limit,
    orderBy: {
      updatedAt: 'desc'
    }
  })
  return result
}