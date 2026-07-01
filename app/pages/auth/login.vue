<script setup>
import { AtSymbolIcon, KeyIcon } from "@heroicons/vue/24/solid";

import Navbar from "~/components/layout/Navbar.vue";

const { login, user, error } = useAuth();

const email = ref("");
const password = ref("");
const loading = ref(false);

const submit = async () => {
	loading.value = true;
	try {
		await login({ email: email.value, password: password.value });
	} finally {
		loading.value = false;
	}
};

const title = "BDE de Vélizy - Connexion";
const description =
	"Découvrez nos événements, nos projets et notre équipe. Rejoignez-nous pour vivre une expérience étudiante inoubliable !";
const url = "https://ae2v.ejnalo.me/auth/login"; // https://bde-velizy.fr/auth/login
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
	<main class="container flex items-center gap-0 mx-auto md:p-8">
		<section class="flex-1 py-16 px-8 space-y-8">
			<h1 class="text-5xl font-bold font-title">Connexion</h1>
			<form @submit.prevent="submit" class="flex flex-col gap-4">
				<Input
					v-model="email"
					:icon="AtSymbolIcon"
					type="email"
					label="Email"
					required
				/>
				<Input
					v-model="password"
					:icon="KeyIcon"
					type="password"
					label="Mot de passe"
					required
				/>
				<Button
					:handler="submit"
					label="Se connecter"
					btnStyle="PRIMARY"
					btnSize="MEDIUM"
					:disabled="loading"
				/>
				<div
					v-if="error && !error.message.includes('bearer')"
					class="text-red-500 mt-2"
				>
					<span v-if="error.message.includes('Invalid')"
						>Nom d'utilisateur ou mot de passe incorrect.</span
					>
					<span v-else-if="error.message.includes('Missing')"
						>Nom d'utilisateur ou mot de passe manquants.</span
					>
					<span v-else
						>Une erreur est survenue. Veuillez réessayer.</span
					>
				</div>
				<div class="text-sm mt-2">
					Vous n'avez pas de compte ?
					<RouterLink to="/auth/register" class="text-primary"
						>Inscrivez-vous</RouterLink
					>
				</div>
			</form>
			<div v-if="user" class="mt-4">
				Connecté en tant que: {{ user.email || user.name }}
			</div>
		</section>
		<section class="flex-1 py-16 px-8 space-y-8">
			<p class="text-xl">
				Connectez-vous pour accéder à votre compte et gérer vos
				événements, vos membres et plus encore. En vous connectant, vous
				pourrez profiter de toutes les fonctionnalités exclusives
				réservées aux membres du BDE de Vélizy. Rejoignez-nous pour
				vivre une expérience étudiante inoubliable !
			</p>
		</section>
	</main>
</template>
