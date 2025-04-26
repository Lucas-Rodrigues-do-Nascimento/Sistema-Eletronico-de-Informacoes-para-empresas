/*
  Warnings:

  - You are about to alter the column `deSetor` on the `movimentacao` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `paraSetor` on the `movimentacao` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `movimentacao` MODIFY `deSetor` INTEGER NOT NULL,
    MODIFY `paraSetor` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Movimentacao` ADD CONSTRAINT `Movimentacao_deSetor_fkey` FOREIGN KEY (`deSetor`) REFERENCES `Setor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Movimentacao` ADD CONSTRAINT `Movimentacao_paraSetor_fkey` FOREIGN KEY (`paraSetor`) REFERENCES `Setor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
