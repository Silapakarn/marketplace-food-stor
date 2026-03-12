/*
  Warnings:

  - Added the required column `currency_id` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "currency_id" INTEGER NOT NULL,
ADD COLUMN     "image_url" VARCHAR(255);

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
