/*
  Warnings:

  - Made the column `especificacao` on table `processo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `processo` MODIFY `especificacao` VARCHAR(191) NOT NULL;
