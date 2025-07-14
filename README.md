# Event Management SPA

This project is a feature-rich Single Page Application (SPA) designed to simulate an online event management platform. It's built from the ground up using modern vanilla JavaScript (ES6+), HTML5, and CSS, running on a Vite development server. The application features a complete client-side routing system, role-based authentication, and full CRUD (Create, Read, Update, Delete) functionality for events management, all interacting with a mock backend powered by `json-server`.

## Features

This project implements a complete system with the following features:

- **Role-Based Authentication & Security:**
    -   Separate registration and login flows for two distinct user roles: **Administrator** and **Visitor**.
    -   Persistent sessions using `localStorage` to keep users logged in across reloads.
    -   **Protected Routes (Route Guarding):** The custom-built router prevents access to dashboards if the user is unauthenticated and redirects logged-in users away from guest-only pages.
- **Administrator Dashboard:**
    -   **Full CRUD Functionality:** Administrators can **C**reate, **R**ead, **U**pdate, and **D**elete events.
    -   **Dynamic & Intuitive Forms:** The interface for creating and updating events is efficient and user-friendly.
    -   **Seamless Edit Mode:** Clicking "Edit" populates the form with the event's data, scrolls the view to the form automatically, and provides a "Cancel" button to exit the edit mode.

-   **Visitor Dashboard:**
    -   **View Available Events:** Visitors can see a list of all available events, including real-time attendee counts and maximum capacity.
    -   **Event Registration:** Users can register for events that have available spots and unregister from events they are attending.
    -   **Dynamic UI:** Buttons are intelligently disabled and their text changes (e.g., "Full" or "Already Registered") based on the event's status and the user's registration.

-   **Modern Architecture:**
    -   **Client-Side Routing:** A custom router built with the History API manages navigation between views, providing a smooth and fast user experience without page reloads.
    -   **Modular Codebase:** The project is organized following solid design principles, separating logic into models, views, controllers, and services.

## Tech Stack & Architecture

- **Frontend**:
  - **Vanilla JavaScript (ES6+)**: Utilizes modern features like `async/await`, `Modules` (import/export), `Classes`, and the Spread operator.
  - **HTML5 & CSS3**: For structure and styling.
  - **Vite**: Serves as the development server and build tool, providing a fast and modern development experience with Hot Module Replacement (HMR).
- **Backend (Mock API)**:
  - **`json-server`**: Simulates a complete RESTful API for a persistent backend, allowing for realistic data manipulation.

## Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

- Node.js (v22 or later recommended)
- npm (comes with Node.js)


### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Elimge/spa-events-management.git
    cd spa-events-management
    ```


2.  **Install dependencies:**
    This command will install Vite, `json-server`, and all other necessary tools.
    ```bash
    npm install
    ```

3. **Run the application:**
    This single command will start both the backend API server (`json-server`) and the frontend development server (`vite`) in parallel.
    ```bash
    npm run start
    ```
    -   The API will be available at `http://localhost:3000`.
    -   The frontend application will be available at `http://localhost:5173` (or the URL Vite provides).

4. **Open the application:**
    Open your browser and navigate to the local URL provided by Vite (e.g., http://localhost:5173). 

## Credentials for Testing

You can use the following pre-configured users from `db.json` to test the application:

| Role          | Email                 | Password   |
| :------------ | :-------------------- | :--------- |
| Administrator | `admin@events.com`    | `admin123` |
| Visitor       | `visitor1@test.com`   | `visitor123` |

You can also register new "visitor" accounts through the registration page.

## File Structure
``` bash
/spa-events-management
│
├── .gitignore
├── db.json
├── index.html
├── package-lock.json
├── package.json
├── events-API-test.postman_collection.json
├── README.md
│
├── node_modules/
│   └── ... (dependencies)
│
├── public/
│
└── src/
    ├── auth.js
    ├── main.js
    ├── router.js
    ├── style.css
    │
    ├── controllers/
    │   ├── authController.js
    │   └── eventController.js
    │
    ├── models/
    │   ├── event.js
    │   └── user.js
    │ 
    └── views/
        ├── 404.html
        ├── home.html
        ├── login.html
        ├── register.html
        ├── visitor-dashboard.html
        └── admin-dashboard.html
``` 
## Author

-   **Miguel Canedo Vanegas**
-   GitHub: `@Elimge` 
-   **Clan:** Manglar
-   **ID:** 9.999.999.999
-   **Email:** Elimge_u@outlook.com (no exist)