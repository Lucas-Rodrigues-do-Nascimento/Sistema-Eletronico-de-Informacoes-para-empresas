-- AlterTable
ALTER TABLE `documento` ADD COLUMN `conteudo` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Movimentacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processoId` INTEGER NOT NULL,
    `deSetor` VARCHAR(191) NOT NULL,
    `paraSetor` VARCHAR(191) NOT NULL,
    `observacoes` VARCHAR(191) NULL,
    `dataMovimentacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Movimentacao` ADD CONSTRAINT `Movimentacao_processoId_fkey` FOREIGN KEY (`processoId`) REFERENCES `Processo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
