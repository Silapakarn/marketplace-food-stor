-- CreateTable
CREATE TABLE "inventory_locks" (
    "id" SERIAL NOT NULL,
    "lock_key" VARCHAR(100) NOT NULL,
    "product_id" INTEGER NOT NULL,
    "customer_identifier" VARCHAR(255) NOT NULL,
    "acquired_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_locks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_locks_lock_key_key" ON "inventory_locks"("lock_key");

-- CreateIndex
CREATE INDEX "inventory_locks_product_id_idx" ON "inventory_locks"("product_id");

-- CreateIndex
CREATE INDEX "inventory_locks_expires_at_idx" ON "inventory_locks"("expires_at");
