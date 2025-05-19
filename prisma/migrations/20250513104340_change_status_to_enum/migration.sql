-- CreateTable
CREATE TABLE `companies` (
    `id_empresa` VARCHAR(36) NOT NULL,
    `nomeFantasia` VARCHAR(255) NOT NULL,
    `razaoSocial` VARCHAR(255) NOT NULL,
    `cnpj` VARCHAR(14) NOT NULL,
    `uf` VARCHAR(2) NULL,
    `cep` VARCHAR(191) NULL,
    `logradouro` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `telefone` VARCHAR(20) NULL,
    `status_empresa` ENUM('ATIVO', 'INATIVO') NOT NULL DEFAULT 'ATIVO',
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL,

    UNIQUE INDEX `companies_cnpj_key`(`cnpj`),
    PRIMARY KEY (`id_empresa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `collaborator` (
    `id_colaborador` VARCHAR(36) NOT NULL,
    `id_empresa` VARCHAR(36) NOT NULL,
    `nome_colaborador` VARCHAR(255) NOT NULL,
    `cpf` VARCHAR(11) NOT NULL,
    `status_colaborador` VARCHAR(50) NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL,

    UNIQUE INDEX `collaborator_cpf_key`(`cpf`),
    PRIMARY KEY (`id_colaborador`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `collaborator` ADD CONSTRAINT `collaborator_id_empresa_fkey` FOREIGN KEY (`id_empresa`) REFERENCES `companies`(`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE;
