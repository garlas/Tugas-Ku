const task = JSON.parse(localStorage.getItem("selectedTask"));
const container = document.getElementById("taskDetail");

// Jika task tidak ditemukan, redirect langsung
if (!task) {
  window.location.href = "index.html";
}

const renderTask = () => {
  if (!task || !container) return;

  const deadline = new Date(task.deadline).toLocaleString();
  const isCompleted = !!task.completedAt;

  container.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <h1 class="text-xl font-bold text-gray-800">${task.title}</h1>
      ${
        isCompleted
          ? `<span class="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">Selesai</span>`
          : ""
      }
    </div>
    <p class="text-gray-700 mb-2">${
      task.description || "Tidak ada deskripsi."
    }</p>
    <p class="text-sm text-gray-500">🕒 Deadline: ${deadline}</p>
    ${
      !isCompleted
        ? `
        <div id="actionButtons" class="mt-6 flex flex-col sm:flex-row gap-2">
          <button id="editBtn" class="bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded">Edit</button>
          <button id="deleteBtn" class="bg-red-500 hover:bg-red-600 text-white py-2 rounded">Hapus</button>
          <button id="completeBtn" class="bg-green-500 hover:bg-green-600 text-white py-2 rounded">Selesai</button>
        </div>
        `
        : ""
    }
  `;
};

renderTask();

// Edit form refs
const editFormContainer = document.getElementById("editFormContainer");
const editTaskForm = document.getElementById("editTaskForm");
const editTitle = document.getElementById("editTitle");
const editDescription = document.getElementById("editDescription");
const cancelEdit = document.getElementById("cancelEdit");

let taskBeingEdited = null;

document.addEventListener("click", (e) => {
  // Selesai
  if (e.target.id === "completeBtn") {
    task.completedAt = Date.now();
    localStorage.setItem("selectedTask", JSON.stringify(task));

    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const updated = tasks.map((t) =>
      t.id === task.id ? { ...t, completedAt: task.completedAt } : t
    );
    localStorage.setItem("tasks", JSON.stringify(updated));

    renderTask();
    document.getElementById("successMessage").classList.remove("hidden");
  }

  // Hapus
  if (e.target.id === "deleteBtn") {
    let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    tasks = tasks.filter((t) => t.id !== task.id);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.removeItem("selectedTask");
    window.location.href = "index.html";
  }

  // Edit
  if (e.target.id === "editBtn") {
    taskBeingEdited = task;
    editTitle.value = task.title;
    editDescription.value = task.description;

    editFormContainer.classList.remove("hidden");
    setTimeout(() => {
      document.getElementById("editForm").classList.remove("translate-y-full");
    }, 10);
  }
});

// Cancel edit
cancelEdit?.addEventListener("click", () => {
  editFormContainer.classList.add("hidden");
  document.getElementById("editForm").classList.add("translate-y-full");
});

// Simpan edit
editTaskForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  taskBeingEdited.title = editTitle.value;
  taskBeingEdited.description = editDescription.value;

  localStorage.setItem("selectedTask", JSON.stringify(taskBeingEdited));

  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const updated = tasks.map((t) =>
    t.id === taskBeingEdited.id ? taskBeingEdited : t
  );
  localStorage.setItem("tasks", JSON.stringify(updated));

  renderTask();
  editFormContainer.classList.add("hidden");
  document.getElementById("editForm").classList.add("translate-y-full");
});

// Cek auto hapus setiap 1 detik pada halaman taskDetail.html
const checkAutoDelete = () => {
  const latestTask = JSON.parse(localStorage.getItem("selectedTask"));
  const now = Date.now();

  if (latestTask?.completedAt && now - latestTask.completedAt >= 10 * 1000) {
    let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    tasks = tasks.filter((t) => t.id !== latestTask.id);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.removeItem("selectedTask");
    window.location.href = "index.html";
  }
};

// Set auto delete check interval setiap 1 detik pada halaman task detail
setInterval(checkAutoDelete, 1000);
