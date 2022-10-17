import { Order } from '@prisma/client';
import _ from 'lodash';
import moment from 'moment';
import { prisma } from '../db';

export const save = async (order: Order) => {
    return await prisma.order.upsert({
        where: {
            orderId: order.orderId,
        },
        update: order,
        create: order,
    });
};

export const batchSave = async (orders: Order[]) => {
    const orderIds = orders.map((o) => o.orderId);
    const orderNumbers = orders.map((o) => o.orderNumber);
    const orderIdsExist = await prisma.order.findMany({
        where: {
            orderId: {
                in: orderIds,
            },
        },
    });
    if (orderIdsExist.length > 0) {
        throw new Error(
            `Import thất bại. Mã đơn hàng trùng: ${orderIdsExist
                .map((x) => x.orderId)
                .join(', ')}`
        );
    }

    const orderNumbersExist = await prisma.order.findMany({
        where: {
            orderNumber: {
                in: orderNumbers,
            },
        },
    });
    if (orderNumbersExist.length > 0) {
        throw new Error(
            `Import thất bại. Mã đơn hàng trùng: ${orderNumbersExist
                .map((x) => x.orderId)
                .join(', ')}`
        );
    }

    let queries = [];
    for (const order of orders) {
        const query = prisma.order.create({
            data: order,
        });
        queries.push(query);
    }

    await prisma.$transaction(queries);
};

export const paginate = async (
    page: number = 1,
    limit: number = 20,
    type?: string
) => {
    const whereClause = {
        ...(type === 'pending' ? { deliveryTime: null } : {}),
        ...(type === 'delivered' ? { NOT: [{ deliveryTime: null }] } : {}),
        ...(type === 'cancelled' ? { status: 'Đã hủy' } : {}),
    };
    const total = await prisma.order.count({
        where: whereClause,
    });
    const result = await prisma.order.findMany({
        skip: page * limit - limit,
        take: limit,
        where: whereClause,
        orderBy: {
            updatedAt: 'desc',
        },
    });
    return {
        pagination: {
            total: total,
            page: page,
            limit: limit,
        },
        items: result,
    };
};

export const findByOrderId = async (orderId: string) => {
    const order = await prisma.order.findFirst({
        where: {
            OR: [
                {
                    orderId: orderId,
                },
                {
                    orderNumber: orderId,
                },
            ],
        },
    });
    return order;
};

export const updateToDelivered = async (id: string) => {
    const order = await prisma.order.update({
        where: { id: id },
        data: {
            deliveryTime: new Date(),
            status: 'Đã giao cho vận chuyển',
        },
    });
    return order;
};

export const findAll = async (
    marketplace: string,
    shippingSupplier: string,
    deliveryType: string,
    dateRange: string[]
) => {
    let from = dateRange[0]
        ? moment(dateRange[0]).toDate()
        : moment().subtract(5, 'years').toDate();
    let to = dateRange[1]
        ? moment(dateRange[1]).toDate()
        : moment().add(5, 'years').toDate();

    const orders = await prisma.order.findMany({
        where: {
            ...(marketplace && marketplace !== 'all' ? { marketplace } : {}),
            ...(shippingSupplier && shippingSupplier !== 'all'
                ? { shippingSupplier }
                : {}),
            ...(deliveryType === 'pending' ? { deliveryTime: null } : {}),
            ...(deliveryType === 'done'
                ? { NOT: [{ deliveryTime: null }] }
                : {}),
            createdAt: {
                lte: to,
                gte: from,
            },
        },
    });
    return orders;
};

export const statistics = async () => {
    return {
        total: await prisma.order.count(),
        pending: await prisma.order.count({
            where: {
                deliveryTime: null,
            },
        }),
        delivered: await prisma.order.count({
            where: {
                NOT: {
                    deliveryTime: null,
                },
            },
        }),
        cancelled: await prisma.order.count({
            where: {
                status: 'Đã hủy',
            },
        }),
    };
};

export const cancel = async (id: string) => {
    const order = await prisma.order.update({
        where: { id: id },
        data: {
            status: 'Đã hủy',
        },
    });
    return order;
};
