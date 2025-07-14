
// --- IMPORTS ---
import { handleLogin, handleRegister } from "./controllers/authController.js";
import { isAuthenticated, logOut, getCurrentUser} from "./auth.js";
import { getAllEvents, createEvent, deleteEvent, updateEvent, registerForEvent, unregisterFromEvent } from "./controllers/eventController.js";
import Event from "./models/event.js";

// --- MODULE-LEVEL VARIABLES ---

/**
 * Maps URL paths to their corresponding HTML view files.
 * This object acts as the single source of truth for routing configuration.
 * @type {Object.<string, string>}
 */
const routes = {
    "/": "src/views/home.html",
    "/login": "src/views/login.html",
    "/register": "src/views/register.html",
    "/admin-dashboard": "src/views/admin-dashboard.html", 
    "/visitor-dashboard": "src/views/visitor-dashboard.html", 
    "/404": "src/views/404.html", // Fallback for unmatched routes
}

/**
 * The main DOM element where all views will be rendered.
 * @type {HTMLElement}
 */
const appRoot = document.getElementById("app-root"); 

// --- CORE ROUTER LOGIC ---

/**
 * Fetches the HTML content of a view and injects it into the app's root container.
 * If the view cannot be fetched, it loads the 404 page as a fallback.
 * @param {string} viewPath - The path to the HTML view file (e.g., "src/views/login.html").
 */
async function loadView(viewPath) {
    try {
        const response = await fetch(viewPath);
        if (!response.ok) throw new Error("View not found");

        const html = await response.text();
        appRoot.innerHTML = html;
    } catch (error) {
        console.error("Failed to load view: ", error);
        // Fallback to 404 page on any error
        const response404 = await fetch(routes["/404"]);
        appRoot.innerHTML = await response404.text();
    }
}

/**
 * Navigates the SPA to a new path without a full page reload.
 * It updates the browser's history and then triggers the location handler.
 * @param {string} path - The destination path (e.g., "/login").
 */
export function navigateTo(path) {
    // Update the browser URL without reloading the page
    window.history.pushState({}, "", path); 
    // Manually call the location handler to process the new route 
    handleLocation();
}

/**
 * The main routing function. It determines the current path, checks user
 * authentication and roles, and then loads the appropriate view and its
 * associated logic. This function acts as the central controller for the application's UI.
 */
export async function handleLocation() {
    const path = window.location.pathname;
    const isAuth = isAuthenticated();
    const user = getCurrentUser();

    // Dynamically update the navbar and body class on every route change
    renderNavbar();
    updateBodyClass(path);

    // --- AUTHENTICATION GUARDS ---
    // Protect routes based on authentication status.

    // Unauthenticated users trying to access protected routes
    if (!isAuth && (path === "/admin-dashboard" || path === "/visitor-dashboard")) {
        console.log("Access Denied: Not authenticated. Redirecting to /login.");
        navigateTo("/login");
        return; // Stop execution to allow redirection to complete
    }
    // Authenticated users trying to access guest-only routes (login/register)
    if (isAuth && (path === "/login" || path === "/register")) {
        // Redirect to dashboard according to the role 
        const dashboardPath = user.role === "administrator" ? "/admin-dashboard" : "/visitor-dashboard";
        navigateTo(dashboardPath);
        return;
    }

    // --- ROUTE RESOLUTION ---
    // Determine which view to load based on the path and user role.
    let viewPath;
    let viewInitializer = null; // A function to run after the view is loaded

    switch (path) {
        case "/":
        case "/home": // Allow /home as an alias for the root
            viewPath = routes["/"];
            break;

        case "/login":
            viewPath = routes["/login"];
            viewInitializer = initializeLoginForm;
            break;

        case "/register":
            viewPath = routes["/register"];
            viewInitializer = initializeRegisterForm;
            break;

        case "/admin-dashboard":
            // This route is role-dependent
            if (isAuth && user.role === "administrator") {
                viewPath = routes["/admin-dashboard"];
                viewInitializer = () => initializeAdminDashboard(user);
            } else if (isAuth && user.role === "visitor") {
                // Attendee are automatically redirected from the generic /dashboard to their specific dashboard
                navigateTo("/visitor-dashboard");
                return; // Stop execution to allow the new navigation to take over
            }
            break;

        case "/visitor-dashboard":
            // This route is specifically for visitors
            if (isAuth && user.role === "visitor") {
                viewPath = routes["/visitor-dashboard"];
                viewInitializer = () => initializeVisitorDashboard(user);
            } else {
                // Admin trying to access this is redirected
                navigateTo(isAuth ? "/admin-dashboard" : "/login");
                return; // Stop execution
            }
            break;

        default:
            // If no other route matches, render the 404 page
            viewPath = routes["/404"];
            break;
    }

    // --- VIEW RENDERING AND LOGIC INITIALIZATION ---
    await loadView(viewPath);
    
    // If an initializer function was assigned for the route, execute it now.
    // This ensures that the view's HTML is in the DOM before we try to attach listeners.
    if (viewInitializer) {
        viewInitializer();
    }

    // Dynamically add the logout button if the user is authenticated.
    // This is handled here to ensure it's re-evaluated on every navigation.
    if (isAuth) {
        addLogoutButton();
    }
}

// --- VIEW-SPECIFIC INITIALIZERS ---
// These functions contain the logic for a specific view. They are called by handleLocation.

/**
 * Attaches the submit event listener to the login form.
 */
function initializeLoginForm() {
    const form = document.getElementById("login-form");
    // If the form doesn"t exist on the current page, do nothing.
    if (!form) return; 

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent page reload
        const email = form.querySelector("#email").value;
        const password = form.querySelector("#password").value;

        // Call our controller to handle the login process
        const success = await handleLogin(email, password);
        if (success) {
            // After a successful login, redirect the user to their dashboard
            // Determine the correct dashboard based on the user's role
            const user = getCurrentUser();
            const dashboardPath = user.role === 'administrator' ? '/admin-dashboard' : '/visitor-dashboard';
            navigateTo(dashboardPath);
        } else {
            alert("Invalid credentials. Please try again.");
        }
    });
}

/**
 * Attaches the submit event listener to the registration form.
 */
function initializeRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = form.querySelector("#register-email").value;
    const password = form.querySelector("#register-password").value;

    // Call the controller to handle the registration
    const success = await handleRegister(email, password);

    if (success) {
      alert("Registration successful! Please log in.");
      
      navigateTo("/login"); // On success, redirect the user to the login page
    } 
    // Error alerts are handled within handleRegister
  });
}

/**
 * Initializes the entire Admin Event Management dashboard.
 * Fetches data, renders events, and sets up all event listeners for the view.
 * @param {object} user - The currently logged-in administrator user object.
 */
async function initializeAdminDashboard(user) {
    const eventListElement = document.getElementById("event-list");
    const eventForm = document.getElementById("event-form");
    if (!eventListElement || !eventForm) return;  // Safety check

    // --- NESTED HELPER FUNCTIONS for the Admin View ---

    /** Renders the list of events into the DOM. */
    function renderEvents(events) {
        eventListElement.innerHTML = "";
        events.forEach(event => { 
            const eventElement = document.createElement("div");
            eventElement.classList.add("event-card");
            eventElement.innerHTML = `
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Date:</strong> ${event.date}</p>
                <div class="actions">
                    <button class="edit-btn" data-id="${event.id}">Edit</button>
                    <button class="delete-btn" data-id="${event.id}">Delete</button>
                </div>
            `;
            eventListElement.appendChild(eventElement);
        });
    }


    /** Handles form submission for both creating and updating events. */
    async function handleEventFormSubmit(event) {
        event.preventDefault(); 
        const editingId = eventForm.dataset.editingId; // Read the ID that was saved

        // Get the values from the form inputs
        // Select each input by its unique ID
        const title = document.getElementById("event-title").value;
        const description = document.getElementById("event-description").value;
        const location = document.getElementById("event-location").value;
        const capacity = document.getElementById("event-capacity").value;
        const date = document.getElementById("event-date").value;

        const eventData = {
            title,
            description,
            location,
            capacity: parseInt(capacity, 10),
            date
        };

        let success = false;
        if (editingId) {
            // --- UPDATE MOOD ---
            success = await updateEvent(editingId, eventData);
        } else {
            // --- CREATE MOOD ---
            const newEvent = new Event(title, description, location, date, capacity);
            success = await createEvent(newEvent);
        }

        if (success) {
            resetEventForm();
            loadAdminView(); // Recharge the view
        } else {
            alert("Operation failed. Please check the console.");
        } 
    }

    /** Handles clicks on the 'Edit' and 'Delete' buttons within the event list. */
    async function handleEventListClick(event) {
        const eventId = event.target.dataset.id;
        if (event.target.matches(".delete-btn")) {
            if (await deleteEvent(eventId)) loadAdminView(); // Reload the list
        } else if (event.target.matches(".edit-btn")) {
            const events = await getAllEvents();
            const eventToEdit = events.find(c => c.id == eventId);
            if (eventToEdit) {
                // Fill the form with the event data
                document.getElementById("event-title").value = eventToEdit.title;
                document.getElementById("event-description").value = eventToEdit.description;
                document.getElementById("event-location").value = eventToEdit.location;
                document.getElementById("event-capacity").value = eventToEdit.capacity; 
                document.getElementById("event-date").value = eventToEdit.date;
                eventForm.setAttribute("data-editing-id", eventId); // Save the ID being edited
                eventForm.querySelector("button[type='submit']").textContent = "Update Event"; 

                // Scroll to move to the form
                eventForm.scrollIntoView( { behavior: "smooth", block: "center"});

                if (!eventForm.querySelector(".cancel-btn")) {
                    const cancelButton = document.createElement("button");
                    cancelButton.type = "button";
                    cancelButton.textContent = "Cancel";
                    cancelButton.classList.add("cancel-btn"); 
    
                    cancelButton.addEventListener("click", () => {
                        resetEventForm();
                    });
    
                    eventForm.querySelector("button[type='submit']").insertAdjacentElement("afterend", cancelButton);
                }
            }
        }
    }

    /** Resets the event form to its default state after a create or update action. */
    function resetEventForm() {
        eventForm.reset();
        eventForm.removeAttribute("data-editing-id");
        eventForm.querySelector("button[type='submit']").textContent = "Create Event";

        // Find and delete the search button if exists 
        const cancelButton = eventForm.querySelector(".cancel-btn");
        if (cancelButton) {
            cancelButton.remove();
        }
    }
            

    /** Main function to fetch all necessary data and render the admin dashboard. */
    async function loadAdminView() {
        const events = await getAllEvents();
        renderEvents(events);
    }

    // --- ATTACH EVENT LISTENERS for the Admin View ---   
    // Attach the click handler to the event list container
    // This allows us to handle clicks on dynamically created buttons
    eventListElement.addEventListener("click", handleEventListClick);
    eventForm.addEventListener("submit", handleEventFormSubmit);
    loadAdminView();
}

/**
 * Initializes the Visitor Dashboard.
 */
async function initializeVisitorDashboard(user) {
    const availableEventsElement = document.getElementById("available-events-list"); // ID a cambiar en HTML
    const myEventsElement = document.getElementById("my-events-list"); // ID a cambiar en HTML
    if (!availableEventsElement || !myEventsElement) return;

    /** Renders the list of all events available for enrollment. */
    function renderAvailableEvents(events, currentUser) {
        availableEventsElement.innerHTML = "";
        events.forEach(event => {
            // A attendee can enroll of they are not already enrolled and there is capacity.
            const isRegistered = event.attendees.includes(currentUser.id);
            // Check if the event has capacity left
            const hasCapacity = event.attendees.length < event.capacity; 

            const eventCard = document.createElement("div");
            eventCard.classList.add("event-card");
            eventCard.innerHTML = `
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <p><strong>Attendees:</strong> ${event.attendees.length} / ${event.capacity}</p>
                <div class="actions">
                    <button class="enroll-btn" data-event-id="${event.id}" ${isRegistered || !hasCapacity ? "disabled" : ""}>
                        ${isRegistered ? "Already Registered" : (hasCapacity ? "Register" : "Full")}
                    </button>
                </div>
            `;
            availableEventsElement.appendChild(eventCard);
        });
    }

    /** Renders the list of events the current attendee is enrolled in. */
    function renderMyEvents(events, currentUser) {
        myEventsElement.innerHTML = ""; 
        const myRegisteredEvents = events.filter(event => event.attendees.includes(currentUser.id));

        if (myRegisteredEvents.length === 0) {
            myEventsElement.innerHTML = "<p>You are not registered in any events yet.</p>";
            return;
        }

        myRegisteredEvents.forEach(event => {
            const eventCard = document.createElement("div");
            eventCard.classList.add("event-card");
            eventCard.innerHTML =  `
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <button class="unenroll-btn" data-event-id="${event.id}">Unenroll</button>
            `;
            myEventsElement.appendChild(eventCard);
        });
    }

    /** Handles the click on an 'Enroll' button. */
    async function handleDashboardClick(event) {
        if (event.target.matches(".enroll-btn")) {
            const eventId = event.target.dataset.eventId;
            if (await registerForEvent(eventId)) loadVisitorView();
        } else if (event.target.matches(".unenroll-btn")) {
            const eventId = event.target.dataset.eventId;
            if (await unregisterFromEvent(eventId)) loadVisitorView();
        }
    }
    

    async function loadVisitorView() {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        const events = await getAllEvents();
        renderAvailableEvents(events, currentUser);
        renderMyEvents(events, currentUser);
    }

    // --- ATTACH EVENT LISTENERS for the Visitor View ---
    // Attach the click handler to the available events container
    const appRoot = document.getElementById('app-root');
    appRoot.addEventListener('click', handleDashboardClick);

    // --- INITIAL DATA LOAD ---
    loadVisitorView();
}
            
// --- UI HELPER FUNCTIONS ---

/**
 * Updates the navigation bar links based on the user's authentication status and role.
 */
function renderNavbar() {
    const nav = document.getElementById("main-nav");
    if (!nav) return;

    const isAuth = isAuthenticated();
    const user = getCurrentUser();
    let navLinks = '';

    if (isAuth) {
        navLinks += `<a href="/">Home</a>`;
        if (user.role === "administrator") {
            navLinks += ` | <a href="/admin-dashboard">Event Management</a>`;
        } else if (user.role === "visitor") {
            navLinks += ` | <a href="/visitor-dashboard">My Events</a>`;
        }
    } else {
        navLinks = `<a href="/">Home</a> | <a href="/login">Login</a> | <a href="/register">Register</a>`;
    }
    nav.innerHTML = navLinks;
}


/**
 * Adds a logout button to the top of the app container if it doesn't already exist.
 */
function addLogoutButton() {
    if (document.getElementById("logout-btn")) return; // Prevent duplicates

    const logoutBtn = document.createElement("button");
    logoutBtn.id = "logout-btn";
    logoutBtn.textContent = "Logout";
    logoutBtn.addEventListener("click", () => {
        logOut();
        // After logging out, the navbar needs to be updated immediately
        renderNavbar();
        navigateTo("/login");
    });
    // Prepending ensures it appears at the top of the main content area
    appRoot.prepend(logoutBtn);
}

/**
 * Toggles a specific CSS class on the body element for dashboard views.
 * This allows for custom styling on wider layout pages.
 * @param {string} path - The current window path.
 */
function updateBodyClass(path) {
    const body = document.body;
    if (path === "/admin-dashboard" || path === "/visitor-dashboard") {
        body.classList.add("dashboard-view");
    } else {
        body.classList.remove("dashboard-view");
    }
}
