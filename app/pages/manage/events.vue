<script setup lang="ts">
import { ref, onMounted } from "vue";
import Navbar from "~/components/layout/Navbar.vue";
import Button from "~/components/Button.vue";
import { useAuth } from "~/composables/useAuth";
import type { Event } from "~~/shared/models/events";

definePageMeta({
	middleware: "auth",
});

const { user } = useAuth();

const isLoading = ref(true);
const error = ref<string | null>(null);
const events = ref<Event[]>([]);
const searchQuery = ref("");

const checkAccess = async () => {
	// Check if user has a member account
	if (!user.value?.profile) {
		error.value =
			"Vous devez avoir un compte membre pour accéder à cette page";
		isLoading.value = false;
		return false;
	}

	// Check if user is DIRECTION
	if (user.value.profile.pole !== "DIRECTION") {
		error.value =
			"Vous n'avez pas accès à cette page. Seuls les membres de la direction peuvent gérer les événements.";
		isLoading.value = false;
		return false;
	}

	return true;
};

const loadEvents = async () => {
	try {
		const res = await $fetch<{ events: Event[] }>("/api/events");
		events.value = res.events || [];
	} catch (err) {
		console.error("Failed to load events:", err);
		error.value = "Impossible de charger la liste des événements";
	} finally {
		isLoading.value = false;
	}
};

const filteredEvents = computed(() => {
	if (!searchQuery.value) return events.value;

	const query = searchQuery.value.toLowerCase();
	return events.value.filter(
		(e) =>
			e.title.toLowerCase().includes(query) ||
			e.description?.toLowerCase().includes(query) ||
			e.location?.toLowerCase().includes(query),
	);
});

const deleteEvent = async (eventId: number) => {
	if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;

	try {
		await $fetch(`/api/events/${eventId}`, { method: "DELETE" });
		events.value = events.value.filter((e) => e.id !== eventId);
	} catch (err) {
		console.error("Failed to delete event:", err);
		alert("Impossible de supprimer l'événement");
	}
};

onMounted(async () => {
	const hasAccess = await checkAccess();
	if (hasAccess) {
		await loadEvents();
	}
});
</script>

<template>
	<Navbar />
	<main class="container mx-auto p-8">
		<div class="flex justify-between items-center mb-8">
			<h1 class="text-4xl font-bold font-title">
				Gestion des événements
			</h1>
			<div class="flex gap-4">
				<Button
					handler="/events/new"
					label="+ Nouvel événement"
					btnStyle="PRIMARY"
					btnSize="MEDIUM"
				/>
				<Button
					handler="/manage"
					label="← Retour"
					btnStyle="LINK"
					btnSize="MEDIUM"
				/>
			</div>
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
			<!-- Search Bar -->
			<div class="bg-surface rounded-3xl p-8">
				<input
					v-model="searchQuery"
					type="text"
					placeholder="Rechercher un événement (nom, description, lieu)..."
					class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
				/>
			</div>

			<!-- Events Grid -->
			<div class="grid gap-6 lg:grid-cols-2">
				<div
					v-for="event in filteredEvents"
					:key="event.id"
					class="bg-surface rounded-3xl p-8 hover:shadow-lg transition"
				>
					<div class="flex justify-between items-start mb-4">
						<h3 class="text-2xl font-bold font-title flex-1">
							{{ event.title }}
						</h3>
					</div>

					<p class="text-gray-600 mb-4">{{ event.description }}</p>

					<div class="space-y-2 text-sm text-gray-600 mb-6">
						<p v-if="event.date">
							<span class="font-semibold">Date:</span>
							{{
								new Date(event.date).toLocaleDateString("fr-FR")
							}}
						</p>
						<p v-if="event.date">
							<span class="font-semibold">Heure:</span>
							{{ event.date }}
						</p>
						<p v-if="event.location">
							<span class="font-semibold">Lieu:</span>
							{{ event.location }}
						</p>
					</div>

					<div class="flex gap-4">
						<Button
							:handler="`/events/${event.id}`"
							label="Voir"
							btnStyle="PRIMARY"
							btnSize="MEDIUM"
						/>
						<Button
							:handler="`/events/edit/${event.id}`"
							label="Éditer"
							btnStyle="LINK"
							btnSize="MEDIUM"
						/>
						<button
							@click="deleteEvent(event.id)"
							class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold"
						>
							Supprimer
						</button>
					</div>
				</div>
			</div>

			<!-- Empty State -->
			<div v-if="filteredEvents.length === 0" class="text-center py-16">
				<p class="text-xl text-gray-600">Aucun événement trouvé</p>
				<Button
					handler="/events/new"
					label="Créer un événement"
					btnStyle="PRIMARY"
					btnSize="MEDIUM"
				/>
			</div>

			<!-- Stats -->
			<div class="grid gap-6 lg:grid-cols-3 mt-8">
				<div class="bg-surface rounded-3xl p-8">
					<p class="text-gray-600 mb-2">Total des événements</p>
					<p class="text-4xl font-bold font-title text-emerald-600">
						{{ events.length }}
					</p>
				</div>

				<div class="bg-surface rounded-3xl p-8">
					<p class="text-gray-600 mb-2">À venir</p>
					<p class="text-4xl font-bold font-title text-blue-600">
						{{
							events.filter((e) => new Date(e.date) > new Date())
								.length
						}}
					</p>
				</div>

				<div class="bg-surface rounded-3xl p-8">
					<p class="text-gray-600 mb-2">Passés</p>
					<p class="text-4xl font-bold font-title text-gray-600">
						{{
							events.filter((e) => new Date(e.date) <= new Date())
								.length
						}}
					</p>
				</div>
			</div>
		</div>
	</main>
</template>
