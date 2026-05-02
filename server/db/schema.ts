import { pgTable, serial, text, varchar, integer, pgEnum } from "drizzle-orm/pg-core";

export const poleEnum = pgEnum("pole", [
	"DIRECTION",
	"COMMUNICATION",
	"DÉVELOPPEMENT",
	"MARKETING",
]);

export const roleEnum = pgEnum("role", [
	"Président",
	"Vice-Président",
	"Trésorier",
	"Secrétaire",
	"Membre",
]);

export const departmentEnum = pgEnum("department", [
	"MMI",
	"GEII",
	"INFO",
	"RT",
	"MRIT",
]);

export const members = pgTable("members", {
	id: serial("id").primaryKey(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	pronouns: text("pronouns"),
	email: varchar("email", { length: 256 }).notNull(),
	discord: varchar("discord", { length: 32 }),
	pole: poleEnum("pole").notNull(),
	role: roleEnum("role").notNull(),
	department: departmentEnum("department").notNull(),
	promo: integer("promo").notNull(),
	photoUrl: text("photo_url"),
});

export const events = pgTable("events", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	date: text("date").notNull(),
	location: text("location").notNull(),
	photoUrl: text("photo_url"),
	link: text("link"),
	linkLabel: text("link_label"),
});
