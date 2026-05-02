import type { Event as EventModel } from "~~/shared/models/events";

export const useEvents = async () => {
	const events = useState<EventModel[]>("eventsList", () => []);
	const error = useState<Error | null>("eventsError", () => null);

	const fetchEvents = async () => {
		try {
			const response = await $fetch<EventModel[]>("/api/events");
			events.value = response;
		} catch (err: Error | unknown) {
			console.error("Failed to fetch events:", err as Error);
			error.value = err as Error;
		}
	};

	const addEvent = async (event: EventModel) => {
		try {
			await $fetch("/api/events/new", {
				method: "POST",
				body: event,
			});

			events.value?.push(event);
		} catch (err: Error | unknown) {
			console.error("Failed to add event:", err as Error);
			error.value = err as Error;
		}
	};

	const revokeEvent = async (id: EventModel["id"]) => {
		try {
			await $fetch(`/api/events/${id}`, {
				method: "DELETE",
			});

			events.value = events.value?.filter((e) => e.id !== id);
		} catch (err: Error | unknown) {
			console.error("Failed to revoke event:", err as Error);
			error.value = err as Error;
		}
	};

	const updateEvent = async (event: EventModel) => {
		try {
			await $fetch(`/api/events/${event.id}`, {
				method: "PUT",
				body: event,
			});

			events.value = events.value?.map((e) =>
				e.id === event.id ? event : e,
			);
		} catch (err: Error | unknown) {
			console.error("Failed to update event:", err as Error);
			error.value = err as Error;
		}
	};

	return {
		events,
		error,
		addEvent,
		revokeEvent,
		updateEvent,
		fetchEvents,
	};
};
