<script setup lang="ts">
import Navbar from "~/components/layout/Navbar.vue";
import Button from "~/components/Button.vue";
import type { OrderStatus } from "~~/shared/models/shop";

const { user, fetchMe } = useAuth();

const isAuthLoading = ref(true);
const orderCode = ref("");
const orderEmail = ref("");
const isLoading = ref(false);
const error = ref<string | null>(null);
const claimedOrdersError = ref<string | null>(null);
const isClaimedOrdersLoading = ref(false);
const claimedOrders = ref<
	Array<{
		id: number;
		orderCode: string;
		customerEmail: string;
		status: OrderStatus;
		date: string;
		quantity: number;
		itemName: string | null;
		variantName: string | null;
		itemPrice: number | null;
	}>
>([]);

const isLoggedIn = computed(() => Boolean(user.value));

const statusLabel: Record<OrderStatus, string> = {
	PENDING: "En attente de confirmation",
	RESERVED: "En cours de livraison",
	READY: "Prête à être récupérée",
	CANCELED: "Annulée",
	COMPLETED: "Payée",
};

const getOrderUrl = (order: {
	id: number;
	orderCode: string;
	customerEmail: string;
}) => {
	return `/shop/order/${order.id}?code=${encodeURIComponent(order.orderCode)}&email=${encodeURIComponent(order.customerEmail)}`;
};

const loadClaimedOrders = async () => {
	claimedOrdersError.value = null;
	isClaimedOrdersLoading.value = true;

	try {
		claimedOrders.value = await $fetch("/api/shop/orders/mine");
	} catch (err) {
		claimedOrdersError.value =
			err instanceof Error
				? err.message
				: "Impossible de charger vos commandes";
	} finally {
		isClaimedOrdersLoading.value = false;
	}
};

const goToOrder = async () => {
	error.value = null;
	const normalizedCode = orderCode.value.trim().toUpperCase();
	const normalizedEmail = orderEmail.value.trim().toLowerCase();

	if (!normalizedCode) {
		error.value = "Veuillez saisir votre code de commande";
		return;
	}

	if (!normalizedEmail) {
		error.value = "Veuillez saisir l'email de la commande";
		return;
	}

	isLoading.value = true;

	try {
		const match = await $fetch<{ id: number; orderCode: string }>(
			"/api/shop/orders/lookup",
			{
				query: { code: normalizedCode, email: normalizedEmail },
			},
		);

		await navigateTo(
			`/shop/order/${match.id}?code=${encodeURIComponent(match.orderCode)}&email=${encodeURIComponent(normalizedEmail)}`,
		);
	} catch (err) {
		error.value =
			err instanceof Error
				? err.message
				: "Commande introuvable avec ce code";
	} finally {
		isLoading.value = false;
	}
};

onMounted(async () => {
	await fetchMe().catch(() => undefined);
	isAuthLoading.value = false;

	if (isLoggedIn.value) {
		await loadClaimedOrders();
	}
});
</script>

<template>
	<Navbar />
	<main class="container mx-auto p-8 space-y-8 pt-32">
		<div v-if="isAuthLoading" class="max-w-xl mx-auto py-16 text-center">
			<p class="text-xl text-gray-600">Chargement...</p>
		</div>

		<section
			class="max-w-3xl mx-auto bg-surface rounded-3xl p-8 space-y-6"
		>
			<div>
				<h1 class="text-4xl font-bold font-title">
					Suivi de ma commande
				</h1>
				<p class="text-muted mt-2">
					Entrez le code et l'email utilisés lors de la commande pour
					accéder au suivi.
				</p>
			</div>

			<div class="space-y-2">
				<label for="order-email" class="font-medium"
					>Email utilisé pour la commande</label
				>
				<input
					id="order-email"
					v-model="orderEmail"
					type="email"
					placeholder="vous@exemple.fr"
					class="w-full rounded-xl border border-gray-300 px-4 py-3"
					@keyup.enter="goToOrder"
				/>
			</div>

			<div class="space-y-2">
				<label for="order-code" class="font-medium"
					>Code de commande</label
				>
				<input
					id="order-code"
					v-model="orderCode"
					type="text"
					placeholder="Exemple: BDE-1A2B3C4D"
					class="w-full rounded-xl border border-gray-300 px-4 py-3 uppercase"
					@keyup.enter="goToOrder"
				/>
			</div>


			<p v-if="error" class="text-red-600 text-sm">{{ error }}</p>

			<div class="flex flex-col sm:flex-row gap-3">
				<div class="w-full sm:w-auto">
					<Button
						:handler="goToOrder"
						label="Accéder à ma commande"
						btnStyle="PRIMARY"
						btnSize="MEDIUM"
						:disabled="isLoading"
					/>
				</div>
				<div class="w-full sm:w-auto">
					<Button
						handler="/shop"
						label="Retour boutique"
						btnStyle="LINK"
						btnSize="MEDIUM"
					/>
				</div>
			</div>
		</section>

		<section v-if="isLoggedIn" class="max-w-3xl mx-auto space-y-6">
			<div class="bg-surface rounded-3xl p-8 space-y-2">
				<h1 class="text-4xl font-bold font-title">
					Mes commandes réclamées
				</h1>
				<p class="text-muted">
					Retrouvez ici toutes les commandes associées à votre compte.
				</p>
			</div>

			<div
				v-if="claimedOrdersError"
				class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
			>
				{{ claimedOrdersError }}
			</div>

			<div
				v-else-if="isClaimedOrdersLoading"
				class="bg-surface rounded-3xl p-8 text-center text-gray-600"
			>
				Chargement de vos commandes...
			</div>

			<div
				v-else-if="claimedOrders.length === 0"
				class="bg-surface rounded-3xl p-8 space-y-4"
			>
				<p class="text-gray-700">
					Aucune commande n'est encore réclamée sur votre compte.
				</p>
				<div class="w-full sm:w-auto">
					<Button
						handler="/shop"
						label="Aller à la boutique"
						btnStyle="PRIMARY"
						btnSize="MEDIUM"
					/>
				</div>
			</div>

			<div v-else class="space-y-4">
				<article
					v-for="order in claimedOrders"
					:key="order.id"
					class="bg-surface rounded-3xl p-6 space-y-4"
				>
					<div class="flex justify-between gap-4 flex-wrap">
						<div>
							<p class="text-sm text-muted">Commande</p>
							<p class="text-lg font-bold">
								{{ order.orderCode }}
							</p>
						</div>
						<div class="text-right">
							<p class="text-sm text-muted">Statut</p>
							<p class="font-semibold">
								{{ statusLabel[order.status] }}
							</p>
						</div>
					</div>

					<div class="grid sm:grid-cols-2 gap-2 text-sm">
						<p>
							<strong>Produit:</strong>
							{{ order.itemName || "Produit" }}
						</p>
						<p>
							<strong>Variante:</strong>
							{{ order.variantName || "-" }}
						</p>
						<p>
							<strong>Quantité:</strong>
							{{ order.quantity }}
						</p>
						<p>
							<strong>Date:</strong>
							{{ new Date(order.date).toLocaleString("fr-FR") }}
						</p>
					</div>

					<div class="flex flex-col sm:flex-row gap-3">
						<div class="w-full sm:w-auto">
							<Button
								:handler="getOrderUrl(order)"
								label="Voir le suivi"
								btnStyle="PRIMARY"
								btnSize="MEDIUM"
							/>
						</div>
					</div>
				</article>
			</div>
		</section>
	</main>
</template>
