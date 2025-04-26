/*
  Warnings:

  - You are about to drop the column `observacoes` on the `processo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `documento` ADD COLUMN `arquivoFisico` VARCHAR(191) NULL,
    ALTER COLUMN `arquivo` DROP DEFAULT;

-- AlterTable
ALTER TABLE `processo` DROP COLUMN `observacoes`,
    MODIFY `especificacao` VARCHAR(191) NULL;
