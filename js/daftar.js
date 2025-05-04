const form = document.getElementById("formAuth");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch("https://tugas-ku-cot2.vercel.app/daftar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      alert("Berhasil daftar/login!");
      window.location.href = "index.html";
    } else {
      alert(data.message || "Gagal daftar/login");
    }
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan");
  }
});

async function handleCredentialResponse(response) {
  try {
    const res = await fetch("https://tugas-ku-cot2.vercel.app/google-signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credential: response.credential }),
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      alert("Login dengan Google berhasil!");
      window.location.href = "index.html";
    } else {
      alert(data.message || "Login Google gagal");
    }
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat login Google");
  }
}
