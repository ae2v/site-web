export type ItemCategory = "Vêtements" | "Accessoires" | "Autres";

export interface ShopItem {
	id: number;
	name: string;
	description: string;
	category: ItemCategory;
	price: number; // Prix en centimes d'euros pour éviter les problèmes d'arrondi
	variants: ItemVariant[]; // Variantes disponibles pour cet article (ex: différentes tailles ou couleurs)
}

export interface ItemVariant {
	id: number;
	itemId: ShopItem["id"];
	name: string; // Nom de la variante (ex: "Taille S", "Couleur rouge", etc.)
	stock: number; // Quantité en stock pour cette variante
	labelColor: string | null; // Couleur de l'étiquette de la variante (ex: "#FF0000" pour rouge, null pour aucune couleur spécifique)
	photoUrl: string | null; // URL de la photo spécifique à cette variante (null si aucune photo spécifique, dans ce cas la photo de l'article sera utilisée)
}

export interface Reduction {
	id: number;
	code: string;
	percentage: number; // Pourcentage de réduction (ex: 20 pour 20%)
	expiryDate: Date; // Date d'expiration du code de réduction
	quantity: number | null; // Nombre d'utilisations restantes (null pour une utilisation illimitée)
	description: string | null; // Description optionnelle du code de réduction
	itemId: ShopItem["id"] | null; // ID de l'article auquel la réduction s'applique (null si il s'applique à toute la boutique)
	itemCategory: ItemCategory | null; // Catégorie de l'article auquel la réduction s'applique (null pour toute la boutique)
}

export type OrderStatus =
	| "PENDING" // Commande en attente de traitement
	| "RESERVED" // Article réservé pour le client
	| "READY" // Article prêt à être récupéré
	| "CANCELED" // Commande annulée
	| "COMPLETED"; // Commande finalisée, réglée et récupérée par le client

export interface Order {
	id: number;
	orderCode: string;
	customerFirstName: string; // Prénom du client (pour affichage dans l'interface de gestion)
	customerLastName: string; // Nom du client (pour affichage dans l'interface de gestion)
	customerEmail: string; // Email du client (pour affichage dans l'interface de gestion)
	date: Date;
	pickupTime: Date | null; // Date et heure MINIMUM pour la récupération de la commande
	status: OrderStatus;
	itemId: ItemVariant["id"];
	quantity: number;
	reductionId: Reduction["id"] | null; // ID du code de réduction appliqué à la commande (null si aucun code de réduction n'est appliqué)
}
