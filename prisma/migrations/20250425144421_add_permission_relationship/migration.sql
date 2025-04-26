/*
  Warnings:

  - You are about to drop the column `permissaoId` on the `colaborador` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `colaborador` DROP FOREIGN KEY `Colaborador_permissaoId_fkey`;

-- DropIndex
DROP INDEX `Colaborador_permissaoId_fkey` ON `colaborador`;

-- AlterTable
ALTER TABLE `colaborador` DROP COLUMN `permissaoId`;

-- CreateTable
CREATE TABLE `_ColaboradorPermissoes` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ColaboradorPermissoes_AB_unique`(`A`, `B`),
    INDEX `_ColaboradorPermissoes_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ColaboradorPermissoes` ADD CONSTRAINT `_ColaboradorPermissoes_A_fkey` FOREIGN KEY (`A`) REFERENCES `Colaborador`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ColaboradorPermissoes` ADD CONSTRAINT `_ColaboradorPermissoes_B_fkey` FOREIGN KEY (`B`) REFERENCES `Permissao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
