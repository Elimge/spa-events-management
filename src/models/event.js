
/**
 * @file Defines the Event class, which serves as a blueprint for creating event objects.
 */

/**
 * Represents a Event in the application.
 * This class provides a consistent structure for event data.
 */
export default class Event {
    /**
     * Creates an instance of a Event.
     * @param {string} title - The title of the event.
     * @param {string} description - A detailed description of the event.
     * @param {string} location - The location where the event takes place.
     * @param {string|number} date - The date and time of the event.
     * @param {string|number} capacity - The maximum number of attendees.
     */
    constructor(title, description, location, date, capacity) {
        this.title = title;
        this.description = description;
        this.location = location;
        this.date = date; 
        this.capacity = parseInt(capacity, 10); 
        this.attendees = []; // New event start with no attendees
    }
}