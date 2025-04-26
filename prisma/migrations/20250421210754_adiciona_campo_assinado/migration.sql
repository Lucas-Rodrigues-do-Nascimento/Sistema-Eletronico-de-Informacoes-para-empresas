-- AlterTable
ALTER TABLE `documento` ADD COLUMN `assinadoEm` DATETIME(3) NULL,
    ADD COLUMN `assinadoPor` VARCHAR(191) NULL,
    MODIFY `arquivo` BOOLEAN NOT NULL DEFAULT false;
