/*
  Warnings:

  - You are about to drop the column `criadoEm` on the `colaborador` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `colaborador` table. All the data in the column will be lost.
  - You are about to drop the column `setor` on the `colaborador` table. All the data in the column will be lost.
  - Added the required column `senha` to the `Colaborador` table without a default value. This is not possible if the table is not empty.
  - Made the column `telefone` on table `colaborador` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cargo` on table `colaborador` required. This step will fail if there are existing NULL values in that column.
  - Made the column `permissaoId` on table `colaborador` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `colaborador` DROP FOREIGN KEY `Colaborador_permissaoId_fkey`;

-- DropIndex
DROP INDEX `Colaborador_cpf_key` ON `colaborador`;

-- DropIndex
DROP INDEX `Colaborador_permissaoId_fkey` ON `colaborador`;

-- AlterTable
ALTER TABLE `colaborador` DROP COLUMN `criadoEm`,
    DROP COLUMN `password`,
    DROP COLUMN `setor`,
    ADD COLUMN `senha` VARCHAR(191) NOT NULL,
    MODIFY `telefone` VARCHAR(191) NOT NULL,
    MODIFY `cargo` VARCHAR(191) NOT NULL,
    MODIFY `permissaoId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Colaborador` ADD CONSTRAINT `Colaborador_permissaoId_fkey` FOREIGN KEY (`permissaoId`) REFERENCES `Permissao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
