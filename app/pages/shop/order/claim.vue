<script setup lang="ts">
import Navbar from "~/components/layout/Navbar.vue";
import Button from "~/components/Button.vue";

const route = useRoute();
const { user, fetchMe } = useAuth();

const isLoading = ref(true);
const isClaiming = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

const orderId = computed(() => Number(route.query.id));
const orderCode = computed(() => {
	const value = route.query.code;
	return typeof value === "string" ? value.trim().toUpperCase() : "";
});
const orderEmail = computed(() => {
	const value = route.query.email;
	return typeof value === "string" ? value.trim().toLowerCase() : "";
});

const loginUrl = computed(
	() => `/auth/login?redirect=${encodeURIComponent(route.fullPath)}`,
);

const orderDetailsUrl = computed(() => {
	if (Number.isNaN(orderId.value) || !orderCode.value) {
		return "/shop/order";
	}

	const emailQuery = orderEmail.value
		? `&email=${encodeURIComponent(orderEmail.value)}`
		: "";

	return `/shop/order/${orderId.value}?code=${encodeURIComponent(orderCode.value)}${emailQuery}`;
});

const claimOrder = async () => {
	if (Number.isNaN(orderId.value)) {
		error.value = "Identifiant de commande invalide";
		return;
	}

	if (!orderCode.value) {
		error.value = "Le code de commande est requis";
		return;
	}

	isClaiming.value = true;
	error.value = null;
	success.value = null;

	try {
		await $fetch("/api/shop/orders/claim", {
			method: "POST",
			body: {
				id: orderId.value,
				code: orderCode.value,
			},
		});

		success.value = "Votre commande a été associée à votre compte.";
	} catch (err) {
		const message =
			err instanceof Error
				? err.message
				: "Impossible de réclamer cette commande";

		if (message.includes("already claimed")) {
			error.value = "Cette commande est déjà réclamée.";
		} else if (message.includes("Missing bearer token")) {
			error.value =
				"Vous devez vous connecter pour réclamer cette commande.";
		} else {
			error.value = message;
		}
	} finally {
		isClaiming.value = false;
	}
};

onMounted(async () => {
	await fetchMe().catch(() => undefined);

	if (!user.value) {
		isLoading.value = false;
		return;
	}

	await claimOrder();
	isLoading.value = false;
});

const title = "BDE de Vélizy - Relier une commande";
const description =
	"Associez votre commande à votre compte pour la suivre depuis votre espace. Connectez-vous et réclamez votre commande en toute simplicité.";
const url = "https://ae2v.ejnalo.me/shop/order/claim"; // https://bde-velizy.fr/shop/order/claim
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
</script>
<template>
	<Navbar />
	<main class="container mx-auto p-8 pt-32">
		<section class="max-w-2xl mx-auto bg-surface rounded-3xl p-8 space-y-6">
			<div>
				<h1 class="text-4xl font-bold font-title">
					Réclamer une commande
				</h1>
				<p class="text-muted mt-2">
					Associez cette commande à votre compte pour la suivre depuis
					votre espace.
				</p>
			</div>

			<div v-if="isLoading" class="py-6 text-center text-gray-600">
				Chargement...
			</div>

			<template v-else>
				<div v-if="!user" class="space-y-4">
					<p class="text-gray-700">
						Vous devez vous connecter avant de réclamer cette
						commande.
					</p>
					<div class="flex flex-col sm:flex-row gap-3">
						<div class="w-full sm:w-auto">
							<Button
								:handler="loginUrl"
								label="Se connecter"
								btnStyle="PRIMARY"
								btnSize="MEDIUM"
							/>
						</div>
						<div class="w-full sm:w-auto">
							<Button
								handler="/shop/order"
								label="Retour"
								btnStyle="LINK"
								btnSize="MEDIUM"
							/>
						</div>
					</div>
				</div>

				<div v-else class="space-y-4">
					<p
						v-if="success"
						class="text-green-700 bg-green-100 border border-green-300 rounded-xl px-4 py-3"
					>
						{{ success }}
					</p>
					<p
						v-else-if="error"
						class="text-red-700 bg-red-100 border border-red-300 rounded-xl px-4 py-3"
					>
						{{ error }}
					</p>
					<p
						v-else
						class="text-gray-700 bg-gray-100 border border-gray-200 rounded-xl px-4 py-3"
					>
						Votre commande est en cours de réclamation.
					</p>

					<div class="flex flex-col sm:flex-row gap-3">
						<div class="w-full sm:w-auto">
							<Button
								:handler="claimOrder"
								label="Réclamer maintenant"
								btnStyle="PRIMARY"
								btnSize="MEDIUM"
								:disabled="isClaiming"
							/>
						</div>
						<div class="w-full sm:w-auto">
							<Button
								:handler="orderDetailsUrl"
								label="Voir la commande"
								btnStyle="LINK"
								btnSize="MEDIUM"
							/>
						</div>
					</div>
				</div>
			</template>
		</section>
	</main>
</template>
