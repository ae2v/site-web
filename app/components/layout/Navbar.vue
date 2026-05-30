<style scoped>
.navlink {
	@apply underline decoration-3 underline-offset-4 transition-colors duration-150;
}

.navlink:not(:hover) {
	@apply decoration-transparent;
}
</style>
<script setup lang="ts">
import { useAuth } from "~~/app/composables/useAuth";

import Logo from "~/assets/logo.svg";
import {
	ArrowRightStartOnRectangleIcon,
	ShoppingCartIcon,
	UserIcon,
} from "@heroicons/vue/24/outline";

defineProps<{
	isTransparent?: boolean;
	isFixed?: boolean;
}>();

const { user, logout } = useAuth();

const doLogout = async () => {
	await logout();
};
</script>
<template>
	<nav
		id="navbar"
		class="top-0 left-0 right-0 transition-all duration-200"
		:class="
			(isFixed ? ' fixed z-50' : 'sticky') +
			(isTransparent
				? ' bg-transparent h-32 px-16'
				: ' bg-primary text-white h-24 px-12')
		"
	>
		<ul class="flex items-center gap-10 text-lg font-medium h-full w-full">
			<RouterLink to="/">
				<Logo
					class="w-auto"
					:class="
						isTransparent ? 'text-primary h-12' : 'text-white h-10'
					"
				/>
			</RouterLink>
			<RouterLink
				to="/members"
				class="navlink"
				:class="
					isTransparent
						? 'hover:decoration-primary'
						: 'hover:decoration-white'
				"
				>Membres</RouterLink
			>
			<RouterLink
				to="/events"
				class="navlink"
				:class="
					isTransparent
						? 'hover:decoration-primary'
						: 'hover:decoration-white'
				"
				>Événements</RouterLink
			>
			<RouterLink
				to="/shop"
				class="navlink"
				:class="
					isTransparent
						? 'hover:decoration-primary'
						: 'hover:decoration-white'
				"
				>Boutique</RouterLink
			>

			<div class="grow"></div>

			<template v-if="user">
				<Button
					handler="/dashboard"
					:label="user.account?.firstName + ' ' + user.account?.lastName"
					btnStyle="LINK"
					btnSize="MEDIUM"
					:icon="UserIcon"
				/>
				<RouterLink to="/shop/order" class="btn btn-sm">
					<ShoppingCartIcon class="w-5 h-5" />
				</RouterLink>
			</template>

			<template v-else>
				<RouterLink to="/auth/login" class="btn btn-sm">
					<UserIcon class="w-8 h-8" />
				</RouterLink>
				<RouterLink to="/shop/order" class="btn btn-sm">
					<ShoppingCartIcon class="w-8 h-8" />
				</RouterLink>
			</template>
		</ul>
	</nav>
</template>
