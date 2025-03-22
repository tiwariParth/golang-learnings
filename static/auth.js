// Authentication functionality for the task manager

let authToken = localStorage.getItem("auth_token");
let currentUser = null;

// Try to parse the user from localStorage
try {
  const userJson = localStorage.getItem("current_user");
  if (userJson) {
    currentUser = JSON.parse(userJson);
  }
} catch (e) {
  console.error("Error parsing user from localStorage:", e);
  localStorage.removeItem("current_user");
}

// Check if user is logged in
function isLoggedIn() {
  return !!authToken;
}

// Set up login form
document.addEventListener("DOMContentLoaded", function () {
  // Add login/register forms to the page if they don't exist
  setupAuthForms();

  // Update UI based on auth state
  updateAuthUI();

  // Handle "Get Started" button click to scroll to task manager and show auth forms
  const getStartedBtn = document.querySelector(".hero a.btn");
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const taskManager = document.getElementById("task-manager");
      if (taskManager) {
        window.scrollTo({
          top: taskManager.offsetTop,
          behavior: "smooth",
        });

        // If user is not logged in, show the auth container
        if (!isLoggedIn()) {
          const authContainer = document.getElementById("auth-container");
          if (authContainer) {
            authContainer.classList.remove("hidden");
          }
        }
      }
    });
  }

  // Add event listeners to auth forms
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }

  // Logout button
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
});

// Create and set up auth forms if they don't exist
function setupAuthForms() {
  if (!document.getElementById("auth-container")) {
    const authContainer = document.createElement("div");
    authContainer.id = "auth-container";
    authContainer.className = "auth-container";

    // Create login form
    authContainer.innerHTML = `
      <div class="auth-forms">
        <div class="auth-form" id="login-form-container">
          <h2>Login</h2>
          <form id="login-form">
            <div class="form-group">
              <label for="login-username">Username or Email <span class="required">*</span></label>
              <input type="text" id="login-username" required>
            </div>
            <div class="form-group">
              <label for="login-password">Password <span class="required">*</span></label>
              <input type="password" id="login-password" required>
            </div>
            <button type="submit" class="btn">Login</button>
            <div class="form-status"></div>
          </form>
          <p>Don't have an account? <a href="#" id="show-register">Register</a></p>
        </div>
        
        <div class="auth-form hidden" id="register-form-container">
          <h2>Register</h2>
          <form id="register-form">
            <div class="form-group">
              <label for="register-username">Username <span class="required">*</span></label>
              <input type="text" id="register-username" required>
            </div>
            <div class="form-group">
              <label for="register-email">Email <span class="required">*</span></label>
              <input type="email" id="register-email" required>
            </div>
            <div class="form-group">
              <label for="register-password">Password <span class="required">*</span></label>
              <input type="password" id="register-password" required minlength="6">
              <small class="form-hint">Password must be at least 6 characters long</small>
            </div>
            <button type="submit" class="btn">Register</button>
            <div class="form-status"></div>
          </form>
          <p>Already have an account? <a href="#" id="show-login">Login</a></p>
        </div>
      </div>
    `;

    // Add auth container before the task manager section
    const taskManager = document.getElementById("task-manager");
    if (taskManager) {
      taskManager.parentNode.insertBefore(authContainer, taskManager);

      // Add toggle functionality between login and register forms
      document
        .getElementById("show-register")
        .addEventListener("click", function (e) {
          e.preventDefault();
          document
            .getElementById("login-form-container")
            .classList.add("hidden");
          document
            .getElementById("register-form-container")
            .classList.remove("hidden");
        });

      document
        .getElementById("show-login")
        .addEventListener("click", function (e) {
          e.preventDefault();
          document
            .getElementById("register-form-container")
            .classList.add("hidden");
          document
            .getElementById("login-form-container")
            .classList.remove("hidden");
        });
    }

    // Add logout button to nav
    const navLinks = document.querySelector(".nav-links");
    if (navLinks) {
      const logoutBtn = document.createElement("a");
      logoutBtn.href = "#";
      logoutBtn.className = "nav-link logout-btn";
      logoutBtn.id = "logout-btn";
      logoutBtn.textContent = "Logout";
      navLinks.appendChild(logoutBtn);
    }
  }
}

// Update UI based on authentication state
function updateAuthUI() {
  const authContainer = document.getElementById("auth-container");
  const taskManager = document.getElementById("task-manager");
  const logoutBtn = document.getElementById("logout-btn");
  const mobileNav = document.getElementById("mobile-nav");

  if (isLoggedIn()) {
    // User is logged in
    if (authContainer) authContainer.classList.add("hidden");
    if (taskManager) taskManager.classList.remove("hidden");
    if (logoutBtn) logoutBtn.classList.remove("hidden");

    // Show username in the UI
    if (currentUser) {
      const existingUsernameDisplay =
        document.querySelector(".username-display");
      if (existingUsernameDisplay) {
        existingUsernameDisplay.remove();
      }

      const usernameDisplay = document.createElement("span");
      usernameDisplay.className = "username-display";
      usernameDisplay.textContent = `Hello, ${currentUser.username}!`;

      const navContainer = document.querySelector(".nav-container");
      if (navContainer) {
        navContainer.appendChild(usernameDisplay);
      }

      // Add logout button to mobile nav if it doesn't exist
      if (mobileNav && !mobileNav.querySelector("#mobile-logout-btn")) {
        const mobileLogoutBtn = document.createElement("a");
        mobileLogoutBtn.href = "#";
        mobileLogoutBtn.className = "nav-link logout-btn";
        mobileLogoutBtn.id = "mobile-logout-btn";
        mobileLogoutBtn.textContent = "Logout";
        mobileLogoutBtn.addEventListener("click", handleLogout);
        mobileNav.querySelector(".nav-links").appendChild(mobileLogoutBtn);
      }
    }
  } else {
    // User is not logged in
    if (authContainer) authContainer.classList.remove("hidden");
    if (taskManager) taskManager.classList.add("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");

    // Remove username display
    const usernameDisplay = document.querySelector(".username-display");
    if (usernameDisplay) {
      usernameDisplay.remove();
    }

    // Remove mobile logout button if it exists
    const mobileLogoutBtn = document.getElementById("mobile-logout-btn");
    if (mobileLogoutBtn) {
      mobileLogoutBtn.remove();
    }
  }
}

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();

  const form = document.getElementById("login-form");
  const statusElement = form.querySelector(".form-status");
  const submitButton = form.querySelector("button[type='submit']");

  // Display loading state
  submitButton.disabled = true;
  submitButton.textContent = "Logging in...";
  statusElement.textContent = "Verifying credentials...";
  statusElement.className = "form-status status-loading";

  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();

    // Save auth token and user info
    authToken = data.token;
    currentUser = data.user;

    localStorage.setItem("auth_token", authToken);
    localStorage.setItem("current_user", JSON.stringify(currentUser));

    // Update status
    statusElement.textContent = "Login successful! Redirecting...";
    statusElement.className = "form-status status-success";

    // Update UI after a slight delay for better UX
    setTimeout(() => {
      // Update UI
      updateAuthUI();

      // Show success message
      showNotification("Login successful!");

      // Fetch tasks with the new auth token
      fetchTasks();
    }, 500);
  } catch (error) {
    console.error("Login error:", error);
    statusElement.textContent = error.message;
    statusElement.className = "form-status status-error";
    showNotification(error.message, "error");
  } finally {
    // Reset button state
    submitButton.disabled = false;
    submitButton.textContent = "Login";
  }
}

// Handle register form submission
async function handleRegister(e) {
  e.preventDefault();

  const form = document.getElementById("register-form");
  const statusElement = form.querySelector(".form-status");
  const submitButton = form.querySelector("button[type='submit']");

  // Display loading state
  submitButton.disabled = true;
  submitButton.textContent = "Registering...";
  statusElement.textContent = "Creating your account...";
  statusElement.className = "form-status status-loading";

  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  // Basic validation
  if (password.length < 6) {
    statusElement.textContent = "Password must be at least 6 characters long";
    statusElement.className = "form-status status-error";
    submitButton.disabled = false;
    submitButton.textContent = "Register";
    return;
  }

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    const data = await response.json();

    // Save auth token and user info
    authToken = data.token;
    currentUser = data.user;

    localStorage.setItem("auth_token", authToken);
    localStorage.setItem("current_user", JSON.stringify(currentUser));

    // Update status
    statusElement.textContent = "Registration successful! Redirecting...";
    statusElement.className = "form-status status-success";

    // Update UI after a slight delay for better UX
    setTimeout(() => {
      // Update UI
      updateAuthUI();

      // Show success message
      showNotification("Registration successful!");

      // Fetch tasks with the new auth token
      fetchTasks();
    }, 500);
  } catch (error) {
    console.error("Registration error:", error);
    statusElement.textContent = error.message;
    statusElement.className = "form-status status-error";
    showNotification(error.message, "error");
  } finally {
    // Reset button state
    submitButton.disabled = false;
    submitButton.textContent = "Register";
  }
}

// Handle logout
function handleLogout(e) {
  e.preventDefault();

  // Clear auth data
  authToken = null;
  currentUser = null;
  localStorage.removeItem("auth_token");
  localStorage.removeItem("current_user");

  // Update UI
  updateAuthUI();

  // Redirect to home
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  // Show success message
  showNotification("Logged out successfully");

  // Clear tasks
  if (typeof tasks !== "undefined") {
    tasks = [];
    renderTasks();
  }
}

// Function to add auth token to fetch requests
function fetchWithAuth(url, options = {}) {
  // Create default headers if not provided
  if (!options.headers) {
    options.headers = {};
  }

  // Add auth token if available
  if (authToken) {
    options.headers.Authorization = `Bearer ${authToken}`;
  }

  // Add default content type if not provided
  if (!options.headers["Content-Type"] && options.method !== "GET") {
    options.headers["Content-Type"] = "application/json";
  }

  return fetch(url, options);
}

// Override the original fetch functions to use authentication
window.originalFetchTasks = window.fetchTasks;
window.fetchTasks = function () {
  showLoading(tasksList);

  fetchWithAuth("/api/tasks")
    .then((response) => response.json())
    .then((data) => {
      tasks = data;
      console.log("Loaded tasks from API:", tasks);
      hideLoading();
      renderTasks();
      updateTaskCounter();
    })
    .catch((error) => {
      console.error("Error loading tasks from API:", error);
      hideLoading();
      showNotification(
        "Could not connect to server. Using local data.",
        "error"
      );
      // Fallback to localStorage if API fails
      loadTasksFromLocalStorage();
    });
};

// Override the original addTask function
window.originalAddTask = window.addTask;
window.addTask = async function () {
  const taskText = taskInput.value.trim();
  if (taskText) {
    const task = {
      id: Date.now(),
      text: taskText,
      completed: false,
    };

    try {
      // Show loading state
      addTaskBtn.disabled = true;
      addTaskBtn.textContent = "Adding...";

      // Send to API with auth
      const response = await fetchWithAuth("/api/tasks", {
        method: "POST",
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error("Failed to add task to API");
      }

      const savedTask = await response.json();
      tasks.push(savedTask);
      console.log("Added task:", savedTask);
      showNotification("Task added successfully!");
    } catch (error) {
      console.error("Error saving task to API:", error);
      // Fallback to just adding to local array
      tasks.push(task);
      // Backup to localStorage
      saveTasks();
      showNotification("Added to local storage only", "error");
    } finally {
      // Reset button state
      addTaskBtn.disabled = false;
      addTaskBtn.textContent = "Add";
    }

    renderTasks();
    updateTaskCounter();
    taskInput.value = "";

    // Scroll to the bottom of the tasks list to show the new task
    setTimeout(() => {
      if (tasksList.lastElementChild) {
        tasksList.lastElementChild.scrollIntoView({ behavior: "smooth" });
        tasksList.lastElementChild.classList.add("new-task");
      }
    }, 100);
  }
};

// Define showNotification if it doesn't exist
if (typeof showNotification !== 'function') {
  window.showNotification = function (message, type = "success") {
    // Remove any existing notifications
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create new notification
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Show notification with animation
    setTimeout(() => notification.classList.add("show"), 10);

    // Auto-hide after timeout
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };
}

// Define showLoading if it doesn't exist
if (typeof showLoading !== 'function') {
  window.showLoading = function (parentElement) {
    if (!parentElement) return;
    
    const loadingIndicator = document.createElement("div");
    loadingIndicator.className = "loading";
    loadingIndicator.innerHTML = "<span></span><span></span><span></span>";
    parentElement.appendChild(loadingIndicator);
    return loadingIndicator;
  };
}

// Define hideLoading if it doesn't exist
if (typeof hideLoading !== 'function') {
  window.hideLoading = function () {
    const loadingIndicator = document.querySelector(".loading");
    if (loadingIndicator && loadingIndicator.parentNode) {
      loadingIndicator.parentNode.removeChild(loadingIndicator);
    }
  };
}

// Define loadTasksFromLocalStorage if it doesn't exist
if (typeof loadTasksFromLocalStorage !== 'function') {
  window.loadTasksFromLocalStorage = function () {
    try {
      window.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      console.log("Loaded tasks from localStorage:", window.tasks);
    } catch (e) {
      console.error("Error loading tasks from localStorage:", e);
      localStorage.removeItem("tasks"); // Clear corrupted data
      window.tasks = [];
    }
    
    if (typeof renderTasks === 'function') {
      renderTasks();
    }
  };
}

// Define saveTasks if it doesn't exist
if (typeof saveTasks !== 'function') {
  window.saveTasks = function () {
    try {
      localStorage.setItem("tasks", JSON.stringify(window.tasks || []));
      console.log("Tasks saved to localStorage as backup");
    } catch (e) {
      console.error("Error saving tasks to localStorage:", e);
    }
  };
}

// Define updateTaskCounter if it doesn't exist
if (typeof updateTaskCounter !== 'function') {
  window.updateTaskCounter = function () {
    if (!window.tasks) return;
    
    let taskTitle = document.querySelector(".task-list h2");
    if (!taskTitle) return;

    let counter = document.querySelector(".task-counter");
    
    // Count incomplete tasks
    const incompleteTasks = window.tasks.filter((task) => !task.completed).length;

    if (!counter) {
      counter = document.createElement("span");
      counter.className = "task-counter";
      taskTitle.appendChild(counter);
    }

    counter.textContent = incompleteTasks;
  };
}

// Override the original fetch functions to use authentication
window.originalFetchTasks = window.fetchTasks;
window.fetchTasks = function () {
  // Make sure tasks array and tasksList element exist
  window.tasks = window.tasks || [];
  const tasksList = document.getElementById("tasks");
  if (!tasksList) return;

  showLoading(tasksList);

  const headers = {};
  // Add auth token if available
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  fetchWithAuth("/api/tasks", { headers })
    .then((response) => response.json())
    .then((data) => {
      tasks = data;
      console.log("Loaded tasks from API:", tasks);
      hideLoading();
      renderTasks();
      updateTaskCounter();
    })
    .catch((error) => {
      console.error("Error loading tasks from API:", error);
      hideLoading();
      showNotification(
        "Could not connect to server. Using local data.",
        "error"
      );
      // Fallback to localStorage if API fails
      loadTasksFromLocalStorage();
    });
};

// Add CSS style for required fields and status indicators
const authStyle = document.createElement("style");
authStyle.textContent = `
  .required {
    color: #e53e3e;
    margin-left: 3px;
  }
  
  .form-hint {
    display: block;
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: 0.3rem;
  }
  
  .form-status {
    margin-top: 1rem;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
    text-align: center;
  }
  
  .status-loading {
    background-color: rgba(49, 130, 206, 0.1);
    color: #4299e1;
  }
  
  .status-success {
    background-color: rgba(56, 161, 105, 0.1);
    color: #48bb78;
  }
  
  .status-error {
    background-color: rgba(229, 62, 62, 0.1);
    color: #e53e3e;
  }
`;
document.head.appendChild(authStyle);
