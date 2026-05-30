import type { ShopItem, Reduction } from "~~/shared/models/shop";

export interface CartItem {
	itemId: ShopItem["id"];
	variantId: number;
	quantity: number;
}

export const useCart = () => {
	const cart = useState<CartItem[]>("cart", () => []);

	const addToCart = (
		itemId: ShopItem["id"],
		variantId: number,
		quantity: number,
	) => {
		const existing = cart.value.find(
			(c) => c.itemId === itemId && c.variantId === variantId,
		);
		if (existing) {
			existing.quantity += quantity;
		} else {
			cart.value.push({ itemId, variantId, quantity });
		}
	};

	const removeFromCart = (itemId: ShopItem["id"], variantId: number) => {
		cart.value = cart.value.filter(
			(c) => !(c.itemId === itemId && c.variantId === variantId),
		);
	};

	const updateQuantity = (
		itemId: ShopItem["id"],
		variantId: number,
		quantity: number,
	) => {
		const item = cart.value.find(
			(c) => c.itemId === itemId && c.variantId === variantId,
		);
		if (item) {
			item.quantity = Math.max(0, quantity);
			if (item.quantity === 0) {
				removeFromCart(itemId, variantId);
			}
		}
	};

	const clearCart = () => {
		cart.value = [];
	};

	return {
		cart,
		addToCart,
		removeFromCart,
		updateQuantity,
		clearCart,
	};
};

export const useItems = async () => {
	const items = useState<ShopItem[]>("itemsList", () => []);
	const error = useState<Error | null>("itemsError", () => null);

	const fetchItems = async () => {
		try {
			const response = await $fetch("/api/shop/items");
			items.value = response;
		} catch (err: Error | unknown) {
			console.error("Failed to fetch items:", err as Error);
			error.value = err as Error;
		}
	};

	const addItem = async (item: ShopItem) => {
		try {
			await $fetch("/api/shop/items/new", {
				method: "POST",
				body: item,
			});

			items.value?.push(item);
		} catch (err: Error | unknown) {
			console.error("Failed to add item:", err as Error);
			error.value = err as Error;
		}
	};

	const deleteItem = async (id: ShopItem["id"]) => {
		try {
			await $fetch(`/api/shop/items/${id}`, {
				method: "DELETE",
			});

			items.value = items.value?.filter((i) => i.id !== id);
		} catch (err: Error | unknown) {
			console.error("Failed to delete item:", err as Error);
			error.value = err as Error;
		}
	};

	const updateItem = async (item: ShopItem) => {
		try {
			await $fetch(`/api/shop/items/${item.id}`, {
				method: "PUT",
				body: item,
			});

			items.value = items.value?.map((i) =>
				i.id === item.id ? item : i,
			);
		} catch (err: Error | unknown) {
			console.error("Failed to update item:", err as Error);
			error.value = err as Error;
		}
	};

	return {
		items,
		error,
		addItem,
		deleteItem,
		updateItem,
		fetchItems,
	};
};

export const useOrders = () => {
	// Similar implementation for orders (fetchOrders, addOrder, deleteOrder, updateOrder)
};

export const useOffers = async () => {
	const offers = useState<Reduction[]>("offersList", () => []);
	const error = useState<Error | null>("offersError", () => null);

	const fetchOffers = async () => {
		try {
			const response = await $fetch("/api/shop/offers");
			offers.value = response;
		} catch (err: Error | unknown) {
			console.error("Failed to fetch offers:", err as Error);
			error.value = err as Error;
		}
	};

	const addOffer = async (offer: Reduction) => {
		try {
			await $fetch("/api/shop/offers/new", {
				method: "POST",
				body: offer,
			});

			offers.value?.push(offer);
		} catch (err: Error | unknown) {
			console.error("Failed to add offer:", err as Error);
			error.value = err as Error;
		}
	};

	const deleteOffer = async (id: Reduction["id"]) => {
		try {
			await $fetch(`/api/shop/offers/${id}`, {
				method: "DELETE",
			});

			offers.value = offers.value?.filter((o) => o.id !== id);
		} catch (err: Error | unknown) {
			console.error("Failed to delete offer:", err as Error);
			error.value = err as Error;
		}
	};

	const updateOffer = async (offer: Reduction) => {
		try {
			await $fetch(`/api/shop/offers/${offer.id}`, {
				method: "PUT",
				body: offer,
			});

			offers.value = offers.value?.map((o) =>
				o.id === offer.id ? offer : o,
			);
		} catch (err: Error | unknown) {
			console.error("Failed to update offer:", err as Error);
			error.value = err as Error;
		}
	};

	return {
		offers,
		error,
		fetchOffers,
		addOffer,
		deleteOffer,
		updateOffer,
	};
};
