document.addEventListener("DOMContentLoaded", function () {
  // UI enhancement variables
  let taskCount = 0;
  const notificationTimeout = 3000;
  let loadingIndicator;

  // Task manager functionality
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTask");
  const tasksList = document.getElementById("tasks");
  let tasks = [];

  // Navigation smooth scroll
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      window.scrollTo({
        top: targetSection.offsetTop,
        behavior: "smooth",
      });
    });
  });

  // Contact form handling
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    // Ensure the contact form has a proper form element
    if (!contactForm.querySelector("form")) {
      // Wrap existing content in a form element
      const formContent = contactForm.innerHTML;
      contactForm.innerHTML = `<form>${formContent}</form>`;
    }

    const form = contactForm.querySelector("form") || contactForm;

    // Add status indicator for form
    if (!form.querySelector(".form-status")) {
      const submitBtn = form.querySelector(".submit-btn");
      const statusElement = document.createElement("div");
      statusElement.className = "form-status";
      if (submitBtn) {
        form.insertBefore(statusElement, submitBtn.nextSibling);
      } else {
        form.appendChild(statusElement);
      }
    }

    // Update labels to indicate required fields
    const labels = form.querySelectorAll("label");
    labels.forEach((label) => {
      if (!label.querySelector(".required")) {
        label.innerHTML += ' <span class="required">*</span>';
      }
    });

    // Add required attribute to all inputs
    const inputs = form.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      input.setAttribute("required", "true");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const message = document.getElementById("message").value;
      const submitBtn = form.querySelector(".submit-btn");
      const statusElement = form.querySelector(".form-status");

      if (name && email && message) {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
        statusElement.textContent = "Sending your message...";
        statusElement.className = "form-status status-loading";

        // Send data to API
        fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, message }),
        })
          .then((response) => {
            // First check if response is ok before trying to parse JSON
            if (!response.ok) {
              // Try to get error information from response
              return response.text().then((text) => {
                let errorMsg = "Failed to submit contact form";
                // Try to parse as JSON, but handle if it's not valid JSON
                try {
                  const jsonErr = JSON.parse(text);
                  if (jsonErr.error) {
                    errorMsg = jsonErr.error;
                  }
                } catch (e) {
                  // If we can't parse as JSON, use the text directly
                  if (text && text.trim()) {
                    errorMsg = text;
                  }
                }
                throw new Error(errorMsg);
              });
            }
            // Parse the successful response
            return response.text().then((text) => {
              if (!text || !text.trim()) {
                return { message: "Message sent successfully!" };
              }

              try {
                return JSON.parse(text);
              } catch (e) {
                console.warn(
                  "Could not parse response as JSON, using default message:",
                  e
                );
                return { message: "Message sent successfully!" };
              }
            });
          })
          .then((data) => {
            statusElement.textContent =
              data.message ||
              "Thanks for your message! We'll get back to you soon.";
            statusElement.className = "form-status status-success";
            showNotification(
              data.message ||
                "Thanks for your message! We'll get back to you soon."
            );
            form.reset();

            // Show success animation
            createSuccessConfetti();
          })
          .catch((error) => {
            console.error("Error submitting contact form:", error);
            statusElement.textContent = error.message;
            statusElement.className = "form-status status-error";
            showNotification(error.message, "error");
          })
          .finally(() => {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Message";
          });
      } else {
        statusElement.textContent = "Please fill out all required fields.";
        statusElement.className = "form-status status-error";
        showNotification("Please fill out all required fields.", "error");
      }
    });
  }

  // Theme toggle functionality
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  if (themeToggle) {
    // Check for saved theme preference or use device preference
    const savedTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark");

    if (savedTheme === "light") {
      document.body.classList.add("light-theme");
      themeToggle.checked = true;
      themeIcon.classList.remove("fa-moon");
      themeIcon.classList.add("fa-sun");
    }

    // Listen for toggle changes
    themeToggle.addEventListener("change", function () {
      if (this.checked) {
        document.body.classList.add("light-theme");
        localStorage.setItem("theme", "light");
        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");
      } else {
        document.body.classList.remove("light-theme");
        localStorage.setItem("theme", "dark");
        themeIcon.classList.remove("fa-sun");
        themeIcon.classList.add("fa-moon");
      }
    });
  }

  // Hamburger menu functionality - ensure this is at the top of the script
  const hamburgerMenu = document.getElementById("hamburger-menu");
  const mobileNav = document.getElementById("mobile-nav");

  if (hamburgerMenu && mobileNav) {
    const mobileNavLinks = mobileNav.querySelectorAll(".nav-link");
    const mobileThemeToggle = document.getElementById("mobile-theme-toggle");
    const mobileThemeIcon = document.getElementById("mobile-theme-icon");
    const mobileCloseBtn = document.getElementById("mobile-close-btn");

    // Toggle mobile menu
    hamburgerMenu.addEventListener("click", function () {
      console.log("Hamburger clicked"); // For debugging
      hamburgerMenu.classList.toggle("open");
      mobileNav.classList.toggle("open");
      // Prevent body scrolling when menu is open
      document.body.style.overflow = mobileNav.classList.contains("open")
        ? "hidden"
        : "";
    });

    // Add close button functionality
    if (mobileCloseBtn) {
      mobileCloseBtn.addEventListener("click", function () {
        hamburgerMenu.classList.remove("open");
        mobileNav.classList.remove("open");
        document.body.style.overflow = "";
      });
    }

    // Close mobile menu when a nav link is clicked
    mobileNavLinks.forEach((link) => {
      link.addEventListener("click", function () {
        hamburgerMenu.classList.remove("open");
        mobileNav.classList.remove("open");
        document.body.style.overflow = "";
      });
    });

    // Initialize mobile theme toggle to match main theme toggle
    if (themeToggle && mobileThemeToggle) {
      mobileThemeToggle.checked = themeToggle.checked;
      if (themeToggle.checked) {
        mobileThemeIcon.classList.remove("fa-moon");
        mobileThemeIcon.classList.add("fa-sun");
      }

      // Sync theme toggles
      mobileThemeToggle.addEventListener("change", function () {
        // Sync with main theme toggle
        themeToggle.checked = this.checked;

        if (this.checked) {
          document.body.classList.add("light-theme");
          localStorage.setItem("theme", "light");
          mobileThemeIcon.classList.remove("fa-moon");
          mobileThemeIcon.classList.add("fa-sun");
          themeIcon.classList.remove("fa-moon");
          themeIcon.classList.add("fa-sun");
        } else {
          document.body.classList.remove("light-theme");
          localStorage.setItem("theme", "dark");
          mobileThemeIcon.classList.remove("fa-sun");
          mobileThemeIcon.classList.add("fa-moon");
          themeIcon.classList.remove("fa-sun");
          themeIcon.classList.add("fa-moon");
        }
      });

      // Update mobile theme toggle when main toggle changes
      themeToggle.addEventListener("change", function () {
        mobileThemeToggle.checked = this.checked;
        if (this.checked) {
          mobileThemeIcon.classList.remove("fa-moon");
          mobileThemeIcon.classList.add("fa-sun");
        } else {
          mobileThemeIcon.classList.remove("fa-sun");
          mobileThemeIcon.classList.add("fa-moon");
        }
      });
    }
  } else {
    console.error("Hamburger menu or mobile nav not found"); // For debugging
  }

  // Server health check
  checkServerHealth();

  // Initialize tasks from API
  fetchTasks();

  // Add task event
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", function () {
      if (typeof isLoggedIn === "function" && !isLoggedIn()) {
        showLoginPrompt();
      } else {
        addTask();
      }
    });
  }

  if (taskInput) {
    taskInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        if (typeof isLoggedIn === "function" && !isLoggedIn()) {
          showLoginPrompt();
        } else {
          addTask();
        }
      }
    });
  }

  // Show login prompt when user is not authenticated
  function showLoginPrompt() {
    showNotification("Please log in to add tasks", "info");
    // Scroll to the auth container
    const authContainer = document.getElementById("auth-container");
    if (authContainer) {
      authContainer.classList.remove("hidden");
      authContainer.scrollIntoView({ behavior: "smooth" });
    }
  }

  function checkServerHealth() {
    fetch("/api/health")
      .then((response) => response.json())
      .then((data) => {
        console.log("Server health:", data);
      })
      .catch((error) => {
        console.error("Health check failed:", error);
      });
  }

  // Enhanced fetchTasks function
  window.fetchTasks = function () {
    if (!tasksList) return;

    showLoading(tasksList);

    const headers = {};
    // Add auth token if available from auth.js
    const authToken = localStorage.getItem("auth_token");
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    fetch("/api/tasks", { headers })
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

  function loadTasksFromLocalStorage() {
    try {
      tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      console.log("Loaded tasks from localStorage:", tasks);
    } catch (e) {
      console.error("Error loading tasks from localStorage:", e);
      localStorage.removeItem("tasks"); // Clear corrupted data
      tasks = [];
    }
    renderTasks();
  }

  // Enhanced addTask function
  window.addTask = async function () {
    if (!taskInput) return;

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

        const headers = {
          "Content-Type": "application/json",
        };

        // Add auth token if available
        const authToken = localStorage.getItem("auth_token");
        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`;
        }

        // Send to API
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers,
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

  window.deleteTask = async function (id) {
    try {
      const headers = {};
      // Add auth token if available
      const authToken = localStorage.getItem("auth_token");
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      // Delete from API
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to delete task from API");
      }

      showNotification("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task from API:", error);
      showNotification(
        "Error deleting task. Removed from local view only.",
        "error"
      );
    }

    // Update local state regardless of API success
    // (optimistic update pattern)
    tasks = tasks.filter((task) => task.id !== id);
    console.log("Task deleted, remaining tasks:", tasks);
    saveTasks(); // Backup to localStorage
    renderTasks();
  };

  // Enhanced toggleComplete function with better error handling
  window.toggleComplete = async function (id) {
    // Find the task
    const taskIndex = tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      console.error(`Task with ID ${id} not found in client-side data`);
      showNotification("Task not found - the data may be out of sync", "error");
      // Refresh tasks from server
      fetchTasks();
      return;
    }

    // Create updated task
    const wasCompleted = tasks[taskIndex].completed;
    const updatedTask = {
      ...tasks[taskIndex],
      completed: !wasCompleted,
    };

    console.log(`Toggling task ${id} completion status to ${!wasCompleted}`);

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      // Add auth token if available
      const authToken = localStorage.getItem("auth_token");
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      // Update in API
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server error: ${errorText}`);
        throw new Error(`Failed to update task: ${response.status}`);
      }

      try {
        const responseData = await response.json();
        console.log("Update successful:", responseData);
      } catch (jsonError) {
        console.warn(
          "Could not parse JSON response, but update may have succeeded"
        );
      }

      // If task was completed, show confetti
      if (!wasCompleted && updatedTask.completed) {
        createConfetti();
        showNotification("Task completed! 🎉");
      } else if (wasCompleted && !updatedTask.completed) {
        showNotification("Task marked as incomplete");
      }
    } catch (error) {
      console.error("Error updating task in API:", error);
      showNotification(`Update failed: ${error.message}`, "error");

      // Continue with local update despite API failure
      console.log("Continuing with local update only");
    }

    // Update local state (optimistic update)
    tasks[taskIndex] = updatedTask;
    console.log("Task toggled locally:", updatedTask);
    saveTasks(); // Backup to localStorage
    renderTasks();
    updateTaskCounter();
  };

  // Enhanced renderTasks function
  window.renderTasks = function () {
    if (!tasksList) return;

    tasksList.innerHTML = "";
    console.log("Rendering tasks, count:", tasks ? tasks.length : 0);

    if (!tasks || tasks.length === 0) {
      const emptyMessage = document.createElement("li");
      emptyMessage.className = "empty-message";
      emptyMessage.textContent = "No tasks yet. Add one above!";
      tasksList.appendChild(emptyMessage);
      return;
    }

    // Sort tasks: incomplete first, then by ID (newest first)
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return b.id - a.id;
    });

    sortedTasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.style.animationDelay = index * 0.05 + "s"; // Staggered animation

      const taskSpan = document.createElement("span");
      taskSpan.textContent = task.text;
      taskSpan.className = "task-text";
      if (task.completed) {
        taskSpan.classList.add("completed");
      }

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "actions";

      const completeBtn = document.createElement("button");
      completeBtn.textContent = task.completed ? "Undo" : "Complete";
      completeBtn.className = "complete-btn";
      completeBtn.onclick = function () {
        toggleComplete(task.id);
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "delete-btn";
      deleteBtn.onclick = function () {
        deleteTask(task.id);
      };

      actionsDiv.appendChild(completeBtn);
      actionsDiv.appendChild(deleteBtn);

      li.appendChild(taskSpan);
      li.appendChild(actionsDiv);

      tasksList.appendChild(li);
    });

    updateTaskCounter();
  };

  function saveTasks() {
    try {
      localStorage.setItem("tasks", JSON.stringify(tasks));
      console.log("Tasks saved to localStorage as backup");
    } catch (e) {
      console.error("Error saving tasks to localStorage:", e);
    }
  }

  // Enhanced notification system
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
    }, notificationTimeout);
  };

  // Create and show loading indicator
  window.showLoading = function (parentElement) {
    loadingIndicator = document.createElement("div");
    loadingIndicator.className = "loading";
    loadingIndicator.innerHTML = "<span></span><span></span><span></span>";
    parentElement.appendChild(loadingIndicator);
  };

  // Hide loading indicator
  window.hideLoading = function () {
    if (loadingIndicator && loadingIndicator.parentNode) {
      loadingIndicator.parentNode.removeChild(loadingIndicator);
    }
  };

  // Update task counter
  function updateTaskCounter() {
    let taskTitle = document.querySelector(".task-list h2");
    if (!taskTitle) return;

    let counter = document.querySelector(".task-counter");

    // Count incomplete tasks
    const incompleteTasks = tasks.filter((task) => !task.completed).length;

    if (!counter) {
      counter = document.createElement("span");
      counter.className = "task-counter";
      taskTitle.appendChild(counter);
    }

    counter.textContent = incompleteTasks;

    // Animate counter if count changed
    if (taskCount !== tasks.length) {
      counter.style.animation = "none";
      void counter.offsetWidth; // Trigger reflow
      counter.style.animation = "pulse 1s";
      taskCount = tasks.length;
    }
  }

  // Create confetti effect
  window.createConfetti = function () {
    const confettiContainer = document.createElement("div");
    confettiContainer.className = "confetti-container";
    document.body.appendChild(confettiContainer);

    const colors = [
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim(),
      getComputedStyle(document.documentElement)
        .getPropertyValue("--secondary")
        .trim(),
      getComputedStyle(document.documentElement)
        .getPropertyValue("--tertiary")
        .trim(),
    ];

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
      confetti.style.background =
        colors[Math.floor(Math.random() * colors.length)];

      // Random shape
      if (Math.random() > 0.5) {
        confetti.style.borderRadius = "50%";
      } else if (Math.random() > 0.5) {
        confetti.style.width = "5px";
        confetti.style.height = "15px";
      }

      confettiContainer.appendChild(confetti);

      // Fall animation
      confetti.animate(
        [
          { transform: "translateY(-10vh) rotate(0deg)", opacity: 1 },
          {
            transform: `translateY(100vh) rotate(${Math.random() * 360}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: Math.random() * 3000 + 2000,
          easing: "cubic-bezier(0.2, 0.8, 0.9, 0.8)",
        }
      );
    }

    // Remove confetti after animation
    setTimeout(() => {
      confettiContainer.remove();
    }, 5000);
  };

  // Create success confetti effect for contact form
  window.createSuccessConfetti = function () {
    const contactSection = document.getElementById("contact");

    // Create confetti container
    const confettiContainer = document.createElement("div");
    confettiContainer.className = "confetti-container";
    document.body.appendChild(confettiContainer);

    // Get theme colors
    const colors = [
      getComputedStyle(document.documentElement)
        .getPropertyValue("--success-color")
        .trim(),
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim(),
      getComputedStyle(document.documentElement)
        .getPropertyValue("--secondary")
        .trim(),
    ];

    // Create confetti pieces
    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
      confetti.style.background =
        colors[Math.floor(Math.random() * colors.length)];

      // Random shape
      if (Math.random() > 0.5) {
        confetti.style.borderRadius = "50%";
      } else if (Math.random() > 0.5) {
        confetti.style.width = "5px";
        confetti.style.height = "15px";
      }

      confettiContainer.appendChild(confetti);
    }

    // Remove confetti after animation
    setTimeout(() => {
      confettiContainer.remove();
    }, 4000);
  };

  // Call updateTaskCounter on initial load
  updateTaskCounter();

  // Add this to verify the script is loaded correctly
  console.log("Neon Task Manager loaded successfully");

  // Add subtle background animation
  createNeonBackground();
});

// Create subtle neon background effect
function createNeonBackground() {
  const heroSection = document.querySelector(".hero");
  if (!heroSection) return;

  for (let i = 0; i < 5; i++) {
    const glowDot = document.createElement("div");
    glowDot.className = "glow-dot";
    glowDot.style.cssText = `
      position: absolute;
      width: ${Math.random() * 200 + 100}px;
      height: ${Math.random() * 200 + 100}px;
      background: radial-gradient(circle, 
        rgba(${Math.random() > 0.5 ? "0, 255, 255" : "255, 0, 255"}, 0.1) 0%, 
        transparent 70%);
      top: ${Math.random() * 100}%;
      left: ${Math.random() * 100}%;
      filter: blur(${Math.random() * 10 + 5}px);
      opacity: ${Math.random() * 0.3 + 0.1};
      z-index: -1;
      animation: float ${Math.random() * 10 + 20}s infinite ease-in-out;
    `;

    heroSection.appendChild(glowDot);
  }
}

// Add CSS style for form status indicators
document.addEventListener("DOMContentLoaded", function () {
  const formStyle = document.createElement("style");
  formStyle.textContent = `
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
    
    .notification.info {
      border-left-color: var(--info-color);
    }
  `;
  document.head.appendChild(formStyle);
});
