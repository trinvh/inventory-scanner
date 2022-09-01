import { Order } from "@prisma/client"
import _ from "lodash"
import moment from 'moment'
import { prisma } from '../db'

export const save = async (order: Order) => {
  return await prisma.order.upsert({
    where: {
      orderId: order.orderId
    },
    update: order,
    create: order
  })
}

export const paginate = async (page: number = 1, limit: number = 20, type?: string) => {
  const whereClause = {
    ...type === 'pending' ? { deliveryTime: null } : {},
    ...type === 'delivered' ? { NOT: [{deliveryTime: null}]} : {}
  }
  const total = await prisma.order.count({
    where: whereClause
  })
  const result = await prisma.order.findMany({
    skip: (page * limit) - limit,
    take: limit,
    where: whereClause,
    orderBy: {
      updatedAt: 'desc'
    }
  })
  return {
    pagination: {
      total: total,
      page: page,
      limit: limit
    },
    items: result
  }
}

export const findByOrderId = async (orderId: string) => {
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        {
          orderId: orderId
        },
        {
          orderNumber: orderId
        }
      ]
    }
  })
  return order
}

export const updateToDelivered = async (id: string) => {
  const order = await prisma.order.update({
    where: { id: id },
    data: {
      deliveryTime: new Date(),
      status: 'Đã giao cho vận chuyển'
    }
  })
  return order
}

export const findAll = async (marketplace: string, deliveryType: string, dateRange: string[]) => {
  let from = dateRange[0] ? moment(dateRange[0]).toDate() : moment().subtract(5, 'years').toDate()
  let to = dateRange[1] ? moment(dateRange[1]).toDate() : moment().add(5, 'years').toDate()

  const orders = await prisma.order.findMany({
    where: {
      ...marketplace && marketplace !== 'all' ? { marketplace } : {},
      ...deliveryType === 'pending' ? { deliveryTime: null } : {},
      ...deliveryType === 'done' ? { NOT: [{ deliveryTime: null }] } : {},
      createdAt: {
        lte: to,
        gte: from,
      },
    }
  })
  return orders
}