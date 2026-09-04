/*
  Warnings:

  - Added the required column `password_hash` to the `usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "usuario" ADD COLUMN "password_hash" TEXT NOT NULL DEFAULT '';

-- Remove default after migration is done
ALTER TABLE "usuario" ALTER COLUMN "password_hash" DROP DEFAULT;

