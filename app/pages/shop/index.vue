<script setup lang="ts">
import Navbar from "~/components/layout/Navbar.vue";
import Button from "~/components/Button.vue";
import { FunnelIcon } from "@heroicons/vue/20/solid";

import ItemCard from "~/components/cards/ItemCard.vue";
import type { ItemCategory, ShopItem } from "#shared/models/shop";

const { fetchItems, items } = await useItems();

const search = ref("");
const drawerOpen = ref(false);
const isDesktop = ref(false);
const selectedCategory = ref<"ALL" | ItemCategory>("ALL");
const minPrice = ref<number | null>(null);
const maxPrice = ref<number | null>(null);
const inStockOnly = ref(false);
const sortBy = ref<
	"name-asc" | "name-desc" | "price-asc" | "price-desc" | "stock-desc"
>("name-asc");

const itemTotalStock = (item: ShopItem) =>
	item.variants.reduce((acc, variant) => acc + variant.stock, 0);

const categories = computed<ItemCategory[]>(() => {
	const uniqueCategories = new Set(items.value.map((item) => item.category));
	return Array.from(uniqueCategories).sort((a, b) =>
		a.localeCompare(b, "fr"),
	);
});

const filteredItems = computed<ShopItem[]>(() => {
	const normalizedSearch = search.value.trim().toLowerCase();

	const filtered = items.value.filter((item) => {
		if (normalizedSearch) {
			const haystack = `${item.name} ${item.description}`.toLowerCase();
			if (!haystack.includes(normalizedSearch)) return false;
		}

		if (
			selectedCategory.value !== "ALL" &&
			item.category !== selectedCategory.value
		) {
			return false;
		}

		const itemPriceInEuros = item.price / 100;
		if (minPrice.value !== null && itemPriceInEuros < minPrice.value) {
			return false;
		}
		if (maxPrice.value !== null && itemPriceInEuros > maxPrice.value) {
			return false;
		}

		if (inStockOnly.value && itemTotalStock(item) <= 0) {
			return false;
		}

		return true;
	});

	return [...filtered].sort((a, b) => {
		switch (sortBy.value) {
			case "name-desc":
				return b.name.localeCompare(a.name, "fr");
			case "price-asc":
				return a.price - b.price;
			case "price-desc":
				return b.price - a.price;
			case "stock-desc":
				return itemTotalStock(b) - itemTotalStock(a);
			case "name-asc":
			default:
				return a.name.localeCompare(b.name, "fr");
		}
	});
});

const resetFilters = () => {
	search.value = "";
	selectedCategory.value = "ALL";
	minPrice.value = null;
	maxPrice.value = null;
	inStockOnly.value = false;
	sortBy.value = "name-asc";
};

definePageMeta({
	layout: "default",
});

onMounted(() => {
	fetchItems();

	if (process.client) {
		const mq = window.matchMedia("(min-width: 1024px)");

		const update = () => {
			isDesktop.value = mq.matches;
			if (mq.matches) drawerOpen.value = false;
		};

		update();

		if (mq.addEventListener) mq.addEventListener("change", update);
		else mq.addListener(update);

		onBeforeUnmount(() => {
			if (mq.removeEventListener)
				mq.removeEventListener("change", update);
			else mq.removeListener(update);
		});
	}
});
</script>
<template>
	<Navbar />
	<div class="container flex flex-col lg:flex-row gap-x-8 h-screen mx-auto p-8 pt-32">
		<!-- Mobile filter toggle -->
		<div class="lg:hidden mb-4 flex items-center justify-between px-8">
			<div>
				<h2 class="text-xl font-semibold">Boutique</h2>
				<p class="text-sm text-muted">Parcourez nos produits</p>
			</div>
			<Button
				:handler="() => { drawerOpen = !drawerOpen }"
				label="Filtres"
				btnStyle="PRIMARY"
				btnSize="MEDIUM"
				:icon="FunnelIcon"
			/>
		</div>

		<aside
			v-show="drawerOpen || isDesktop"
			class="shrink-0 h-full lg:w-1/4 border border-emerald-200 rounded-3xl bg-emerald-50 p-6 overflow-y-auto"
		>
			<div class="space-y-4">
				<div class="space-y-1">
					<h2 class="text-2xl font-title font-bold text-emerald-900">
						Filtres
					</h2>
					<p class="text-sm text-emerald-800">
						{{ filteredItems.length }} produit(s) affiché(s)
					</p>
				</div>

				<div class="space-y-2">
					<label
						for="shop-search"
						class="text-sm font-semibold text-emerald-900"
					>
						Recherche
					</label>
					<input
						id="shop-search"
						v-model="search"
						type="text"
						placeholder="Nom ou description"
						class="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
					/>
				</div>

				<div class="space-y-2">
					<label
						for="shop-category"
						class="text-sm font-semibold text-emerald-900"
					>
						Catégorie
					</label>
					<select
						id="shop-category"
						v-model="selectedCategory"
						class="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
					>
						<option value="ALL">Toutes</option>
						<option
							v-for="category in categories"
							:key="category"
							:value="category"
						>
							{{ category }}
						</option>
					</select>
				</div>

				<div class="space-y-2">
					<p class="text-sm font-semibold text-emerald-900">
						Prix (EUR)
					</p>
					<div class="grid grid-cols-2 gap-2">
						<input
							v-model.number="minPrice"
							type="number"
							min="0"
							step="0.25"
							placeholder="Min"
							class="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
						/>
						<input
							v-model.number="maxPrice"
							type="number"
							min="0"
							step="0.25"
							placeholder="Max"
							class="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>
				</div>

				<label
					class="flex items-center gap-3 text-sm font-medium text-emerald-900"
				>
					<input
						v-model="inStockOnly"
						type="checkbox"
						class="h-4 w-4 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
					/>
					Afficher seulement les articles en stock
				</label>

				<div class="space-y-2">
					<label
						for="shop-sort"
						class="text-sm font-semibold text-emerald-900"
					>
						Trier par
					</label>
					<select
						id="shop-sort"
						v-model="sortBy"
						class="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
					>
						<option value="name-asc">Nom (A-Z)</option>
						<option value="name-desc">Nom (Z-A)</option>
						<option value="price-asc">Prix croissant</option>
						<option value="price-desc">Prix décroissant</option>
						<option value="stock-desc">Stock disponible</option>
					</select>
				</div>

				<Button
					btnStyle="NEUTRAL"
					btnSize="SMALL"
					label="Réinitialiser"
					:handler="resetFilters"
				/>
			</div>
		</aside>

		<main class="grow h-full overflow-y-auto">
			<header class="flex flex-col justify-center gap-8 px-8 lg:py-8">
				<h1 class="text-5xl font-bold font-title">Boutique</h1>
				<p class="text-xl">
					Découvrez nos produits exclusifs. Nous proposons une large
					gamme d'articles pour satisfaire tous les goûts et besoins.
					Chaque produit est soigneusement sélectionné pour garantir
					la qualité et le style. Rejoignez-nous pour découvrir nos
					dernières nouveautés et profiter de nos offres spéciales.
					Une expérience étudiante inoubliable !
				</p>
			</header>
			<section class="p-8 space-y-16">
				<div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
					<ItemCard
						v-for="item in filteredItems"
						:key="item.id"
						:item="item"
					/>
				</div>
				<p
					v-if="filteredItems.length === 0"
					class="text-base text-gray-600"
				>
					Aucun produit ne correspond à ces filtres.
				</p>
			</section>
		</main>
	</div>
</template>
