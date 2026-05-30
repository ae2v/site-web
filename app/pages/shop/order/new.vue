<script setup lang="ts">
import { ref } from "vue";
import Navbar from "~/components/layout/Navbar.vue";
import Button from "~/components/Button.vue";
import Input from "~/components/Input.vue";
import { useAuth } from "~/composables/useAuth";
import type { ShopItem } from "~~/shared/models/shop";
import { useRoute } from "#imports";
import ItemVariantCard from "~/components/cards/ItemVariantCard.vue";

const route = useRoute();
const { user, fetchMe } = useAuth();

const product = ref<ShopItem | null>(null);
const selectedVariantId = ref<number | null>(
	route.query.variant ? Number(route.query.variant) : null,
);
const quantity = ref(1);
const isLoading = ref(true);
const orderError = ref<string | null>(null);
const orderSuccess = ref(false);
const ordering = ref(false);
const reductionCode = ref("");
const orderCode = ref<string | null>(null);
const createdOrderId = ref<number | null>(null);

const customerFirstName = ref("");
const customerLastName = ref("");
const customerEmail = ref("");

const selectedVariantStock = computed(
	() =>
		product.value?.variants.find((v) => v.id === selectedVariantId.value)
			?.stock ?? 1,
);

const loadProduct = async () => {
	const productId = route.query.id;

	if (!productId) {
		orderError.value = "Aucun produit sélectionné";
		isLoading.value = false;
		return;
	}

	try {
		await fetchMe();

		if (user.value?.account) {
			customerFirstName.value = user.value.account.firstName ?? "";
			customerLastName.value = user.value.account.lastName ?? "";
			customerEmail.value = user.value.account.email ?? "";
		}

		const data = await $fetch<ShopItem>(`/api/shop/items/${productId}`);
		product.value = data;

		if (data.variants?.length > 0) {
			if (
				selectedVariantId.value === null ||
				!data.variants.some((v) => v.id === selectedVariantId.value)
			) {
				selectedVariantId.value = data.variants[0]!.id;
			}
		}
	} catch (err) {
		orderError.value =
			err instanceof Error
				? err.message
				: "Impossible de charger le produit";
	} finally {
		isLoading.value = false;
	}
};

onMounted(loadProduct);

const submitOrder = async () => {
	if (!product.value || !selectedVariantId.value) {
		orderError.value = "Informations de commande incomplètes";
		return;
	}

	if (
		!customerFirstName.value.trim() ||
		!customerLastName.value.trim() ||
		!customerEmail.value.trim()
	) {
		orderError.value = "Veuillez renseigner vos informations client";
		return;
	}

	ordering.value = true;
	orderError.value = null;

	try {
		const response = await $fetch<{
			ok: boolean;
			orders: Array<{ id: number; orderCode: string }>;
		}>("/api/shop/orders/new", {
			method: "POST",
			body: {
				customerFirstName: customerFirstName.value,
				customerLastName: customerLastName.value,
				customerEmail: customerEmail.value,
				items: [
					{
						variantId: selectedVariantId.value,
						quantity: quantity.value,
					},
				],
				reductionCode: reductionCode.value || null,
			},
		});

		if (response.orders.length === 0) {
			throw new Error(
				"La commande a été créée sans identifiant de suivi",
			);
		}

		createdOrderId.value = response.orders[0]!.id;
		orderCode.value = response.orders[0]!.orderCode;
		orderSuccess.value = true;

		setTimeout(() => {
			navigateTo(
				`/shop/order/${createdOrderId.value}?code=${encodeURIComponent(orderCode.value || "")}&email=${encodeURIComponent(customerEmail.value.trim().toLowerCase())}`,
			);
		}, 1200);
	} catch (err) {
		orderError.value =
			err instanceof Error ? err.message : "Commande impossible";
	} finally {
		ordering.value = false;
	}
};

watch(
	() => selectedVariantId.value,
	() => {
		if (quantity.value > selectedVariantStock.value) {
			quantity.value = selectedVariantStock.value;
		}
	},
);
</script>
<template>
	<Navbar />
	<main class="container mx-auto p-8">
		<div v-if="isLoading" class="max-w-2xl mx-auto py-16 text-center">
			<p class="text-xl text-gray-600">Chargement...</p>
		</div>

		<section v-else class="max-w-2xl mx-auto">
			<h1 class="text-4xl font-bold font-title mb-8">Commander</h1>

			<div
				v-if="orderSuccess"
				class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-8"
			>
				Commande créée. Code de suivi: <strong>{{ orderCode }}</strong>
			</div>

			<div
				v-if="orderError"
				class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8"
			>
				{{ orderError }}
			</div>

			<div v-if="product" class="space-y-8">
				<div class="bg-surface rounded-3xl p-8">
					<h2 class="text-3xl font-bold font-title mb-4">
						{{ product.name }}
					</h2>
					<p class="text-gray-700 text-lg mb-6">
						{{ product.description }}
					</p>
					<p class="text-emerald-500 text-2xl font-bold">
						{{ (product.price / 100).toFixed(2) }} €
					</p>
				</div>

				<div class="bg-surface rounded-3xl p-8 space-y-4">
					<h3 class="text-xl font-bold font-title">
						Vos informations
					</h3>
					<div class="grid gap-4 lg:grid-cols-2">
						<Input
							v-model="customerFirstName"
							label="Prénom"
							placeholder="Votre prénom"
							required
						/>
						<Input
							v-model="customerLastName"
							label="Nom"
							placeholder="Votre nom"
							required
						/>
					</div>
					<Input
						v-model="customerEmail"
						type="email"
						label="Email"
						placeholder="vous@exemple.fr"
						required
					/>
				</div>

				<div v-if="product.variants.length > 0">
					<h3 class="text-xl font-bold font-title mb-4">Variantes</h3>
					<div class="grid gap-4 lg:grid-cols-2">
						<label
							v-for="variant in product.variants"
							:key="variant.id"
						>
							<input
								type="radio"
								:value="variant.id"
								v-model="selectedVariantId"
								class="hidden"
							/>
							<ItemVariantCard
								:variant="variant"
								:selected="selectedVariantId === variant.id"
							/>
						</label>
					</div>
				</div>

				<div
					class="flex justify-stretch items-center gap-8 flex-col lg:flex-row"
				>
					<div class="flex-1">
						<h3 class="text-xl font-bold font-title mb-4">
							Quantité
						</h3>
						<Input
							v-model.number="quantity"
							type="number"
							label="Quantité"
							placeholder="Entrez la quantité souhaitée"
							:min="1"
							:max="selectedVariantStock"
						/>
					</div>

					<div
						class="flex-1 bg-linear-to-br from-orange-400 to-rose-400 text-white rounded-3xl p-8"
					>
						<h3 class="text-xl font-bold font-title mb-4">
							Code de réduction
						</h3>
						<Input
							v-model="reductionCode"
							type="text"
							label="Code"
							placeholder="Entrez un code de réduction"
						/>
					</div>
				</div>

				<div class="bg-surface rounded-3xl p-8">
					<h3 class="text-xl font-bold font-title mb-4">Résumé</h3>
					<div class="space-y-2 text-lg">
						<div class="flex justify-between">
							<span>Produit:</span>
							<span class="font-semibold">{{
								product.name
							}}</span>
						</div>
						<div
							v-if="
								product.variants.find(
									(v) => v.id === selectedVariantId,
								)
							"
							class="flex justify-between"
						>
							<span>Variante:</span>
							<span class="font-semibold">
								{{
									product.variants.find(
										(v) => v.id === selectedVariantId,
									)?.name
								}}
							</span>
						</div>
						<div class="flex justify-between">
							<span>Quantité:</span>
							<span class="font-semibold">{{ quantity }}</span>
						</div>
						<div
							class="border-t pt-2 flex justify-between text-emerald-600"
						>
							<span>Total:</span>
							<span class="font-semibold"
								>{{
									((product.price * quantity) / 100).toFixed(
										2,
									)
								}}
								€</span
							>
						</div>
					</div>

					<div class="flex flex-col sm:flex-row gap-4 mt-8">
						<div class="w-full sm:w-auto">
							<Button
								:handler="submitOrder"
								label="Confirmer la commande"
								btnStyle="PRIMARY"
								btnSize="MEDIUM"
								:disabled="
									!selectedVariantId ||
									quantity < 1 ||
									ordering ||
									!customerFirstName ||
									!customerLastName ||
									!customerEmail
								"
							/>
						</div>
						<div class="w-full sm:w-auto">
							<Button
								handler="/shop"
								label="Retour à la boutique"
								btnStyle="LINK"
								btnSize="MEDIUM"
								:disabled="ordering"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	</main>
</template>
