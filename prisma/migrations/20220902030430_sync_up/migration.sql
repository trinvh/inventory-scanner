-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "deliveryTime" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Order_shippingSupplier_idx" ON "Order"("shippingSupplier");
