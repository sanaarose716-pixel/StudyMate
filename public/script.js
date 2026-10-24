const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");

let tasks = [];

async function loadTasks() {
    try {
        const response = await fetch("/api/tasks");

        if (!response.ok) {
            throw new Error("Could not load assignments");
        }

        tasks = await response.json();
        renderTasks();
    } catch (error) {
        taskList.innerHTML =
            "<p>Could not load assignments. Please try again later.</p>";
    }
}

function updateStats() {
    document.getElementById("totalTasks").textContent = tasks.length;

    document.getElementById("pendingTasks").textContent =
        tasks.filter(task => !task.completed).length;

    document.getElementById("completedTasks").textContent =
        tasks.filter(task => task.completed).length;
}

function renderTasks() {
    updateStats();

    const searchText = searchInput.value.toLowerCase();

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchText) ||
        task.subject.toLowerCase().includes(searchText)
    );

    if (filteredTasks.length === 0) {
        taskList.innerHTML = "<p>No assignments found.</p>";
        return;
    }

    taskList.innerHTML = "";

    filteredTasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "task-card";

        if (task.completed) {
            card.classList.add("completed");
        }

        const details = document.createElement("div");
        const title = document.createElement("h3");
        const subject = document.createElement("p");
        const dueDate = document.createElement("p");
        const priority = document.createElement("p");

        title.textContent = task.title;
        subject.textContent = "Subject: " + task.subject;
        dueDate.textContent = "Due: " + task.dueDate;
        priority.textContent = "Priority: " + task.priority;

        details.append(title, subject, dueDate, priority);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeButton = document.createElement("button");
        completeButton.textContent =
            task.completed ? "Undo" : "Complete";

        completeButton.addEventListener("click", () => {
            updateTask(task._id, !task.completed);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            deleteTask(task._id);
        });

        actions.append(completeButton, deleteButton);
        card.append(details, actions);
        taskList.appendChild(card);
    });
}

taskForm.addEventListener("submit", async event => {
    event.preventDefault();

    const newTask = {
        title: document.getElementById("taskTitle").value.trim(),
        subject: document.getElementById("taskSubject").value.trim(),
        dueDate: document.getElementById("taskDueDate").value,
        priority: document.getElementById("taskPriority").value
    };

    try {
        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTask)
        });

        if (!response.ok) {
            throw new Error("Could not add assignment");
        }

        taskForm.reset();
        await loadTasks();
    } catch (error) {
        alert("Could not add assignment. Please try again.");
    }
});

async function updateTask(id, completed) {
    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed })
        });

        if (!response.ok) {
            throw new Error("Could not update assignment");
        }

        await loadTasks();
    } catch (error) {
        alert("Could not update assignment.");
    }
}

async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this assignment?")) {
        return;
    }

    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Could not delete assignment");
        }

        await loadTasks();
    } catch (error) {
        alert("Could not delete assignment.");
    }
}

searchInput.addEventListener("input", renderTasks);

loadTasks();