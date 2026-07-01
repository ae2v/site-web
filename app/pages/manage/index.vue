<script setup lang="ts">
import { ref, onMounted } from "vue";
import Navbar from "~/components/layout/Navbar.vue";
import Button from "~/components/Button.vue";
import { useAuth } from "~/composables/useAuth";

definePageMeta({
	middleware: "auth",
});

const title = "BDE de Vélizy - Gestion";
const description =
	"Découvrez nos événements, nos projets et notre équipe. Rejoignez-nous pour vivre une expérience étudiante inoubliable !";
const url = "https://ae2v.ejnalo.me/manage"; // https://bde-velizy.fr/manage
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

const { user, fetchMe } = useAuth();

const isLoading = ref(true);
const error = ref<string | null>(null);
const stats = ref({
	totalMembers: 0,
	totalEvents: 0,
	totalOrders: 0,
	pendingOrders: 0,
});

const checkAccess = async () => {
	await fetchMe();

	// Check if user has a member account
	if (!user.value?.profile) {
		error.value =
			"Vous devez avoir un compte membre pour accéder à cette page";
		isLoading.value = false;
		return false;
	}

	return true;
};

const loadStats = async () => {
	try {
		const [members, events, orders] = await Promise.all([
			$fetch("/api/members").then((res: any) =>
				Array.isArray(res) ? res.length : res.members?.length || 0,
			),
			$fetch("/api/events").then((res: any) =>
				Array.isArray(res) ? res.length : res.events?.length || 0,
			),
			$fetch("/api/shop/orders").then((res: any) => {
				const allOrders = Array.isArray(res) ? res : res.orders || [];
				return {
					total: allOrders.length,
					pending: allOrders.filter(
						(o: any) =>
							o.status === "PENDING" || o.status === "RESERVED",
					).length,
				};
			}),
		]);

		stats.value = {
			totalMembers: members,
			totalEvents: events,
			totalOrders: orders.total,
			pendingOrders: orders.pending,
		};
	} catch (err) {
		console.error("Failed to load stats:", err);
	} finally {
		isLoading.value = false;
	}
};

onMounted(async () => {
	const hasAccess = await checkAccess();
	if (hasAccess) {
		await loadStats();
	}
});
</script>

<template>
	<Navbar />
	<main class="container mx-auto p-8">
		<h1 class="text-4xl font-bold font-title mb-8">Tableau de bord</h1>

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

		<!-- Stats Grid -->
		<div
			v-else-if="!error"
			class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8"
		>
			<!-- Members Card -->
			<div class="bg-surface rounded-3xl p-8">
				<p class="text-gray-600 mb-2">Membres</p>
				<p class="text-4xl font-bold font-title text-emerald-600">
					{{ stats.totalMembers }}
				</p>
				<p class="text-sm text-muted mt-4">
					<NuxtLink
						to="/manage/members"
						class="text-primary hover:underline"
					>
						Gérer →
					</NuxtLink>
				</p>
			</div>

			<!-- Events Card -->
			<div class="bg-surface rounded-3xl p-8">
				<p class="text-gray-600 mb-2">Événements</p>
				<p class="text-4xl font-bold font-title text-blue-600">
					{{ stats.totalEvents }}
				</p>
				<p class="text-sm text-muted mt-4">
					<NuxtLink
						to="/manage/events"
						class="text-primary hover:underline"
					>
						Gérer →
					</NuxtLink>
				</p>
			</div>

			<!-- Pending Orders Card -->
			<div class="bg-surface rounded-3xl p-8">
				<p class="text-gray-600 mb-2">Commandes en attente</p>
				<p class="text-4xl font-bold font-title text-orange-600">
					{{ stats.pendingOrders }}
				</p>
				<p class="text-sm text-muted mt-4">
					<NuxtLink
						to="/manage/orders"
						class="text-primary hover:underline"
					>
						Voir →
					</NuxtLink>
				</p>
			</div>

			<!-- Total Orders Card -->
			<div class="bg-surface rounded-3xl p-8 lg:max-xl:hidden">
				<p class="text-gray-600 mb-2">Total des commandes</p>
				<p class="text-4xl font-bold font-title text-rose-600">
					{{ stats.totalOrders }}
				</p>
				<p class="text-sm text-muted mt-4">
					{{
						isNaN((stats.pendingOrders / stats.totalOrders) * 100)
							? 0
							: (
									(stats.pendingOrders / stats.totalOrders) *
									100
								).toFixed(0)
					}}% en attente
				</p>
			</div>
		</div>

		<!-- Quick Actions -->
		<div v-if="!error && !isLoading" class="grid gap-6 lg:grid-cols-2">
			<div class="bg-surface rounded-3xl p-8">
				<h2 class="text-xl font-bold font-title mb-4">Accès rapide</h2>
				<div class="flex gap-4">
					<Button
						handler="/manage/orders"
						label="Voir les commandes"
						btnStyle="PRIMARY"
						btnSize="MEDIUM"
					/>
					<Button
						handler="/shop/manage"
						label="Gérer la boutique"
						btnStyle="LINK"
						btnSize="MEDIUM"
					/>
				</div>
			</div>

			<div class="bg-surface rounded-3xl p-8">
				<h2 class="text-xl font-bold font-title mb-4">
					Membres de direction
				</h2>
				<p class="text-gray-600 mb-4">
					Accès aux pages de gestion réservées à la direction
				</p>
				<div class="flex flex-col gap-2">
					<Button
						v-if="user?.profile?.pole === 'DIRECTION'"
						handler="/manage/members"
						label="Gérer les membres"
						btnStyle="PRIMARY"
						btnSize="MEDIUM"
					/>
					<Button
						v-if="user?.profile?.pole === 'DIRECTION'"
						handler="/manage/events"
						label="Gérer les événements"
						btnStyle="PRIMARY"
						btnSize="MEDIUM"
					/>
					<p v-else class="text-muted text-sm">
						Accès réservé à la direction
					</p>
				</div>
			</div>
		</div>
	</main>
</template>
