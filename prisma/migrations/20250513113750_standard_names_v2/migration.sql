-- AlterTable
ALTER TABLE `collaborator` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updated_at` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `companies` DROP COLUMN `createdAt`,
    DROP COLUMN `nomeFantasia`,
    DROP COLUMN `razaoSocial`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `nome_fantasia` VARCHAR(255) NOT NULL,
    ADD COLUMN `razao_social` VARCHAR(255) NULL,
    ADD COLUMN `updated_at` DATETIME(0) NOT NULL,
    MODIFY `cep` VARCHAR(8) NOT NULL;
