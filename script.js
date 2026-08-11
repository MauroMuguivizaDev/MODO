console.log("MODO V1 iniciado");

/* =========================
   ÍCONES (SVG inline)
========================= */

const ICONS = {
    sun: `<svg class="icon icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
    cloudSun: `<svg class="icon icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/></svg>`,
    moon: `<svg class="icon icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    trash: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    checkSquare: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 12 2 2 4-4"/></svg>`
};

/* =========================
   LOCALSTORAGE
========================= */

const STORAGE_KEYS = {
    tasks: "modo_tasks",
    note: "modo_note"
};

function loadTasks() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.tasks);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error("Não foi possível carregar as tarefas guardadas:", err);
        return [];
    }
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
}

let tasks = loadTasks();

/* =========================
   SAUDAÇÃO E DATA
========================= */

const userName = "Mauro";

const currentDateEl = document.getElementById("currentDate");
const greetingTextEl = document.getElementById("greetingText");
const greetingIconEl = document.getElementById("greetingIcon");

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function updateDate() {
    const today = new Date();

    const formatted = today.toLocaleDateString("pt-PT", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });

    currentDateEl.textContent = capitalize(formatted);
}

function updateGreeting() {
    const hour = new Date().getHours();

    let greeting;
    let icon;

    if (hour >= 5 && hour < 12) {
        greeting = "Bom dia";
        icon = ICONS.sun;
    } else if (hour >= 12 && hour < 18) {
        greeting = "Boa tarde";
        icon = ICONS.cloudSun;
    } else {
        greeting = "Boa noite";
        icon = ICONS.moon;
    }

    greetingTextEl.textContent = `${greeting}, ${userName}`;
    greetingIconEl.innerHTML = icon;
}

updateDate();
updateGreeting();

/* =========================
   TAREFAS
========================= */

const taskList = document.getElementById("taskList");
const taskCountEl = document.getElementById("taskCount");
const addTaskBtn = document.getElementById("addTaskBtn");

const taskModal = document.getElementById("taskModal");
const taskInput = document.getElementById("taskInput");
const cancelTaskBtn = document.getElementById("cancelTask");
const confirmTaskBtn = document.getElementById("confirmTask");

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function renderTasks() {
    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${ICONS.checkSquare}</div>
                <p>Nenhuma tarefa ainda.</p>
                <span>Adicione algo que precisa fazer hoje.</span>
            </div>
        `;
    } else {
        tasks.forEach((task, index) => {
            const item = document.createElement("div");
            item.className = "task-item" + (task.done ? " done" : "");

            item.innerHTML = `
                <label class="task-checkbox">
                    <input type="checkbox" data-index="${index}" ${task.done ? "checked" : ""}>
                    <span class="checkbox-visual"></span>
                </label>
                <span class="task-text">${escapeHtml(task.text)}</span>
                <button class="task-delete" data-index="${index}" aria-label="Remover tarefa">
                    ${ICONS.trash}
                </button>
            `;

            taskList.appendChild(item);
        });
    }

    const pending = tasks.filter(task => !task.done).length;
    taskCountEl.textContent = pending;
}

function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    tasks.push({ text: trimmed, done: false });
    saveTasks();
    renderTasks();
}

function toggleTask(index) {
    tasks[index].done = !tasks[index].done;
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

// Delegação de eventos (funciona mesmo depois de re-renderizar a lista)
taskList.addEventListener("click", (event) => {
    const deleteBtn = event.target.closest(".task-delete");
    if (deleteBtn) {
        deleteTask(Number(deleteBtn.dataset.index));
    }
});

taskList.addEventListener("change", (event) => {
    if (event.target.matches('input[type="checkbox"]')) {
        toggleTask(Number(event.target.dataset.index));
    }
});

/* --- Modal de nova tarefa --- */

function openModal() {
    taskModal.classList.add("open");
    taskInput.value = "";
    taskInput.focus();
}

function closeModal() {
    taskModal.classList.remove("open");
}

addTaskBtn.addEventListener("click", openModal);
cancelTaskBtn.addEventListener("click", closeModal);

// Fecha clicando fora do card do modal
taskModal.addEventListener("click", (event) => {
    if (event.target === taskModal) closeModal();
});

confirmTaskBtn.addEventListener("click", () => {
    addTask(taskInput.value);
    closeModal();
});

taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addTask(taskInput.value);
        closeModal();
    }
    if (event.key === "Escape") {
        closeModal();
    }
});

renderTasks();

/* =========================
   NOTA RÁPIDA (autosave)
========================= */

const quickNote = document.getElementById("quickNote");
let noteSaveTimeout = null;

quickNote.value = localStorage.getItem(STORAGE_KEYS.note) || "";

quickNote.addEventListener("input", () => {
    clearTimeout(noteSaveTimeout);
    noteSaveTimeout = setTimeout(() => {
        localStorage.setItem(STORAGE_KEYS.note, quickNote.value);
    }, 400);
});

const menuButtons = document.querySelectorAll(".menu-item[data-view]");
const views = document.querySelectorAll(".view");

menuButtons.forEach(button => {
    button.addEventListener("click", () => {
        const target = button.dataset.view;

        menuButtons.forEach(b => b.classList.remove("active"));
        button.classList.add("active");

        views.forEach(view => {
            view.classList.toggle("active", view.dataset.view === target);
        });
    });
});