-- CreateTable
CREATE TABLE `Processo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` VARCHAR(191) NOT NULL,
    `especificacao` VARCHAR(191) NOT NULL,
    `interessado` VARCHAR(191) NOT NULL,
    `observacoes` VARCHAR(191) NULL,
    `acesso` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
