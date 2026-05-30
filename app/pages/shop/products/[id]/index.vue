<script setup lang="ts">
import Navbar from "~/components/layout/Navbar.vue";
import Button from "~/components/Button.vue";
import { ref, computed } from "vue";
import { useRoute } from "#imports";
import { useItems, useOffers } from "~/composables/useShop";

const route = useRoute();
const id = Number(route.params.id);

const { items, fetchItems } = await useItems();
const { offers, fetchOffers } = await useOffers();

await Promise.all([fetchItems(), fetchOffers()]);

const product = computed(() => items.value.find((i) => i.id === id) ?? null);
const variants = computed(() => product.value?.variants ?? []);
const varIndex = ref(0);

const formatPrice = (cents: number) =>
	(cents / 100).toFixed(2).replace(".", ",");

const applicableOffers = computed(() => {
	if (!product.value) return [];
	return offers.value.filter(
		(o) =>
			o.itemId === null ||
			o.itemId === id ||
			o.itemCategory === product.value!.category,
	);
});
</script>
<template>
	<Navbar />
	<header class="container mx-auto p-8 space-y-16">
		<section class="flex items-center" v-if="product">
			<img
				:src="
					product.variants?.[varIndex]?.photoUrl ||
					'/default-photo.png'
				"
				class="rounded-4xl w-2/5 aspect-5/4 object-cover"
			/>
			<aside class="w-3/5 p-8 space-y-8">
				<h1 class="text-5xl font-bold font-title">
					{{ product.name }}
				</h1>
				<p class="text-gray-700 text-xl">{{ product.description }}</p>
				<div class="flex items-end gap-4">
					<p class="text-emerald-500 text-4xl font-bold">
						{{ formatPrice(product.price) }} €
					</p>
				</div>
				<div class="flex gap-4">
					<div
						v-for="(variant, index) in variants"
						:key="variant.id"
						class="w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2"
						:class="{
							'border-primary': varIndex === index,
							'border-transparent': varIndex !== index,
						}"
						@click="varIndex = index"
					>
						<img
							:src="variant.photoUrl || '/default-photo.png'"
							class="w-full h-full object-cover"
						/>
					</div>
				</div>
				<Button
					:handler="`/shop/order/new?id=${product.id}&variant=${variants[varIndex]?.id ?? ''}`"
					label="Commander"
					btnStyle="PRIMARY"
					btnSize="LARGE"
				/>
			</aside>
		</section>

		<section v-else class="container mx-auto p-8">
			<p>Chargement...</p>
		</section>
	</header>

	<main class="container mx-auto p-8 space-y-16" v-if="product">
		<section>
			<h2 class="text-4xl font-bold font-title mb-8">
				Offres applicables
			</h2>
			<ul class="space-y-4">
				<li
					v-for="offer in applicableOffers"
					:key="offer.id"
					class="p-4 border rounded-lg"
				>
					<div class="flex justify-between items-center">
						<div>
							<div class="font-semibold">
								{{ offer.description || "Réduction" }}
							</div>
							<div class="text-sm text-muted">
								{{ offer.percentage }}% — expires:
								{{
									new Date(
										offer.expiryDate,
									).toLocaleDateString()
								}}
							</div>
						</div>
						<div class="text-lg font-mono">{{ offer.code }}</div>
					</div>
				</li>
				<li v-if="applicableOffers.length === 0" class="text-muted">
					Aucune offre disponible pour ce produit.
				</li>
			</ul>
		</section>

		<section>
			<h2 class="text-4xl font-bold font-title mb-8">Accord client</h2>
			<p class="text-xl">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
				vel sapien eget nunc gravida tincidunt. Curabitur at felis ac
				nisl efficitur commodo.
			</p>
		</section>
		<section>
			<h2 class="text-4xl font-bold font-title mb-8">
				Modalités de remboursement
			</h2>
			<p class="text-xl">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
				vel sapien eget nunc gravida tincidunt. Curabitur at felis ac
				nisl efficitur commodo.
			</p>
		</section>
	</main>
</template>
