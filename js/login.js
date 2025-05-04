// Daftar pengguna valid (bisa kamu ganti atau ambil dari database/backend)
const users = [
  { username: "gaga", password: "12345" },
  { username: "admin", password: "admin" },
];

// Tangani submit form
document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault();

  const usernameInput = document.getElementById("username").value.trim();
  const passwordInput = document.getElementById("password").value;

  const user = users.find(
    (u) => u.username === usernameInput && u.password === passwordInput
  );

  if (user) {
    // Simpan data login ke localStorage
    localStorage.setItem("loggedInUser", user.username);
    alert(`Login berhasil. Hai ${user.username}!`);
    // Redirect ke halaman utama
    window.location.href = "index.html"; // Ganti dengan halaman tujuanmu
  } else {
    alert("Username atau password salah.");
  }
});
