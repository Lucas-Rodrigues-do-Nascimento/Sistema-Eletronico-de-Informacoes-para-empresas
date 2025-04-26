/*
  Warnings:

  - You are about to drop the column `endereco` on the `unidadeloja` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `unidadeloja` DROP COLUMN `endereco`,
    ADD COLUMN `cidade` VARCHAR(191) NULL,
    ADD COLUMN `descricao` VARCHAR(191) NULL,
    ADD COLUMN `tipo` VARCHAR(191) NULL,
    ADD COLUMN `uf` VARCHAR(191) NULL;
