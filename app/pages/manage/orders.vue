<script setup lang="ts">
import { ref, onMounted } from "vue";
import Navbar from "~/components/layout/Navbar.vue";
import Button from "~/components/Button.vue";
import { useAuth } from "~/composables/useAuth";
import type { Order, OrderStatus } from "~~/shared/models/shop";

definePageMeta({
	middleware: "auth",
});

const title = "BDE de Vélizy - Gestion des commandes";
const description =
	"Découvrez nos événements, nos projets et notre équipe. Rejoignez-nous pour vivre une expérience étudiante inoubliable !";
const url = "https://ae2v.ejnalo.me/manage/orders"; // https://bde-velizy.fr/manage/orders
const image = "/hero_bde.jpg";

useSeoMeta({
	// SEO
	title,
	description,
	robots: "index, follow",

	// Open Graph
	ogTitle: title,
	ogDescription: description,
	ogType: "website",
	ogUrl: url,
	ogImage: image,
	ogSiteName: "BDE de Vélizy",
	ogLocale: "fr_FR",

	// Twitter
	twitterCard: "summary_large_image",
	twitterTitle: title,
	twitterDescription: description,
	twitterImage: image,
});

useHead({
	htmlAttrs: {
		lang: "fr",
	},
	link: [
		{
			rel: "canonical",
			href: url,
		},
		{
			rel: "icon",
			href: "/favicon.ico",
		},
	],
	meta: [
		{
			name: "theme-color",
			content: "#de0a2d",
		},
	],
});

interface OrderWithDetails extends Order {
	itemName?: string;
	variantName?: string;
	customerName?: string;
}

const { user } = useAuth();

const isLoading = ref(true);
const error = ref<string | null>(null);
const orders = ref<OrderWithDetails[]>([]);
const selectedStatus = ref<OrderStatus | "ALL">("ALL");

const statusColors: Record<OrderStatus, string> = {
	PENDING: "bg-amber-100 text-amber-800",
	RESERVED: "bg-indigo-100 text-indigo-800",
	READY: "bg-sky-100 text-sky-800",
	COMPLETED: "bg-emerald-100 text-emerald-800",
	CANCELED: "bg-red-100 text-red-800",
};

const checkAccess = async () => {
	// Check if user has a member account
	if (!user.value?.profile) {
		error.value =
			"Vous devez avoir un compte membre pour accéder à cette page";
		isLoading.value = false;
		return false;
	}

	return true;
};

const loadOrders = async () => {
	try {
		const res = await $fetch<Order[] | { orders?: Order[] }>(
			"/api/shop/orders",
		);
		orders.value = Array.isArray(res) ? res : res.orders || [];
	} catch (err) {
		console.error("Failed to load orders:", err);
		error.value = "Impossible de charger la liste des commandes";
	} finally {
		isLoading.value = false;
	}
};

const filteredOrders = computed(() => {
	if (selectedStatus.value === "ALL") return orders.value;
	return orders.value.filter((o) => o.status === selectedStatus.value);
});

const updateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
	try {
		await $fetch(`/api/shop/orders/${orderId}`, {
			method: "PUT",
			body: { status: newStatus },
		});

		// Update local state
		const order = orders.value.find((o) => o.id === orderId);
		if (order) {
			order.status = newStatus;
		}
	} catch (err) {
		console.error("Failed to update order status:", err);
		alert("Impossible de mettre à jour le statut de la commande");
	}
};

onMounted(async () => {
	const hasAccess = await checkAccess();
	if (hasAccess) {
		await loadOrders();
	}
});
</script>

<template>
	<Navbar />
	<main class="container mx-auto p-8">
		<div class="flex justify-between items-center mb-8">
			<h1 class="text-4xl font-bold font-title">Gestion des commandes</h1>
			<Button
				handler="/manage"
				label="← Retour"
				btnStyle="LINK"
				btnSize="MEDIUM"
			/>
		</div>

		<!-- Error State -->
		<div
			v-if="error && !isLoading"
			class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8"
		>
			{{ error }}
		</div>

		<!-- Loading State -->
		<div v-if="isLoading" class="text-center py-16">
			<p class="text-xl text-gray-600">Chargement...</p>
		</div>

		<!-- Content -->
		<div v-else-if="!error" class="space-y-6">
			<!-- Filter by Status -->
			<div class="bg-surface rounded-3xl p-8">
				<p class="font-semibold mb-4">Filtrer par statut:</p>
				<div class="flex flex-wrap gap-2">
					<button
						@click="selectedStatus = 'ALL'"
						:class="
							selectedStatus === 'ALL'
								? 'bg-primary text-white'
								: 'bg-gray-200 text-gray-800'
						"
						class="px-4 py-2 rounded-lg transition"
					>
						Tous
					</button>
					<button
						@click="selectedStatus = 'PENDING'"
						:class="
							selectedStatus === 'PENDING'
								? 'bg-amber-500 text-white'
								: 'bg-amber-100 text-amber-800'
						"
						class="px-4 py-2 rounded-lg transition"
					>
						En attente
					</button>
					<button
						@click="selectedStatus = 'RESERVED'"
						:class="
							selectedStatus === 'RESERVED'
								? 'bg-indigo-500 text-white'
								: 'bg-indigo-100 text-indigo-800'
						"
						class="px-4 py-2 rounded-lg transition"
					>
						Réservé
					</button>
					<button
						@click="selectedStatus = 'READY'"
						:class="
							selectedStatus === 'READY'
								? 'bg-sky-500 text-white'
								: 'bg-sky-100 text-sky-800'
						"
						class="px-4 py-2 rounded-lg transition"
					>
						Prêt
					</button>
					<button
						@click="selectedStatus = 'COMPLETED'"
						:class="
							selectedStatus === 'COMPLETED'
								? 'bg-emerald-500 text-white'
								: 'bg-emerald-100 text-emerald-800'
						"
						class="px-4 py-2 rounded-lg transition"
					>
						Complété
					</button>
					<button
						@click="selectedStatus = 'CANCELED'"
						:class="
							selectedStatus === 'CANCELED'
								? 'bg-red-500 text-white'
								: 'bg-red-100 text-red-800'
						"
						class="px-4 py-2 rounded-lg transition"
					>
						Annulé
					</button>
				</div>
			</div>

			<!-- Orders List -->
			<div class="space-y-4">
				<div
					v-for="order in filteredOrders"
					:key="order.id"
					class="bg-surface rounded-3xl p-6 hover:shadow-lg transition"
				>
					<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<!-- Order Info -->
						<div>
							<p class="text-gray-600 text-sm">
								Commande #{{ order.id }}
							</p>
							<p class="text-xl font-bold font-title">
								{{ order.itemName || "Produit" }}
							</p>
							<p class="text-gray-600 text-sm mt-2">
								{{ order.variantName || "Variante" }} ×
								{{ order.quantity }}
							</p>
							<p class="text-gray-600 text-sm">
								{{
									new Date(order.date).toLocaleDateString(
										"fr-FR",
									)
								}}
							</p>
						</div>

						<!-- Customer Info -->
						<div>
							<p class="text-gray-600 text-sm">Client</p>
							<p class="text-lg font-semibold">
								{{ order.customerName || "Inconnu" }}
							</p>
							<p class="text-gray-600 text-sm">
								{{ order.customerEmail || "-" }}
							</p>
						</div>

						<!-- Status & Actions -->
						<div class="flex flex-col justify-between">
							<div>
								<p class="text-gray-600 text-sm mb-2">Statut</p>
								<span
									:class="statusColors[order.status]"
									class="px-3 py-1 rounded-full text-sm font-semibold"
								>
									{{ order.status }}
								</span>
							</div>

							<div
								v-if="
									order.status !== 'COMPLETED' &&
									order.status !== 'CANCELED'
								"
								class="flex gap-2 mt-4"
							>
								<select
									:value="order.status"
									@change="
										(e: Event) =>
											updateOrderStatus(
												order.id,
												(e.target as HTMLSelectElement)
													.value as OrderStatus,
											)
									"
									class="flex-1 px-3 py-2 border rounded-lg focus:outline-none"
								>
									<option value="PENDING">En attente</option>
									<option value="RESERVED">Réservé</option>
									<option value="READY">Prêt</option>
									<option value="COMPLETED">Complété</option>
									<option value="CANCELED">Annulé</option>
								</select>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Empty State -->
			<div v-if="filteredOrders.length === 0" class="text-center py-16">
				<p class="text-xl text-gray-600">Aucune commande trouvée</p>
			</div>

			<!-- Stats -->
			<div class="grid gap-6 lg:grid-cols-5 mt-8">
				<div class="bg-surface rounded-3xl p-8">
					<p class="text-gray-600 mb-2">Total</p>
					<p class="text-4xl font-bold font-title">
						{{ orders.length }}
					</p>
				</div>

				<div class="bg-surface rounded-3xl p-8">
					<p class="text-gray-600 mb-2">En attente</p>
					<p class="text-4xl font-bold font-title text-amber-600">
						{{
							orders.filter((o) => o.status === "PENDING").length
						}}
					</p>
				</div>

				<div class="bg-surface rounded-3xl p-8">
					<p class="text-gray-600 mb-2">Réservé</p>
					<p class="text-4xl font-bold font-title text-indigo-600">
						{{
							orders.filter((o) => o.status === "RESERVED").length
						}}
					</p>
				</div>

				<div class="bg-surface rounded-3xl p-8">
					<p class="text-gray-600 mb-2">Prêt</p>
					<p class="text-4xl font-bold font-title text-sky-600">
						{{ orders.filter((o) => o.status === "READY").length }}
					</p>
				</div>

				<div class="bg-surface rounded-3xl p-8">
					<p class="text-gray-600 mb-2">Complété</p>
					<p class="text-4xl font-bold font-title text-emerald-600">
						{{
							orders.filter((o) => o.status === "COMPLETED")
								.length
						}}
					</p>
				</div>
			</div>
		</div>
	</main>
</template>
