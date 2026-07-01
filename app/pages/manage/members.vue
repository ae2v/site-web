<script setup lang="ts">
import { ref, onMounted } from "vue";
import Navbar from "~/components/layout/Navbar.vue";
import Button from "~/components/Button.vue";
import { useAuth } from "~/composables/useAuth";
import { useMembers } from "~/composables/useMembers";

definePageMeta({
	middleware: "auth",
});

const title = "BDE de Vélizy - Gestion des membres";
const description =
	"Découvrez nos événements, nos projets et notre équipe. Rejoignez-nous pour vivre une expérience étudiante inoubliable !";
const url = "https://ae2v.ejnalo.me/manage/members"; // https://bde-velizy.fr/manage/members
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

const { user } = useAuth();
const { loading, error, members, fetchMembers } = await useMembers();

const textError = ref<string | null>(null);
const searchQuery = ref("");

const checkAccess = async () => {
	// Check if user has a member account
	if (!user.value?.profile) {
		textError.value =
			"Vous devez avoir un compte membre pour accéder à cette page";
		loading.value = false;
		return false;
	}

	// Check if user is DIRECTION
	if (user.value.profile.pole !== "DIRECTION") {
		textError.value =
			"Vous n'avez pas accès à cette page. Seuls les membres de la direction peuvent gérer les membres.";
		loading.value = false;
		return false;
	}

	return true;
};

const filteredMembers = computed(() => {
	if (!searchQuery.value) return members.value;

	const query = searchQuery.value.toLowerCase();
	return members.value.filter(
		(m) =>
			m.firstName.toLowerCase().includes(query) ||
			m.lastName.toLowerCase().includes(query) ||
			m.discord?.toLowerCase().includes(query),
	);
});

onMounted(async () => {
	const hasAccess = await checkAccess();
	if (hasAccess) {
		await fetchMembers();
	}
});
</script>

<template>
	<Navbar />
	<header
		v-if="!loading && !textError && !error"
		class="container flex mx-auto p-8 items-center"
	>
		<div class="grow w-3/4 py-16">
			<h1 class="text-5xl font-bold font-title">Gestion des membres</h1>
		</div>

		<!-- Stats -->
		<div class="col-start-1 col-span-1 grid gap-4 sm:grid-cols-2">
			<div class="bg-surface rounded-3xl p-6">
				<p class="text-gray-600 mb-2">Total</p>
				<p class="text-4xl font-bold font-title text-primary">
					{{ members.length }}
				</p>
			</div>

			<div class="bg-surface rounded-3xl p-6">
				<p class="text-gray-600 mb-2">Direction</p>
				<p class="text-4xl font-bold font-title text-muted">
					{{ members.filter((m) => m.pole === "DIRECTION").length }}
				</p>
			</div>

			<div class="bg-surface rounded-3xl p-6">
				<p class="text-gray-600 mb-2">Communication</p>
				<p class="text-4xl font-bold font-title text-muted">
					{{
						members.filter((m) => m.pole === "COMMUNICATION").length
					}}
				</p>
			</div>

			<div class="bg-surface rounded-3xl p-6">
				<p class="text-gray-600 mb-2">Développement</p>
				<p class="text-4xl font-bold font-title text-muted">
					{{
						members.filter((m) => m.pole === "DÉVELOPPEMENT").length
					}}
				</p>
			</div>
		</div>
	</header>

	<main class="container mx-auto p-8">
		<section class="flex justify-between items-center mb-8">
			<h1 class="text-4xl font-bold font-title">Gestion des membres</h1>
			<Button
				handler="/manage"
				label="← Retour"
				btnStyle="LINK"
				btnSize="MEDIUM"
			/>
		</section>

		<!-- Error State -->
		<section
			v-if="textError && !loading"
			class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8"
		>
			{{ textError }}
		</section>

		<!-- Loading State -->
		<section v-if="loading" class="text-center py-16">
			<p class="text-xl text-gray-600">Chargement...</p>
		</section>

		<!-- Content -->
		<section v-else-if="!error" class="grid grid-cols-4 items-start gap-8">
			<!-- Search Bar -->
			<Input
				v-model="searchQuery"
				type="text"
				placeholder="Rechercher un membre (nom, prénom, discord)..."
				class="col-span-4"
			/>

			<!-- Stats -->

			<!-- Members Table -->
			<div class="col-span-4 max-h-96 overflow-y-auto overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr>
							<th class="px-6 py-4 text-left font-semibold">

							</th>
							<th class="px-6 py-4 text-left font-semibold">
								Nom
							</th>
							<th class="px-6 py-4 text-left font-semibold">
								Prénom
							</th>
							<th class="px-6 py-4 text-left font-semibold">
								Pôle
							</th>
							<th class="px-6 py-4 text-left font-semibold">
								Rôle
							</th>
							<th class="px-6 py-4 text-left font-semibold">
								Département
							</th>
							<th class="px-6 py-4 text-left font-semibold">
								Discord
							</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="member in filteredMembers" :key="member.id">
							<td class="px-6 py-4">{{ member.id }}</td>
							<td class="px-6 py-4">{{ member.lastName }}</td>
							<td class="px-6 py-4">{{ member.firstName }}</td>
							<td class="px-6 py-4">
								<span
									class="px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs"
								>
									{{ member.pole }}
								</span>
							</td>
							<td class="px-6 py-4">{{ member.role }}</td>
							<td class="px-6 py-4">{{ member.department }}</td>
							<td class="px-6 py-4">
								{{ member.discord || "-" }}
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Empty State -->
			<div
				v-if="filteredMembers.length === 0"
				class="col-span-4 text-center py-16"
			>
				<p class="text-xl text-gray-600">Aucun membre trouvé</p>
			</div>
		</section>
	</main>
</template>
