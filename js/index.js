// === HAMBURGER MENU ===
const hamburgerBtn = document.getElementById("hamburgerBtn");
const slideMenu = document.getElementById("slideMenu");

hamburgerBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  const expanded = hamburgerBtn.getAttribute("aria-expanded") === "true";
  const newState = !expanded;

  hamburgerBtn.setAttribute("aria-expanded", String(newState));
  hamburgerBtn.classList.toggle("open", newState);
  slideMenu?.classList.toggle("open", newState);
  slideMenu?.setAttribute("aria-hidden", String(!newState));
  localStorage.setItem("menuOpen", String(newState));
});

document.addEventListener("click", (e) => {
  if (
    hamburgerBtn &&
    slideMenu &&
    !hamburgerBtn.contains(e.target) &&
    !slideMenu.contains(e.target) &&
    slideMenu.classList.contains("open")
  ) {
    hamburgerBtn.classList.remove("open");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    slideMenu.classList.remove("open");
    slideMenu.setAttribute("aria-hidden", "true");
    localStorage.setItem("menuOpen", "false");
  }
});

// Cek status menu saat halaman dimuat
const isMenuOpen = localStorage.getItem("menuOpen") === "true";
if (isMenuOpen) {
  hamburgerBtn?.classList.add("open");
  hamburgerBtn?.setAttribute("aria-expanded", "true");
  slideMenu?.classList.add("open");
  slideMenu?.setAttribute("aria-hidden", "false");
}

// === USER LOGIN ===
const greeting = document.getElementById("greeting");
const taskHistory = document.getElementById("taskHistory");
const emptyMessage = document.getElementById("emptyMessage");
const daftarBtn = document.getElementById("daftarBtn");
const signupText = document.getElementById("signupText");

fetch("http://localhost:3000/me", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
})
  .then((response) => {
    if (!response.ok) throw new Error("Unauthorized");
    return response.json();
  })
  .then((user) => {
    if (greeting) greeting.textContent = `Hey, ${user.name}`;
    if (daftarBtn) daftarBtn.classList.add("hidden");
    if (signupText)
      signupText.textContent = `Ayo buat rencana sekarang, agar tidak kelupaan!`;
  })
  .catch(() => {
    if (daftarBtn) daftarBtn.classList.remove("hidden");
  });

// === Task Management ===
const taskForm = document.getElementById("taskForm");
const successAlert = document.getElementById("successAlert");

const plusButton = document.getElementById("plusButton");
const closeIcon = document.getElementById("closeIcon");
const plusIcon = document.getElementById("plusIcon");
const overlay = document.getElementById("overlay");
const taskPanel = document.getElementById("taskPanel");

plusButton?.addEventListener("click", () => {
  taskPanel.classList.toggle("translate-y-full");
  plusIcon.classList.toggle("opacity-0");
  closeIcon.classList.toggle("opacity-100");
  closeIcon.classList.toggle("scale-100");
  overlay.classList.toggle("hidden");
});

overlay?.addEventListener("click", () => {
  taskPanel.classList.add("translate-y-full");
  plusIcon.classList.remove("opacity-0");
  closeIcon.classList.remove("opacity-100", "scale-100");
  overlay.classList.add("hidden");
});

taskForm?.addEventListener("submit", function (e) {
  e.preventDefault();
  const titleInput = document.getElementById("titleInput");
  const descInput = document.getElementById("descInput");
  const deadlineInput = document.getElementById("deadlineInput");
  const reminderInput = document.getElementById("reminderInput");
  const soundToggle = document.getElementById("soundToggle");

  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  const deadline = deadlineInput.value;
  const reminder = reminderInput.value;
  const sound = soundToggle.checked;

  if (!title || !deadline) {
    alert("Harap isi judul dan deadline!");
    return;
  }

  const task = {
    id: Date.now(),
    title,
    description,
    deadline,
    reminder,
    sound,
    completedAt: null, // Status task
  };

  saveTaskToLocalStorage(task); // Simpan ke localStorage
  renderTaskHistoryFromLocalStorage(); // Perbarui tampilan tanpa refresh

  taskPanel.classList.add("translate-y-full");
  plusIcon.classList.remove("opacity-0");
  closeIcon.classList.remove("opacity-100", "scale-100");
  overlay.classList.add("hidden");

  titleInput.value = "";
  descInput.value = "";
  deadlineInput.value = "";
  reminderInput.value = "0";
  soundToggle.checked = false;

  emptyMessage?.classList.add("hidden");
  successAlert?.classList.remove("hidden");
  setTimeout(() => successAlert?.classList.add("hidden"), 3000);
});

// === Rendering Task History ===
function addTaskToDOM(task) {
  const taskItem = document.createElement("div");
  taskItem.className =
    "task-item p-4 border border-gray-300 rounded-lg space-y-2";

  taskItem.innerHTML = `  
      <h3 class="text-lg font-semibold">${task.title}</h3>
      <p class="text-sm text-gray-500">${task.description}</p>
      <p class="text-xs text-gray-400">Deadline: ${new Date(
        task.deadline
      ).toLocaleString()}</p>
      <p class="text-xs text-gray-400">Ingatkan: ${
        task.reminder ? task.reminder + " jam sebelumnya" : "Tidak ada"
      }</p>
      <p class="text-xs text-gray-400">${
        task.sound ? "Suara aktif" : "Suara non-aktif"
      }
    `;

  const deleteBtn = taskItem.querySelector(".delete-btn");
  deleteBtn?.addEventListener("click", (e) => {
    e.stopPropagation(); // Menghindari trigger click untuk detail task

    // Hapus task dari localStorage
    markTaskAsCompleted(task.id); // Tandai task sebagai selesai
    taskItem.querySelector(".delete-btn").classList.add("hidden"); // Sembunyikan tombol setelah selesai
    renderTaskHistoryFromLocalStorage(); // Update tampilan setelah task dihapus atau diselesaikan
  });

  taskItem.addEventListener("click", () => {
    localStorage.setItem("selectedTask", JSON.stringify(task));
    window.location.href = "task-detail.html";
  });

  taskHistory?.appendChild(taskItem);
}

function renderTaskHistoryFromLocalStorage() {
  const taskHistory = document.getElementById("taskHistory");
  const emptyMessage = document.getElementById("emptyMessage");

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  taskHistory.innerHTML = "";

  if (tasks.length === 0) {
    emptyMessage.classList.remove("hidden");
    taskHistory.classList.add("hidden");
  } else {
    emptyMessage.classList.add("hidden");
    taskHistory.classList.remove("hidden");
    tasks.forEach(addTaskToDOM);
  }
}

function saveTaskToLocalStorage(task) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function markTaskAsCompleted(taskId) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const updatedTasks = tasks.map((task) =>
    task.id === taskId ? { ...task, completedAt: Date.now() } : task
  );
  localStorage.setItem("tasks", JSON.stringify(updatedTasks));
}

// Menampilkan task saat halaman dimuat
window.addEventListener("DOMContentLoaded", renderTaskHistoryFromLocalStorage);

// Memperbarui task history saat perubahan pada localStorage
window.addEventListener("storage", (e) => {
  if (e.key === "tasks") {
    renderTaskHistoryFromLocalStorage(); // Update tampilan saat tasks berubah
  }
});

// Fungsi auto hapus ulang
function checkAutoDelete() {
  let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const now = Date.now();

  const filteredTasks = tasks.filter((task) => {
    if (task.completedAt && now - task.completedAt >= 10 * 1000) {
      return false;
    }
    return true;
  });

  // Hapus selectedTask dari localStorage jika tidak ada di filteredTasks
  const selectedTask = JSON.parse(localStorage.getItem("selectedTask"));
  if (selectedTask) {
    const stillExists = filteredTasks.some(
      (task) => task.id === selectedTask.id
    );
    if (!stillExists) {
      localStorage.removeItem("selectedTask");
    }
  }

  // Update hanya jika ada perubahan
  if (filteredTasks.length !== tasks.length) {
    localStorage.setItem("tasks", JSON.stringify(filteredTasks));
    renderTaskHistoryFromLocalStorage();
  }
}

// Jalankan setiap 1 detik agar auto delete bekerja real-time
setInterval(checkAutoDelete, 1000);

// SPLASH SCREEM
document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash-screen");

  if (!sessionStorage.getItem("splashShown")) {
    setTimeout(() => {
      splash.classList.add("fade-out");
      sessionStorage.setItem("splashShown", "true");

      // Hapus elemen setelah animasi selesai
      setTimeout(() => {
        splash.style.display = "none";
      }, 700);
    }, 1800);
  } else {
    splash.style.display = "none";
  }
});
