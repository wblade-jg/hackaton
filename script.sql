--Script generado por el CLI de EF Core
CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

START TRANSACTION;
ALTER DATABASE CHARACTER SET utf8mb4;

CREATE TABLE `ArchivoControl` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `NombreArchivo` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `FechaProceso` datetime(6) NOT NULL,
    `Estado` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `TotalRegistros` int NOT NULL,
    `Procesados` int NOT NULL,
    `Rechazados` int NOT NULL,
    CONSTRAINT `PK_ArchivoControl` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Transaccion` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `ArchivoProcesadoId` int NOT NULL,
    `Cuenta` varchar(10) CHARACTER SET utf8mb4 NOT NULL,
    `Monto` decimal(18,2) NOT NULL,
    `Fecha` datetime(6) NOT NULL,
    `Estado` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `MotivoRechazo` varchar(500) CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_Transaccion` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Transaccion_ArchivoControl_ArchivoProcesadoId` FOREIGN KEY (`ArchivoProcesadoId`) REFERENCES `ArchivoControl` (`Id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE UNIQUE INDEX `IX_ArchivoControl_NombreArchivo` ON `ArchivoControl` (`NombreArchivo`);

CREATE INDEX `IX_Transaccion_ArchivoProcesadoId` ON `Transaccion` (`ArchivoProcesadoId`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260731052052_ActualizacionEntidades', '9.0.0');

COMMIT;

