/*
  Warnings:

  - You are about to drop the column `dataMovimentacao` on the `movimentacao` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `movimentacao` DROP COLUMN `dataMovimentacao`,
    ADD COLUMN `ativo` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
