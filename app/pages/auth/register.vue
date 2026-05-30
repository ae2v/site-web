<script setup>
import { AtSymbolIcon, IdentificationIcon, KeyIcon, UserIcon } from "@heroicons/vue/24/solid";

import Navbar from "~/components/layout/Navbar.vue";

const { signup, user, error } = useAuth();

const firstName = ref("");
const lastName = ref("");
const studentId = ref("");
const email = ref("");
const password = ref("");
const loading = ref(false);

const submit = async () => {
	loading.value = true;
	try {
		await signup({
			firstName: firstName.value,
			lastName: lastName.value,
			studentId: studentId.value,
			email: email.value,
			password: password.value,
		});
	} finally {
		loading.value = false;
	}
};
</script>
<template>
	<Navbar />
	<main class="container flex items-center gap-0 mx-auto md:p-8">
		<section class="flex-1 py-16 px-8 space-y-8">
			<h1 class="text-5xl font-bold font-title">Inscription</h1>
			<form @submit.prevent="submit" class="flex flex-col gap-4">
				<Input
					v-model="firstName"
					:icon="UserIcon"
					type="text"
					label="Prénom"
					required
				/>
				<Input
					v-model="lastName"
					:icon="UserIcon"
					type="text"
					label="Nom"
					required
				/>
				<Input
					v-model="studentId"
					:icon="IdentificationIcon"
					type="text"
					label="Numéro d'étudiant"
					required
				/>
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
					label="Créer un compte"
					btnStyle="PRIMARY"
					btnSize="MEDIUM"
					:disabled="loading"
				/>
				<div
					v-if="error && !error.message.includes('bearer')"
					class="text-red-500 mt-2"
				>
					<span v-if="error.message.includes('Invalid')"
						>Informations invalides.</span
					>
					<span v-else-if="error.message.includes('Missing')"
						>Veuillez compléter tous les champs obligatoires.</span
					>
					<span v-else
						>Une erreur est survenue. Veuillez réessayer.</span
					>
				</div>
				<div class="text-sm mt-2">
					Vous avez déjà un compte ?
					<RouterLink to="/auth/login" class="text-primary"
						>Connectez-vous</RouterLink
					>
				</div>
			</form>
			<div v-if="user" class="mt-4">
				Connecté en tant que: {{ user.email || user.name }}
			</div>
		</section>
		<section class="flex-1 py-16 px-8 space-y-8">
			<p class="text-xl">
				Créez votre compte pour accéder à votre espace, suivre vos
				événements, vos membres et plus encore. En vous inscrivant, vous
				pourrez profiter de toutes les fonctionnalités réservées aux
				membres du BDE de Vélizy.
			</p>
			<p class="text-xl">
				Ces informations seront utilisées afin que vous puissiez prouver
				votre identité lors des différentes transactions que vous
				pourriez faire sur le site (inscription à un événement, achat de
				goodies, etc...). Nous nous engageons à ne pas partager vos
				informations personnelles avec des tiers et à les protéger
				conformément à notre
				<RouterLink to="/privacy-policy" class="text-primary"
					>politique de confidentialité</RouterLink
				>.
			</p>
		</section>
	</main>
</template>
