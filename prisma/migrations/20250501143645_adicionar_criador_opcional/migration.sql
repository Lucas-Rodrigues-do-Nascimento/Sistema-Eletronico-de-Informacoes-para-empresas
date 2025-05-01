-- AlterTable
ALTER TABLE `processo` ADD COLUMN `criadorId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Processo` ADD CONSTRAINT `Processo_criadorId_fkey` FOREIGN KEY (`criadorId`) REFERENCES `Colaborador`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
