import {
	pgTable,
	serial,
	text,
	varchar,
	integer,
	timestamp,
	pgEnum,
} from "drizzle-orm/pg-core";

export const poleEnum = pgEnum("pole", [
	"DIRECTION",
	"COMMUNICATION",
	"DÉVELOPPEMENT",
	"MARKETING",
	"ÉVÉNEMENTIEL",
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

export const membershipStatusEnum = pgEnum("membership_status", [
	"ACTIVE",
	"INACTIVE",
	"PENDING",
	"REVOKED",
	"VISITOR",
]);

/* Accounts */

export const accounts = pgTable("accounts", {
	id: serial("id").primaryKey(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	studentId: varchar("student_id", { length: 32 }),
	email: varchar("email", { length: 256 }).notNull(),
	passwordHash: text("password_hash"),
	membershipStatus: membershipStatusEnum("membership_status")
		.notNull()
		.default("PENDING"),
});

/* Membres */

export const members = pgTable("members", {
	id: serial("id").primaryKey(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	pronouns: text("pronouns"),
	discord: varchar("discord", { length: 32 }),
	pole: poleEnum("pole").notNull(),
	role: roleEnum("role").notNull(),
	department: departmentEnum("department").notNull(),
	promo: integer("promo").notNull(),
	photoUrl: text("photo_url"),
	accountId: integer("account_id")
		.unique()
		.references(() => accounts.id, {
			onDelete: "cascade",
		}),
});

/* Événements */

export const events = pgTable("events", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	date: timestamp("date").notNull(),
	endDate: timestamp("end_date"),
	location: text("location").notNull(),
	photoUrl: text("photo_url"),
	link: text("link"),
	linkLabel: text("link_label"),
});

/* Boutique */

export const Category = pgEnum("category", [
	"Vêtements",
	"Accessoires",
	"Autres",
]);

export const shopItems = pgTable("shop_items", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description").notNull(),
	category: Category("category").notNull(),
	price: integer("price").notNull(), // Prix en centimes d'euros pour éviter les problèmes d'arrondi
});

export const itemVariants = pgTable("item_variants", {
	id: serial("id").primaryKey(),
	itemId: integer("item_id")
		.notNull()
		.references(() => shopItems.id, { onDelete: "cascade" }),
	name: text("name").notNull(), // Nom de la variante (ex: "Taille S", "Couleur rouge", etc.)
	stock: integer("stock").notNull(), // Quantité en stock pour cette variante
	labelColor: varchar("label_color", { length: 7 }), // Couleur de l'étiquette de la variante
	photoUrl: text("photo_url"), // URL de la photo spécifique à cette variante (null si aucune photo spécifique, dans ce cas la photo de l'article sera utilisée)
});

export const reductions = pgTable("reductions", {
	id: serial("id").primaryKey(),
	code: text("code").notNull(),
	percentage: integer("percentage").notNull(), // Pourcentage de réduction (ex: 20 pour 20%)
	expiryDate: timestamp("expiry_date").notNull(), // Date d'expiration du code de réduction
	quantity: integer("quantity"), // Nombre d'utilisations restantes (null pour une utilisation illimitée)
	description: text("description"), // Description optionnelle du code de réduction
	itemId: integer("item_id").references(() => shopItems.id, {
		onDelete: "set null",
	}), // ID de l'article auquel la réduction s'applique (null si il s'applique à toute la boutique)
	itemCategory: Category("item_category"), // Catégorie de l'article auquel la réduction s'applique (null pour toute la boutique)
});

export const orders = pgTable("orders", {
	id: serial("id").primaryKey(),
	orderCode: varchar("order_code", { length: 32 }).notNull().unique(),
	customerFirstName: text("customer_first_name").notNull(), // Prénom du client (pour affichage dans l'interface de gestion)
	customerLastName: text("customer_last_name").notNull(), // Nom du client (pour affichage dans l'interface de gestion)
	customerEmail: text("customer_email").notNull(), // Email du client (pour affichage dans l'interface de gestion)
	customerAccountId: integer("customer_account_id").references(
		() => accounts.id,
		{
			onDelete: "set null",
		},
	),
	date: timestamp("date").notNull(),
	pickupTime: timestamp("pickup_time"), // Date et heure MINIMUM pour la récupération de la commande
	status: text("status").notNull(),
	itemId: integer("item_id")
		.notNull()
		.references(() => itemVariants.id, { onDelete: "cascade" }),
	quantity: integer("quantity").notNull(),
	reductionId: integer("reduction_id").references(() => reductions.id, {
		onDelete: "set null",
	}), // ID du code de réduction appliqué à la commande (null si aucun code de réduction n'est appliqué)
});

// Exported RLS SQL helper
// Usage: run these statements in your DB or via a migration tool. The application
// should set the session variable `app.current_account` to the current account id
// (as text) for policies that compare ownership. Example:
// SELECT set_config('app.current_account', '123', true);
export const rlsSql = `
-- Minimal permissive RLS: enable RLS and create permissive policies (effectively base policy).
-- Useful when your application runs as superuser or you don't want per-row restrictions.

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS permissive_policy_accounts ON accounts;
CREATE POLICY permissive_policy_accounts ON accounts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS permissive_policy_members ON members;
CREATE POLICY permissive_policy_members ON members FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS permissive_policy_orders ON orders;
CREATE POLICY permissive_policy_orders ON orders FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS permissive_policy_events ON events;
CREATE POLICY permissive_policy_events ON events FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS permissive_policy_shop_items ON shop_items;
CREATE POLICY permissive_policy_shop_items ON shop_items FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE item_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS permissive_policy_item_variants ON item_variants;
CREATE POLICY permissive_policy_item_variants ON item_variants FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE reductions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS permissive_policy_reductions ON reductions;
CREATE POLICY permissive_policy_reductions ON reductions FOR ALL USING (true) WITH CHECK (true);
`;
