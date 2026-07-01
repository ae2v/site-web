<script setup lang="ts">
import Navbar from "~/components/layout/Navbar.vue";
import Button from "~/components/Button.vue";
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/vue/20/solid";

import EventCard from "~/components/cards/EventCard.vue";

const { fetchEvents, events, error } = useEvents();

definePageMeta({
	layout: "default",
});

const title = "BDE de Vélizy - Événements";
const description =
	"Liste des événements organisés par le BDE de Vélizy. Découvrez nos événements à venir et passés, et rejoignez-nous pour vivre une expérience étudiante inoubliable !";
const url = "https://ae2v.ejnalo.me/events"; // https://bde-velizy.fr/events
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

onMounted(() => {
	fetchEvents();
});
</script>
<template>
	<Navbar />
	<header
		class="container flex flex-col justify-center gap-8 p-8 pt-32 mx-auto md:pb-16"
	>
		<h1 class="text-5xl font-bold font-title">Événements</h1>
		<p class="text-xl">
			Découvrez les événements à venir. Ceux-ci sont les piliers de notre association, travaillant sans relâche pour organiser des événements mémorables et créer une expérience étudiante inoubliable. Chaque membre apporte sa passion, son énergie et ses compétences uniques pour faire du BDE de Vélizy un lieu de rencontre, de partage et de fun pour tous les étudiants.
			Rejoignez-nous pour vivre une expérience étudiante inoubliable !
		</p>
		<Button
			btnStyle="PRIMARY"
			:handler="'/go/discord'"
			label="Rejoindre Discord"
			btnSize="LARGE"
			:icon="ChatBubbleOvalLeftEllipsisIcon"
		/>
	</header>
	<main class="container min-h-screen mx-auto p-8 space-y-16">
		<section>
			<h2 class="text-4xl font-bold font-title mb-8">À venir</h2>
			<div class="grid gap-4 lg:grid-cols-2">
				<EventCard
					v-for="event in events.filter((e) => new Date(e.date) >= new Date())"
					:event=event
				/>
			</div>
		</section>
		<section>
			<h2 class="text-4xl font-bold font-title mb-8">Passés</h2>
			<div class="grid gap-4 lg:grid-cols-2">
				<EventCard
					v-for="event in events.filter((e) => new Date(e.date) < new Date())"
					:event=event
				/>
			</div>
		</section>
	</main>
</template>
