-- CreateTable
CREATE TABLE `ControleAcesso` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `processoId` INTEGER NOT NULL,
    `colaboradorId` INTEGER NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ControleAcesso` ADD CONSTRAINT `ControleAcesso_processoId_fkey` FOREIGN KEY (`processoId`) REFERENCES `Processo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControleAcesso` ADD CONSTRAINT `ControleAcesso_colaboradorId_fkey` FOREIGN KEY (`colaboradorId`) REFERENCES `Colaborador`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
