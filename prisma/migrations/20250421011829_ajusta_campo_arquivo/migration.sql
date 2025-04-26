/*
  Warnings:

  - Made the column `arquivo` on table `documento` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `documento` MODIFY `arquivo` BOOLEAN NOT NULL DEFAULT false;
