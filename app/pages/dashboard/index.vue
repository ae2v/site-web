<script setup lang="ts">
import Navbar from "~/components/layout/Navbar.vue";
import Button from "~/components/Button.vue";
import Input from "~/components/Input.vue";
import Select from "~/components/Select.vue";
import { useAuth } from "~/composables/useAuth";
import type { Department } from "~~/shared/models/member";
import type { OrderStatus } from "~~/shared/models/shop";

definePageMeta({
	middleware: "auth",
});

const title = "BDE de Vélizy - Tableau de bord";
const description =
	"Découvrez nos événements, nos projets et notre équipe. Rejoignez-nous pour vivre une expérience étudiante inoubliable !";
const url = "https://ae2v.ejnalo.me/dashboard"; // https://bde-velizy.fr/dashboard
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

const { user, fetchMe, logout } = useAuth();

const isLoading = ref(true);
const accountSaving = ref(false);
const memberSaving = ref(false);
const cancelingOrders = ref(false);
const wipingData = ref(false);
const pageError = ref<string | null>(null);
const pageSuccess = ref<string | null>(null);

type DashboardTab = "account" | "profile" | "orders";

const tab = ref<DashboardTab>("account");

const tabItems: Array<{
	key: DashboardTab;
	label: string;
	description: string;
}> = [
	{
		key: "account",
		label: "Account",
		description: "Infos personnelles et sécurité",
	},
	{
		key: "profile",
		label: "Profile",
		description: "Fiche membre BDE",
	},
	{
		key: "orders",
		label: "Orders",
		description: "Commandes réclamées",
	},
];

const activeTabDescription = computed(
	() => tabItems.find((item) => item.key === tab.value)?.description ?? "",
);

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
const claimedOrdersLoading = ref(false);
const claimedOrdersError = ref<string | null>(null);

const accountForm = reactive({
	firstName: "",
	lastName: "",
	email: "",
	studentId: "",
});

const memberForm = reactive({
	firstName: "",
	lastName: "",
	pronouns: "",
	discord: "",
	department: "MMI" as Department,
	promo: new Date().getFullYear(),
	photoUrl: "",
});

const statusLabel: Record<OrderStatus, string> = {
	PENDING: "En attente",
	RESERVED: "Réservée",
	READY: "Prête",
	CANCELED: "Annulée",
	COMPLETED: "Terminée",
};

const memberDepartments: Department[] = ["MMI", "GEII", "INFO", "RT", "MRIT"];
const claimedOrdersEndpoint = ["/api/shop/orders", "mine"].join("/");

const isMember = computed(() => Boolean(user.value?.profile));

const setTab = (value: DashboardTab) => {
	tab.value = value;
};

const fillFormsFromUser = () => {
	if (!user.value) return;

	accountForm.firstName = user.value.account.firstName ?? "";
	accountForm.lastName = user.value.account.lastName ?? "";
	accountForm.email = user.value.account.email ?? "";
	accountForm.studentId = user.value.account.studentId ?? "";

	if (user.value.profile) {
		memberForm.firstName = user.value.profile.firstName ?? "";
		memberForm.lastName = user.value.profile.lastName ?? "";
		memberForm.pronouns = user.value.profile.pronouns ?? "";
		memberForm.discord = user.value.profile.discord ?? "";
		memberForm.department = user.value.profile.department;
		memberForm.promo = user.value.profile.promo;
		memberForm.photoUrl = user.value.profile.photoUrl ?? "";
	}
};

const loadClaimedOrders = async () => {
	claimedOrdersLoading.value = true;
	claimedOrdersError.value = null;

	try {
		const response = await fetch(claimedOrdersEndpoint);

		if (!response.ok) {
			throw new Error("Impossible de charger vos commandes");
		}

		claimedOrders.value = await response.json();
	} catch (error) {
		claimedOrdersError.value =
			error instanceof Error
				? error.message
				: "Impossible de charger vos commandes";
	} finally {
		claimedOrdersLoading.value = false;
	}
};

const refreshUser = async () => {
	await fetchMe();
	fillFormsFromUser();
	if (isMember.value) {
		await loadClaimedOrders();
	}
};

const saveAccount = async () => {
	pageError.value = null;
	pageSuccess.value = null;
	accountSaving.value = true;

	try {
		await $fetch("/api/dashboard/account", {
			method: "PUT",
			body: {
				firstName: accountForm.firstName,
				lastName: accountForm.lastName,
				email: accountForm.email,
				studentId: accountForm.studentId,
			},
		});
		pageSuccess.value = "Informations du compte mises à jour.";
		await refreshUser();
	} catch (error) {
		pageError.value =
			error instanceof Error ? error.message : "Mise à jour impossible";
	} finally {
		accountSaving.value = false;
	}
};

const saveMember = async () => {
	pageError.value = null;
	pageSuccess.value = null;
	memberSaving.value = true;

	try {
		await $fetch("/api/dashboard/member", {
			method: "PUT",
			body: {
				firstName: memberForm.firstName,
				lastName: memberForm.lastName,
				pronouns: memberForm.pronouns,
				discord: memberForm.discord,
				department: memberForm.department,
				promo: memberForm.promo,
				photoUrl: memberForm.photoUrl,
			},
		});
		pageSuccess.value = "Profil membre mis à jour.";
		await refreshUser();
	} catch (error) {
		pageError.value =
			error instanceof Error ? error.message : "Mise à jour impossible";
	} finally {
		memberSaving.value = false;
	}
};

const cancelAllOrders = async () => {
	if (!window.confirm("Annuler toutes vos commandes réclamées ?")) {
		return;
	}

	pageError.value = null;
	pageSuccess.value = null;
	cancelingOrders.value = true;

	try {
		const res = await $fetch<{ ok: boolean; canceledCount: number }>(
			"/api/dashboard/orders/cancel-all",
			{ method: "POST" },
		);
		pageSuccess.value = `${res.canceledCount} commande(s) annulée(s).`;
		await loadClaimedOrders();
	} catch (error) {
		pageError.value =
			error instanceof Error ? error.message : "Annulation impossible";
	} finally {
		cancelingOrders.value = false;
	}
};

const wipeAllData = async () => {
	if (
		!window.confirm(
			"Cette action supprimera votre compte, votre profil membre et vos commandes réclamées. Continuer ?",
		)
	) {
		return;
	}

	pageError.value = null;
	pageSuccess.value = null;
	wipingData.value = true;

	try {
		await $fetch("/api/dashboard/wipe", { method: "POST" });
		await logout();
		await navigateTo("/");
	} catch (error) {
		pageError.value =
			error instanceof Error ? error.message : "Suppression impossible";
	} finally {
		wipingData.value = false;
	}
};

onMounted(async () => {
	await fetchMe().catch(() => undefined);

	fillFormsFromUser();

	if (isMember.value) {
		await loadClaimedOrders();
	}

	isLoading.value = false;
});
</script>

<template>
	<Navbar />
	<header
		class="container flex flex-col justify-center gap-8 p-8 pt-32 mx-auto md:pb-16"
	>
		<h1 class="text-5xl font-bold font-title">Dashboard</h1>
		<p class="text-lg text-muted max-w-2xl">
			Gérez votre compte, votre profil membre et vos commandes en toute
			simplicité.
		</p>
	</header>
	<main
		class="container min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,163,26,0.12),transparent_30%),linear-gradient(180deg,#fffaf3_0%,#fff_45%,#f8fafc_100%)] mx-auto"
	>
		<section class="px-4 py-10 space-y-8">
			<div v-if="isLoading" class="py-20 text-center text-gray-600">
				Chargement...
			</div>

			<template v-else>
				<div
					v-if="pageError"
					class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl"
				>
					{{ pageError }}
				</div>

				<div
					v-if="pageSuccess"
					class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl"
				>
					{{ pageSuccess }}
				</div>

				<div class="space-y-8">
					<nav
						class="flex items-center gap-4 mx-auto"
					>
						<Button
							v-for="item in tabItems"
							:key="item.key"
							:handler="() => setTab(item.key)"
							:label="item.label"
							:btnStyle="tab === item.key ? 'PRIMARY' : 'LINK'"
							btnSize="SMALL"
						/>
					</nav>

					<div
						v-if="tab === 'account'"
						class="grid gap-8 lg:grid-cols-[1.35fr_0.95fr] items-start"
					>
						<section class="bg-surface rounded-3xl p-8 space-y-6">
							<div>
								<h2 class="text-2xl font-bold font-title">
									Informations du compte
								</h2>
								<p class="text-muted mt-1">
									Modifiez les informations liées à votre
									compte et votre sécurité.
								</p>
							</div>

							<div class="grid gap-4 md:grid-cols-2">
								<Input
									v-model="accountForm.firstName"
									label="Prénom"
									required
								/>
								<Input
									v-model="accountForm.lastName"
									label="Nom"
									required
								/>
							</div>
							<div class="grid gap-4 md:grid-cols-2">
								<Input
									v-model="accountForm.email"
									type="email"
									label="Email"
									required
								/>
								<Input
									v-model="accountForm.studentId"
									label="Numéro étudiant"
									placeholder="Optionnel"
								/>
							</div>

							<div class="flex flex-col sm:flex-row gap-3">
								<div class="w-full sm:w-auto">
									<Button
										:handler="saveAccount"
										label="Enregistrer le compte"
										btnStyle="PRIMARY"
										btnSize="MEDIUM"
										:disabled="accountSaving"
									/>
								</div>
							</div>
						</section>

						<aside class="space-y-6 lg:sticky lg:top-8">
							<section
								class="bg-surface rounded-3xl p-8 space-y-4"
							>
								<h2 class="text-2xl font-bold font-title">
									Sécurité
								</h2>
								<p class="text-muted">
									Ces actions modifient vos données ou votre
									session.
								</p>
								<div class="space-y-3">
									<div class="w-full">
										<Button
											:handler="cancelAllOrders"
											label="Annuler toutes mes commandes"
											btnStyle="DANGER"
											btnSize="MEDIUM"
											:disabled="cancelingOrders"
										/>
									</div>
									<div class="w-full">
										<Button
											:handler="wipeAllData"
											label="Wipe all my data"
											btnStyle="DANGER"
											btnSize="MEDIUM"
											:disabled="wipingData"
										/>
									</div>
									<div class="w-full">
										<Button
											:handler="
												async () => {
													await logout();
													await navigateTo('/');
												}
											"
											label="Logout"
											btnStyle="LINK"
											btnSize="MEDIUM"
										/>
									</div>
								</div>
							</section>
						</aside>
					</div>

					<section
						v-else-if="tab === 'profile'"
						class="bg-surface rounded-3xl p-8 space-y-6"
					>
						<div>
							<h2 class="text-2xl font-bold font-title">
								Profil membre BDE
							</h2>
							<p class="text-muted mt-1">
								Vous pouvez modifier tout sauf le pôle et le
								rôle.
							</p>
						</div>

						<div
							v-if="!isMember"
							class="rounded-3xl border border-black/5 bg-white/70 p-6 text-muted"
						>
							Votre compte n’a pas encore de profil membre. Un
							administrateur doit d’abord vous associer à une
							fiche membre.
						</div>

						<template v-else>
							<div class="grid gap-4 md:grid-cols-2">
								<Input
									v-model="memberForm.firstName"
									label="Prénom"
									required
								/>
								<Input
									v-model="memberForm.lastName"
									label="Nom"
									required
								/>
							</div>
							<div class="grid gap-4 md:grid-cols-2">
								<Input
									v-model="memberForm.pronouns"
									label="Pronoms"
								/>
								<Input
									v-model="memberForm.discord"
									label="Discord"
								/>
							</div>

							<div class="grid gap-4 md:grid-cols-2">
								<div class="flex-1 flex flex-col gap-0.5">
									<label class="text-sm font-medium px-5"
										>Pôle</label
									>
									<div
										class="bg-input rounded-xl px-5 py-4 text-muted"
									>
										{{ user?.profile?.pole }}
									</div>
								</div>
								<div class="flex-1 flex flex-col gap-0.5">
									<label class="text-sm font-medium px-5"
										>Rôle</label
									>
									<div
										class="bg-input rounded-xl px-5 py-4 text-muted"
									>
										{{ user?.profile?.role }}
									</div>
								</div>
							</div>

							<div class="grid gap-4 md:grid-cols-2">
								<div class="flex-1 flex flex-col gap-0.5">
									<label class="text-sm font-medium px-5"
										>Département</label
									>
									<Select v-model="memberForm.department">
										<option
											v-for="department in memberDepartments"
											:key="department"
											:value="department"
										>
											{{ department }}
										</option>
									</Select>
								</div>
								<Input
									v-model="memberForm.promo"
									type="number"
									label="Promo"
								/>
							</div>

							<Input
								v-model="memberForm.photoUrl"
								label="Photo URL"
								placeholder="https://..."
							/>

							<div class="flex flex-col sm:flex-row gap-3">
								<div class="w-full sm:w-auto">
									<Button
										:handler="saveMember"
										label="Enregistrer le profil"
										btnStyle="PRIMARY"
										btnSize="MEDIUM"
										:disabled="memberSaving"
									/>
								</div>
							</div>
						</template>
					</section>

					<section
						v-else
						class="bg-surface rounded-3xl p-8 space-y-6"
					>
						<div
							class="flex items-center justify-between gap-4 flex-wrap"
						>
							<div>
								<h2 class="text-2xl font-bold font-title">
									Mes commandes réclamées
								</h2>
								<p class="text-muted mt-1">
									Toutes les commandes associées à votre
									compte.
								</p>
							</div>
							<div class="w-full sm:w-auto">
								<Button
									:handler="loadClaimedOrders"
									label="Rafraîchir"
									btnStyle="LINK"
									btnSize="MEDIUM"
								/>
							</div>
						</div>

						<div
							v-if="!isMember"
							class="rounded-3xl border border-black/5 bg-white/70 p-6 text-muted"
						>
							Les commandes réclamées apparaîtront ici une fois
							votre profil membre associé.
						</div>

						<template v-else>
							<div v-if="claimedOrdersError" class="text-red-600">
								{{ claimedOrdersError }}
							</div>

							<div
								v-else-if="claimedOrdersLoading"
								class="text-gray-600"
							>
								Chargement de vos commandes...
							</div>

							<div
								v-else-if="claimedOrders.length === 0"
								class="text-gray-600"
							>
								Aucune commande réclamée pour le moment.
							</div>

							<div v-else class="space-y-4">
								<article
									v-for="order in claimedOrders"
									:key="order.id"
									class="rounded-3xl border border-black/5 p-5 space-y-3"
								>
									<div
										class="flex justify-between gap-4 flex-wrap"
									>
										<div>
											<p class="text-sm text-muted">
												Commande
											</p>
											<p class="text-xl font-semibold">
												{{ order.orderCode }}
											</p>
										</div>
										<div class="text-right">
											<p class="text-sm text-muted">
												Statut
											</p>
											<p class="font-medium">
												{{ statusLabel[order.status] }}
											</p>
										</div>
									</div>
									<p class="text-sm text-muted">
										{{ order.itemName || "Produit" }} ·
										{{ order.variantName || "-" }} ·
										{{ order.quantity }}x
									</p>
									<p class="text-sm text-muted">
										{{
											new Date(order.date).toLocaleString(
												"fr-FR",
											)
										}}
									</p>
									<div class="w-full sm:w-auto">
										<Button
											:handler="`/shop/order/${order.id}?code=${encodeURIComponent(order.orderCode)}&email=${encodeURIComponent(order.customerEmail)}`"
											label="Voir le suivi"
											btnStyle="PRIMARY"
											btnSize="MEDIUM"
										/>
									</div>
								</article>
							</div>
						</template>
					</section>
				</div>
			</template>
		</section>
	</main>
</template>
