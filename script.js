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
    note: "modo_note",
    notifications: "modo_notifications"
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

const taskPreview = document.getElementById("taskPreview");
const taskListFull = document.getElementById("taskListFull");
const taskCountEl = document.getElementById("taskCount");
const addTaskBtnFull = document.getElementById("addTaskBtnFull");
const filterButtons = document.querySelectorAll(".filter-btn");

const taskModal = document.getElementById("taskModal");
const taskInput = document.getElementById("taskInput");
const taskTime = document.getElementById("taskTime");
const cancelTaskBtn = document.getElementById("cancelTask");
const confirmTaskBtn = document.getElementById("confirmTask");

const MAX_PREVIEW = 4;
let taskFilter = "all";

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function emptyStateHtml(message, submessage) {
    return `
        <div class="empty-state">
            <div class="empty-icon">${ICONS.checkSquare}</div>
            <p>${message}</p>
            <span>${submessage}</span>
        </div>
    `;
}

/* --- Preview (Início, somente leitura) --- */

function renderPreview() {
    if (!taskPreview) return;

    if (tasks.length === 0) {
        taskPreview.innerHTML = emptyStateHtml("Nenhuma tarefa ainda.", "Adicione algo que precisa fazer hoje.");
        return;
    }

    // Pendentes primeiro, concluídas depois
    const sorted = [...tasks].sort((a, b) => Number(a.done) - Number(b.done));
    const visible = sorted.slice(0, MAX_PREVIEW);
    const remaining = tasks.length - visible.length;

    let html = visible.map(task => `
        <div class="preview-item${task.done ? " done" : ""}">
            <span class="preview-dot"></span>
            <span class="preview-text">${escapeHtml(task.text)}</span>
        </div>
    `).join("");

    if (remaining > 0) {
        html += `<div class="preview-more">+${remaining} tarefa${remaining > 1 ? "s" : ""}</div>`;
    }

    taskPreview.innerHTML = html;
}

/* --- Lista completa (view Tarefas, interativa) --- */

function taskItemHtml(task) {

    const index = tasks.indexOf(task);

    return `
        <div class="task-item${task.done ? " done" : ""}">

            <label class="task-checkbox">

                <input
                    type="checkbox"
                    data-index="${index}"
                    ${task.done ? "checked" : ""}
                >

                <span class="checkbox-visual"></span>

            </label>


            <div class="task-content">

                <span class="task-text">
                    ${escapeHtml(task.text)}
                </span>

                ${
                    task.time
                        ? `<span class="task-time">
                            ⏰ ${task.time}
                           </span>`
                        : ""
                }

            </div>


            <button
                class="task-delete"
                data-index="${index}"
                aria-label="Remover tarefa"
            >
                ${ICONS.trash}
            </button>

        </div>
    `;
}

function getFilteredTasks() {
    if (taskFilter === "pending") return tasks.filter(t => !t.done);
    if (taskFilter === "done") return tasks.filter(t => t.done);
    return tasks;
}

const FILTER_MESSAGES = {
    all: { message: "Nenhuma tarefa ainda.", submessage: "Adicione algo que precisa fazer hoje." },
    pending: { message: "Nenhuma tarefa pendente.", submessage: "Você está em dia! 🎉" },
    done: { message: "Nenhuma tarefa concluída ainda.", submessage: "Marque uma tarefa como feita para vê-la aqui." }
};

function renderFullList() {
    if (!taskListFull) return;

    const filtered = getFilteredTasks();
    const { message, submessage } = FILTER_MESSAGES[taskFilter];

    taskListFull.innerHTML = filtered.length === 0
        ? emptyStateHtml(message, submessage)
        : filtered.map(taskItemHtml).join("");
}

/* --- Render geral --- */

function renderTasks() {
    renderPreview();
    renderFullList();

    const pending = tasks.filter(task => !task.done).length;
    taskCountEl.textContent = pending;
}

function addTask(text) {

    const trimmed = text.trim();

    if (!trimmed) return;

    const newTask = {
        id: Date.now(),
        text: trimmed,
        time: taskTime ? (taskTime.value || null) : null,
        done: false,
        lastNotifiedDate: null
    };

    tasks.push(newTask);

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

if (taskListFull) {
    taskListFull.addEventListener("click", (event) => {
        const deleteBtn = event.target.closest(".task-delete");
        if (deleteBtn) deleteTask(Number(deleteBtn.dataset.index));
    });

    taskListFull.addEventListener("change", (event) => {
        if (event.target.matches('input[type="checkbox"]')) {
            toggleTask(Number(event.target.dataset.index));
        }
    });
}

/* --- Filtros --- */

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        taskFilter = btn.dataset.filter;
        renderFullList();
    });
});

/* --- Modal de nova tarefa --- */

function openModal() {
    taskModal.classList.add("open");

    taskInput.value = "";

    if(taskTime) {
        taskTime.value = "";
    }

    taskInput.focus();
}

function closeModal() {
    taskModal.classList.remove("open");
}

if (addTaskBtnFull) addTaskBtnFull.addEventListener("click", openModal);

cancelTaskBtn.addEventListener("click", closeModal);

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

/* =========================
   NAVEGAÇÃO DO MENU
========================= */

const menuButtons = document.querySelectorAll(".menu-item[data-view]");
const views = document.querySelectorAll(".view");

function switchView(target) {
    menuButtons.forEach(b => b.classList.toggle("active", b.dataset.view === target));
    views.forEach(view => view.classList.toggle("active", view.dataset.view === target));
}

menuButtons.forEach(button => {
    button.addEventListener("click", () => switchView(button.dataset.view));
});

document.querySelectorAll("[data-view-link]").forEach(link => {
    link.addEventListener("click", () => switchView(link.dataset.viewLink));
});

/* =========================
   NOTIFICAÇÕES
========================= */

const notificationStatus =
    document.getElementById("notificationStatus");

const enableNotifications =
    document.getElementById("enableNotifications");

const testNotification =
    document.getElementById("testNotification");


let notificationsEnabled =
    localStorage.getItem(STORAGE_KEYS.notifications) === "true";


function updateNotificationUI() {

    if (!notificationStatus || !enableNotifications) {
        return;
    }

    if (!("Notification" in window)) {

        notificationStatus.textContent =
            "Não suportadas neste navegador";

        enableNotifications.textContent =
            "Indisponível";

        enableNotifications.disabled = true;

        return;
    }


    if (Notification.permission === "granted") {

        notificationStatus.textContent =
            "Ativadas";

        enableNotifications.textContent =
            "Ativadas";

        notificationsEnabled = true;

    } else if (Notification.permission === "denied") {

        notificationStatus.textContent =
            "Bloqueadas no navegador";

        enableNotifications.textContent =
            "Bloqueadas";

    } else {

        notificationStatus.textContent =
            "Desativadas";

        enableNotifications.textContent =
            "Ativar";
    }
}


async function requestNotificationPermission() {

    if (!("Notification" in window)) {

        alert(
            "O seu navegador não suporta notificações."
        );

        return;
    }


    const permission =
        await Notification.requestPermission();


    if (permission === "granted") {

        notificationsEnabled = true;

        localStorage.setItem(
            STORAGE_KEYS.notifications,
            "true"
        );

        new Notification("MODO", {
            body: "Notificações ativadas com sucesso! 🔔"
        });

    } else {

        notificationsEnabled = false;

        localStorage.setItem(
            STORAGE_KEYS.notifications,
            "false"
        );
    }


    updateNotificationUI();
}


function sendNotification(title, body) {

    if (!notificationsEnabled) {
        return;
    }

    if (!("Notification" in window)) {
        return;
    }

    if (Notification.permission !== "granted") {
        return;
    }


    new Notification(title, {
        body: body,
        icon: "favicon.ico"
    });
}


function testNotificationNow() {

    if (Notification.permission !== "granted") {

        requestNotificationPermission();

        return;
    }


    sendNotification(
        "MODO 🔔",
        "As notificações estão funcionando corretamente!"
    );
}


if (enableNotifications) {

    enableNotifications.addEventListener(
        "click",
        requestNotificationPermission
    );

}


if (testNotification) {

    testNotification.addEventListener(
        "click",
        testNotificationNow
    );

}


updateNotificationUI();


/* =========================
   VERIFICAR LEMBRETES
========================= */

/* =========================
   LEMBRETES DE TAREFAS
========================= */

function getTodayKey() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function checkTaskReminders() {

    if (!notificationsEnabled) {
        return;
    }

    if (!("Notification" in window)) {
        return;
    }

    if (Notification.permission !== "granted") {
        return;
    }

    const now = new Date();

    const currentHour = String(
        now.getHours()
    ).padStart(2, "0");

    const currentMinute = String(
        now.getMinutes()
    ).padStart(2, "0");

    const currentTime =
        `${currentHour}:${currentMinute}`;

    const todayKey = getTodayKey();

    let changed = false;


    tasks.forEach(task => {

        // Não existe horário
        if (!task.time) {
            return;
        }

        // Tarefa já concluída
        if (task.done) {
            return;
        }

        // Já foi notificada hoje
        if (task.lastNotifiedDate === todayKey) {
            return;
        }


        if (task.time === currentTime) {

            sendNotification(
                "MODO — Lembrete 🔔",
                `Está na hora: ${task.text}`
            );

            task.lastNotifiedDate = todayKey;

            changed = true;
        }

    });


    if (changed) {
        saveTasks();
        renderTasks();
    }
}


/*
   Verificação inicial
*/
checkTaskReminders();


/*
   Verificar a cada 30 segundos
*/
setInterval(
    checkTaskReminders,
    30000
);


/*
   Verifica a cada 30 segundos.
*/

checkTaskReminders();

setInterval(
    checkTaskReminders,
    30000
);