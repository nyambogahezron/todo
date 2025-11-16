CREATE TABLE `Note` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`createdAt` text DEFAULT '' NOT NULL,
	`updatedAt` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `Note_updatedAt_idx` ON `Note` (`updatedAt`);--> statement-breakpoint
CREATE TABLE `ShoppingItem` (
	`id` text PRIMARY KEY NOT NULL,
	`listId` text NOT NULL,
	`name` text NOT NULL,
	`quantity` real DEFAULT 1 NOT NULL,
	`price` real DEFAULT 0 NOT NULL,
	`checked` integer DEFAULT false NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`listId`) REFERENCES `ShoppingList`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ShoppingItem_listId_idx` ON `ShoppingItem` (`listId`);--> statement-breakpoint
CREATE TABLE `ShoppingList` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ShoppingList_updatedAt_idx` ON `ShoppingList` (`updatedAt`);--> statement-breakpoint
CREATE TABLE `Todo` (
	`id` text PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`done` integer DEFAULT false NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`dueDate` text DEFAULT '',
	`createdAt` text DEFAULT '' NOT NULL,
	`updatedAt` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `Todo_done_idx` ON `Todo` (`done`);--> statement-breakpoint
CREATE INDEX `Todo_priority_idx` ON `Todo` (`priority`);