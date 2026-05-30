<script setup lang="ts">
import Navbar from "~/components/layout/Navbar.vue";
import Button from "~/components/Button.vue";
import { useRoute } from "#imports";
import type { OrderStatus } from "~~/shared/models/shop";

const route = useRoute();
const orderId = Number(route.params.id);
const orderCode = computed(
	() => (route.query.code as string | undefined) ?? "",
);
const orderEmail = computed(
	() => (route.query.email as string | undefined) ?? "",
);

const isLoading = ref(true);
const error = ref<string | null>(null);
const order = ref<{
	id: number;
	orderCode: string;
	customerFirstName: string;
	customerLastName: string;
	customerEmail: string;
	status: OrderStatus;
	date: string;
	quantity: number;
	itemName: string | null;
	variantName: string | null;
	itemPrice: number | null;
} | null>(null);

const claimUrl = computed(() => {
	if (!order.value) {
		return "/shop/order/claim";
	}

	return `/shop/order/claim?id=${order.value.id}&code=${encodeURIComponent(order.value.orderCode)}&email=${encodeURIComponent(order.value.customerEmail)}`;
});

const statusLabel: Record<OrderStatus, string> = {
	PENDING: "En attente de confirmation",
	RESERVED: "En cours de livraison",
	READY: "Prête à être récupérée",
	CANCELED: "Annulée",
	COMPLETED: "Payée",
};

const loadOrder = async () => {
	if (Number.isNaN(orderId)) {
		error.value = "Identifiant de commande invalide";
		isLoading.value = false;
		return;
	}

	if (!orderCode.value.trim()) {
		error.value = "Le code de commande est requis";
		isLoading.value = false;
		return;
	}

	if (!orderEmail.value.trim()) {
		error.value = "L'email de commande est requis";
		isLoading.value = false;
		return;
	}

	try {
		order.value = await $fetch(`/api/shop/orders/${orderId}`, {
			query: { code: orderCode.value, email: orderEmail.value },
		});
	} catch (err) {
		error.value =
			err instanceof Error
				? err.message
				: "Impossible de retrouver cette commande";
	} finally {
		isLoading.value = false;
	}
};

onMounted(loadOrder);
</script>

<template>
	<Navbar />
	<main class="container mx-auto p-8">
		<div v-if="isLoading" class="max-w-2xl mx-auto py-16 text-center">
			<p class="text-xl text-gray-600">Chargement de la commande...</p>
		</div>

		<div
			v-else-if="error"
			class="max-w-2xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
		>
			<p>{{ error }}</p>
			<div class="mt-4">
				<Button
					handler="/shop/order"
					label="Rechercher une commande"
					btnStyle="PRIMARY"
					btnSize="MEDIUM"
				/>
			</div>
		</div>

		<section v-else-if="order" class="max-w-2xl mx-auto space-y-6">
			<header class="text-center p-8 space-y-4">
				<h1 class="text-3xl font-bold font-title">Suivi de commande</h1>
				<div class="-space-y-1">
					<p class="text-xl">
						Votre commande est enregistrée avec le code suivant.
					</p>
					<p class="text-lg">
						Gardez-le au chaud ou
						<RouterLink
							:to="claimUrl"
							class="text-primary hover:underline"
							>connectez-vous</RouterLink
						>
						pour suivre sa progression.
					</p>
				</div>
				<p
					class="bg-surface text-2xl font-bold text-muted rounded-xl w-fit px-4 py-2 mx-auto"
				>
					{{ order.orderCode }}
				</p>
			</header>

			<StatusProgress :progress="order.status" />

			<div class="bg-surface rounded-3xl p-8 space-y-4">
				<div class="flex justify-between">
					<span>Statut</span>
					<strong>{{ statusLabel[order.status] }}</strong>
				</div>
				<div class="flex justify-between">
					<span>Produit</span>
					<strong>{{ order.itemName || "Produit" }}</strong>
				</div>
				<div class="flex justify-between">
					<span>Variante</span>
					<strong>{{ order.variantName || "-" }}</strong>
				</div>
				<div class="flex justify-between">
					<span>Quantité</span>
					<strong>{{ order.quantity }}</strong>
				</div>
				<div
					class="flex justify-between"
					v-if="order.itemPrice !== null"
				>
					<span>Total</span>
					<strong>
						{{
							((order.itemPrice * order.quantity) / 100).toFixed(
								2,
							)
						}}€ ({{ order.quantity }}x{{
							(order.itemPrice / 100).toFixed(2)
						}}€)
					</strong>
				</div>
				<div class="flex justify-between">
					<span>Date</span>
					<strong>{{
						new Date(order.date).toLocaleString("fr-FR")
					}}</strong>
				</div>
			</div>

			<div class="bg-surface rounded-3xl p-8 space-y-2">
				<h2 class="text-xl font-bold font-title">
					Informations client
				</h2>
				<p>
					{{ order.customerFirstName }} {{ order.customerLastName }}
				</p>
				<p>{{ order.customerEmail }}</p>
			</div>

			<div class="flex flex-col sm:flex-row gap-4">
				<div class="w-full sm:w-auto">
					<Button
						handler="/shop"
						label="Retour boutique"
						btnStyle="LINK"
						btnSize="MEDIUM"
					/>
				</div>
				<div class="w-full sm:w-auto">
					<Button
						handler="/shop/order"
						label="Retrouver une autre commande"
						btnStyle="PRIMARY"
						btnSize="MEDIUM"
					/>
				</div>
			</div>
		</section>
	</main>
</template>
