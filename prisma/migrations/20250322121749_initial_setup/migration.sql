-- CreateTable
CREATE TABLE `Sorteo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `presupuesto` DOUBLE NULL,
    `fechaLimite` DATETIME(3) NOT NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaSorteo` DATETIME(3) NULL,
    `estado` ENUM('PENDIENTE', 'COMPLETO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
    `creadorEmail` VARCHAR(191) NOT NULL,
    `creadorNombre` VARCHAR(191) NOT NULL,
    `tokenAdmin` VARCHAR(191) NOT NULL,
    `tokenResultados` VARCHAR(191) NULL,
    `fechaExpiracion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Sorteo_tokenAdmin_key`(`tokenAdmin`),
    UNIQUE INDEX `Sorteo_tokenResultados_key`(`tokenResultados`),
    INDEX `idx_creador_email`(`creadorEmail`),
    INDEX `idx_token_admin`(`tokenAdmin`),
    INDEX `idx_token_resultados`(`tokenResultados`),
    INDEX `idx_fecha_expiracion`(`fechaExpiracion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Participante` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `sorteoId` INTEGER NOT NULL,
    `fechaRegistro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` ENUM('PENDIENTE', 'CONFIRMADO', 'RECHAZADO') NOT NULL DEFAULT 'PENDIENTE',

    UNIQUE INDEX `Participante_token_key`(`token`),
    INDEX `idx_participante_token`(`token`),
    INDEX `idx_participante_sorteo`(`sorteoId`),
    UNIQUE INDEX `Participante_email_sorteoId_key`(`email`, `sorteoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Exclusion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `participanteDeId` INTEGER NOT NULL,
    `participanteAId` INTEGER NOT NULL,
    `sorteoId` INTEGER NOT NULL,

    INDEX `idx_exclusion_sorteo`(`sorteoId`),
    UNIQUE INDEX `Exclusion_participanteDeId_participanteAId_key`(`participanteDeId`, `participanteAId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Asignacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `participanteDeId` INTEGER NOT NULL,
    `participanteAId` INTEGER NOT NULL,
    `sorteoId` INTEGER NOT NULL,
    `asignacionEncriptada` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Asignacion_participanteDeId_key`(`participanteDeId`),
    UNIQUE INDEX `Asignacion_participanteAId_key`(`participanteAId`),
    INDEX `idx_asignacion_sorteo`(`sorteoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Deseo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `url` VARCHAR(191) NULL,
    `precioEstimado` DOUBLE NULL,
    `imagen` VARCHAR(191) NULL,
    `amazonId` VARCHAR(191) NULL,
    `amazonAfiliado` VARCHAR(191) NULL,
    `participanteId` INTEGER NOT NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `prioridad` INTEGER NOT NULL DEFAULT 0,

    INDEX `idx_deseo_participante`(`participanteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Participante` ADD CONSTRAINT `Participante_sorteoId_fkey` FOREIGN KEY (`sorteoId`) REFERENCES `Sorteo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exclusion` ADD CONSTRAINT `Exclusion_participanteDeId_fkey` FOREIGN KEY (`participanteDeId`) REFERENCES `Participante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exclusion` ADD CONSTRAINT `Exclusion_participanteAId_fkey` FOREIGN KEY (`participanteAId`) REFERENCES `Participante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exclusion` ADD CONSTRAINT `Exclusion_sorteoId_fkey` FOREIGN KEY (`sorteoId`) REFERENCES `Sorteo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asignacion` ADD CONSTRAINT `Asignacion_participanteDeId_fkey` FOREIGN KEY (`participanteDeId`) REFERENCES `Participante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asignacion` ADD CONSTRAINT `Asignacion_participanteAId_fkey` FOREIGN KEY (`participanteAId`) REFERENCES `Participante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asignacion` ADD CONSTRAINT `Asignacion_sorteoId_fkey` FOREIGN KEY (`sorteoId`) REFERENCES `Sorteo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deseo` ADD CONSTRAINT `Deseo_participanteId_fkey` FOREIGN KEY (`participanteId`) REFERENCES `Participante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
