/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `Permissao` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigo` to the `Permissao` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Permissao_nome_key` ON `permissao`;

-- AlterTable
ALTER TABLE `permissao` ADD COLUMN `codigo` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Permissao_codigo_key` ON `Permissao`(`codigo`);
