/**
 * Daily Task Manager
 * - Allows adding tasks
 * - Toggle completion via checkbox
 * - Delete tasks
 * - Persists to LocalStorage
 */

// DOM elements
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");

// Storage key
const STORAGE_KEY = "daily_task_manager_tasks";

/**
 * Load tasks from LocalStorage
 * @returns {Array<{id:string, title:string, completed:boolean}>}
 */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Failed to read tasks:", err);
    return [];
  }
}

/**
 * Save tasks to LocalStorage
 * @param {Array} tasks
 */
function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.warn("Failed to save tasks:", err);
  }
}

/**
 * Create a unique ID for tasks
 * @returns {string}
 */
function createId() {
  // Combines timestamp with a random segment for low collision chance
  return `t_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

/**
 * Render all tasks to the DOM
 * @param {Array} tasks
 */
function render(tasks) {
  list.innerHTML = "";

  if (!tasks.length) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = `task-item${task.completed ? " completed" : ""}`;
    li.dataset.id = task.id;

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task completed");

    // Title
    const title = document.createElement("p");
    title.className = "task-title";
    title.textContent = task.title;

    // Actions (delete)
    const actions = document.createElement("div");
    actions.className = "task-actions";

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "Delete";
    del.setAttribute("aria-label", "Delete task");

    actions.appendChild(del);
    li.appendChild(checkbox);
    li.appendChild(title);
    li.appendChild(actions);

    list.appendChild(li);
  }
}

/**
 * Initialize app: load and render
 */
let tasks = loadTasks();
render(tasks);

/**
 * Handle adding a new task
 */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = input.value.trim();
  if (!value) return;

  const newTask = { id: createId(), title: value, completed: false };
  tasks.unshift(newTask);
  saveTasks(tasks);
  render(tasks);

  input.value = "";
  input.focus();
});

/**
 * Handle task list events: toggle complete and delete
 * Uses event delegation for performance and simplicity
 */
list.addEventListener("click", (e) => {
  const target = e.target;

  // Find the nearest task item
  const item = target.closest(".task-item");
  if (!item) return;

  const id = item.dataset.id;

  // Toggle completion via checkbox
  if (target.classList.contains("checkbox")) {
    tasks = tasks.map((t) =>
      t.id === id ? { ...t, completed: target.checked } : t
    );
    saveTasks(tasks);
    render(tasks);
    return;
  }

  // Delete via button
  if (target.classList.contains("delete-btn")) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks(tasks);
    render(tasks);
  }
});
