import type { Member } from "~~/shared/models/member";

export const useMembers = async () => {
	const members = useState<Member[]>("membersList", () => []);
	const error = useState<Error | null>("membersError", () => null);

	const fetchMembers = async () => {
		try {
			const response = await $fetch("/api/members");
			members.value = response;
		} catch (err: Error | unknown) {
			console.error("Failed to fetch members:", err as Error);
			error.value = err as Error;
		}
	};

	const addMember = async (member: Member) => {
		try {
			await $fetch("/api/members/new", {
				method: "POST",
				body: member,
			});

			members.value?.push(member);
		} catch (err: Error | unknown) {
			console.error("Failed to add member:", err as Error);
			error.value = err as Error;
		}
	};

	const revokeMember = async (id: Member["id"]) => {
		try {
			await $fetch(`/api/members/${id}`, {
				method: "DELETE",
			});

			members.value = members.value?.filter((m) => m.id !== id);
		} catch (err: Error | unknown) {
			console.error("Failed to revoke member:", err as Error);
			error.value = err as Error;
		}
	};

	const updateMember = async (member: Member) => {
		try {
			await $fetch(`/api/members/${member.id}`, {
				method: "PUT",
				body: member,
			});

			members.value = members.value?.map((m) =>
				m.id === member.id ? member : m,
			);
		} catch (err: Error | unknown) {
			console.error("Failed to update member:", err as Error);
			error.value = err as Error;
		}
	};

	return {
		members,
		error,
		addMember,
		revokeMember,
		updateMember,
		fetchMembers,
	};
};
