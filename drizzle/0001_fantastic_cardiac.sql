CREATE TABLE `criteria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`domainId` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`orderIndex` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `criteria_id` PRIMARY KEY(`id`),
	CONSTRAINT `criteria_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `domains` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(10) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`orderIndex` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `domains_id` PRIMARY KEY(`id`),
	CONSTRAINT `domains_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `evidences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`indicatorId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`fileKey` varchar(500) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileType` varchar(100) NOT NULL,
	`fileSize` int NOT NULL DEFAULT 0,
	`uploadedBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evidences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `indicators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`criteriaId` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`text` text NOT NULL,
	`orderIndex` int NOT NULL DEFAULT 0,
	`isPrivate` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `indicators_id` PRIMARY KEY(`id`),
	CONSTRAINT `indicators_code_unique` UNIQUE(`code`)
);
