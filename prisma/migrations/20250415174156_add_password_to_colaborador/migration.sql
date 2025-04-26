/*
  Warnings:

  - You are about to drop the column `senha` on the `colaborador` table. All the data in the column will be lost.
  - Added the required column `password` to the `Colaborador` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `colaborador` DROP COLUMN `senha`,
    ADD COLUMN `password` VARCHAR(191) NOT NULL;
