-- AlterTable
ALTER TABLE `colaborador` ADD COLUMN `setorId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Colaborador` ADD CONSTRAINT `Colaborador_setorId_fkey` FOREIGN KEY (`setorId`) REFERENCES `Setor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
