<script setup lang="ts">
import Navbar from "~/components/layout/Navbar.vue";
import Button from "~/components/Button.vue";
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/vue/20/solid";

import MemberCard from "~/components/cards/MemberCard.vue";

const { fetchMembers, members, error } = await useMembers();

definePageMeta({
	layout: "default",
});

const title = "BDE de Vélizy - Membres";
const description =
	"Découvrez nos événements, nos projets et notre équipe. Rejoignez-nous pour vivre une expérience étudiante inoubliable !";
const url = "https://ae2v.ejnalo.me/members"; // https://bde-velizy.fr/members
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
	fetchMembers();
});

const order = [
	"Président",
	"Vice-président",
	"Trésorier",
	"Secrétaire",
]
</script>
<template>
	<Navbar />
	<header
		class="container flex flex-col justify-center gap-8 p-8 pt-32 mx-auto md:pb-16"
	>
		<h1 class="text-5xl font-bold font-title">Membres du BDE</h1>
		<p class="text-xl">
			Découvrez les membres de notre équipe. Ceux-ci sont les piliers de notre association, travaillant sans relâche pour organiser des événements mémorables et créer une expérience étudiante inoubliable. Chaque membre apporte sa passion, son énergie et ses compétences uniques pour faire du BDE de Vélizy un lieu de rencontre, de partage et de fun pour tous les étudiants.
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
			<h2 class="text-4xl font-bold font-title mb-8">Direction</h2>
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				<MemberCard
					v-for="member in members.filter((m) => m.pole === 'DIRECTION').sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role))"
					:member=member
				/>
			</div>
		</section>
		<section>
			<h2 class="text-4xl font-bold font-title mb-8">Membres</h2>
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				<MemberCard
					v-for="member in members.filter((m) => m.pole !== 'DIRECTION')"
					:member=member
				/>
			</div>
		</section>
	</main>
</template>
