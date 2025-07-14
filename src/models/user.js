
/**
 * @file Defines the User class, which serves as a blueprint for creating user objects.
 */

/**
 * Represents a User in the application.
 * This class ensures that every new user object has a consistent structure.
 */
export default class User {
    /**
     * Creates an instance of a User.
     * @param {string} email - The user's email address.
     * @param {string} password - The user's raw password.
     * @param {string} [role="visitor"] - The user's role. Defaults to 'visitor' for all new registrations.
     */
    constructor(email, password, role = "visitor") {
        this.email = email;
        this.password = password;
        this.role = role; // Default role is 'visitor'
    }
}