<script setup lang="ts">
import type { Member, Department } from "#shared/models/member";
import { toTitleCase } from "#shared/utils/format";

import deptColors from "#shared/colors/departments";

import { AtSymbolIcon, BeakerIcon, BriefcaseIcon, ChatBubbleLeftEllipsisIcon, IdentificationIcon, RocketLaunchIcon } from "@heroicons/vue/24/solid";

const props = defineProps<{
	member: Member;
}>();

const styles: Record<string, Record<string, string>> = {
	"dept-badge": {
		backgroundColor: "@dept26",
		color: "@dept",
	},
	field: {
		color: "@dept",
	},
};

const getYear = () => {
	const currmonth = new Date().getMonth() + 1; // getMonth() retourne un index de 0 à 11
	const currentYear =
		currmonth >= 9
			? new Date().getFullYear()
			: new Date().getFullYear() - 1;

	const graduationYear = props.member.promo;

	return 3 - (graduationYear - currentYear);
};

const getStyle = (elem: string, include_year: boolean = false) => {
	let dept = props.member.department.toUpperCase() as Department;
	let variant: "normal" | "light" | "lighter" | "faded" = "faded";

	if (include_year) {
		const year = getYear();

		switch (year) {
			case 0:
				variant = "faded";
				break;
			case 1:
				variant = "light";
				break;
			case 2:
				variant = "lighter";
				break;
		}
	}

	if (Object.keys(styles).includes(elem)) {
		let style = styles[elem]!;

		for (const [key, value] of Object.entries(style)) {
			style[key] = value.replace("@dept", deptColors[dept]![variant]!);
		}

		return style;
	}

	return "";
};
</script>
<template>
	<div
		class="flex flex-col justify-end rounded-4xl shadow-2xl aspect-4/5 overflow-hidden"
		:style="{
			backgroundImage: `url(${member.photoUrl || '/default-photo.png'})`,
			backgroundSize: 'cover',
			backgroundPosition: 'center',
			backgroundRepeat: 'no-repeat',
		}"
	>
		<div
			class="bg-linear-to-t from-black/75 via-black/75 to-transparent text-white p-8 pt-16 space-y-4"
		>
			<div class="flex justify-left items-center gap-1">
				<h3 class="grow text-2xl font-semibold">
					{{ member.firstName }}
				</h3>
				<span
					class="text-sm font-medium px-4 py-1.5 rounded-full"
					:style="getStyle('dept-badge')"
				>
					{{ member.department }} {{ member.promo }}
				</span>
			</div>
			<div class="flex flex-col gap-1">
				<div class="flex items-center gap-1">
					<IdentificationIcon class="w-5 h-5" />
					<p class="text-sm">
						{{ member.firstName }} {{ member.lastName }}
					</p>
				</div>
				<div class="flex items-center gap-1">
					<BriefcaseIcon v-if="member.pole == 'DIRECTION'" class="w-5 h-5" />
					<ChatBubbleLeftEllipsisIcon v-else-if="member.pole == 'COMMUNICATION'" class="w-5 h-5" />
					<BeakerIcon v-else-if="member.pole == 'DÉVELOPPEMENT'" class="w-5 h-5" />
					<RocketLaunchIcon v-else-if="member.pole == 'MARKETING'" class="w-5 h-5" />
					<RocketLaunchIcon v-else class="w-5 h-5" />
					<p class="text-sm">
						{{
							toTitleCase(
								member.pole == "DIRECTION"
									? member.role
									: 'Pôle ' + member.pole,
							)
						}}
					</p>
				</div>
				<div class="flex items-center gap-1" v-if="member.discord">
					<AtSymbolIcon class="w-5 h-5" />
					<p class="text-sm">Discord: {{ member.discord }}</p>
				</div>
			</div>
		</div>
	</div>
</template>
