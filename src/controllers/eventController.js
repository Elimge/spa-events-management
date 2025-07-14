
/**
 * @file This controller manages all CRUD operations for events and related data
 * It serves as the intermediary between the frontend logic
 * and the event-related API endpoints.
 */

import { getCurrentUser } from "../auth.js";

/**
 * The base URL for the events API endpoint.
 * @type {string}
 */
const EVENTS_API_URL = "http://localhost:3000/events";

/**
 * Fetches all events from the API.
 * @returns {Promise<Array>} A promise that resolves to an array of event objects, or an empty array on failure.
 */
export async function getAllEvents() {
    try {
        const response = await fetch(EVENTS_API_URL);
        if (!response.ok) throw new Error("Failed to fetch events.");
        return await response.json();
    } catch (error) {
        console.error("Error fetching events: ", error);
        return []; // Return a safe, empty array on error to prevent crashes in rendering logic.
    }
}

/**
 * Creates a new event by sending a POST request to the API.
 * @param {object} eventData - The data for the new event, typically an instance of the Event model.
 * @returns {Promise<object|null>} A promise that resolves to the newly created event object, or `null` on failure.
 */
export async function createEvent(eventData) {
    try {
        const response = await fetch(EVENTS_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(eventData)
        });
        if (!response.ok) throw new Error("Failed to create event.");
        return await response.json();
    } catch (error) {
        console.error("Error creating event: ", error);
        return null;
    }
}

/**
 * Updates an existing event using a PATCH request.
 * A PATCH request is used to update only the specified fields.
 * @param {string|number} eventId - The ID of the event to update.
 * @param {object} eventData - An object containing the event properties to update.
 * @returns {Promise<object|null>} The updated event object, or `null` on failure.
 */
export async function updateEvent(eventId, eventData) {
    try {
        const response = await fetch(`${EVENTS_API_URL}/${eventId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventData)
        });
        if (!response.ok) throw new Error("Failed to update event.");
        return await response.json();
    } catch (error) {
        console.error("Error updating event:", error);
        return null;
    }
}

/**
 * Deletes a event by its ID using a DELETE request. (Hard Delete)
 * @param {string|number} eventId - The ID of the event to delete.
 * @returns {Promise<boolean>} `true` on successful deletion, `false` on failure.
 */
export async function deleteEvent(eventId) {
    try {
        const response = await fetch(`${EVENTS_API_URL}/${eventId}`, {
            method: "DELETE"
        });
        if (!response.ok) throw new Error("Failed to delete event.");
        return true;
    } catch (error) {
        console.error("Error deleting event: ", error);
        return false;
    }
}

/**
 * Registers the current user for an event by updating the event's `attendees` array.
 * @param {number|string} eventId - The ID of the event to register for.
 * @returns {Promise<object|null>} The updated event object, or `null` on failure.
 */
export async function registerForEvent(eventId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.error("No user is logged in.");
        return null;
    }

    try {
        // First, get the current event to check capacity and get the current attendees list
        const eventResponse = await fetch(`${EVENTS_API_URL}/${eventId}`);
        if (!eventResponse.ok) throw new Error("Could not fetch event to register.");
        const event = await eventResponse.json();

        // Check for capacity and if user is already registered
        if (event.attendees.length >= event.capacity) {
            alert("This event is full.");
            return null;
        }
        if (event.attendees.includes(currentUser.id)) {
            alert("You are already registered for this event.");
            return null;
        }
        
        const newAttendees = [...event.attendees, currentUser.id];

        const response = await fetch(`${EVENTS_API_URL}/${eventId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ attendees: newAttendees }),
        });
        if (!response.ok) throw new Error("Failed to register for event.");
        return await response.json();
    } catch (error) {
        console.error("Error registering for event:", error);
        return null;
    }
}

/**
 * Unregisters the current user from an event.
 * @param {number|string} eventId - The ID of the event to unregister from.
 * @returns {Promise<object|null>} The updated event object, or `null` on failure.
 */
export async function unregisterFromEvent(eventId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;

    try {
        const eventResponse = await fetch(`${EVENTS_API_URL}/${eventId}`);
        if (!eventResponse.ok) throw new Error("Could not fetch event to unregister.");
        const event = await eventResponse.json();

        const newAttendees = event.attendees.filter(id => id !== currentUser.id);

        const response = await fetch(`${EVENTS_API_URL}/${eventId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attendees: newAttendees }),
        });
        if (!response.ok) throw new Error('Failed to unregister from event.');
        return await response.json();
    } catch (error) {
        console.error('Error unregistering from event:', error);
        return null;
    }
}