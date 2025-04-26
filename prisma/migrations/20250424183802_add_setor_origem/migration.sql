/*
  Warnings:

  - A unique constraint covering the columns `[numero]` on the table `Processo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `setorOrigemId` to the `Processo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `processo` ADD COLUMN `setorOrigemId` INTEGER NOT NULL,
    MODIFY `numero` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Processo_numero_key` ON `Processo`(`numero`);

-- AddForeignKey
ALTER TABLE `Processo` ADD CONSTRAINT `Processo_setorOrigemId_fkey` FOREIGN KEY (`setorOrigemId`) REFERENCES `Setor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
