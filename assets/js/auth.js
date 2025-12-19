function login(){
  let u = document.getElementById("username").value
            .trim()
            .toLowerCase();

  if(u === ""){
    alert("Isi nama dulu");
    return;
  }

  localStorage.removeItem("notif_login_" + u);

  // ambil daftar user yang pernah ada
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // cek apakah user sudah pernah ada
  if(users.includes(u)){
    // user lama → langsung login
    localStorage.setItem("loginUser", u);
    location.href = "dashboard.html";
  } else {
    // user baru → konfirmasi
    const ok = confirm(
      "Nama ini belum pernah digunakan.\n" +
      "Lanjut sebagai pengguna baru?"
    );

    if(ok){
      users.push(u);
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("loginUser", u);
      location.href = "dashboard.html";
    } else {
      // batal → biar user bisa perbaiki nama
      document.getElementById("username").focus();
    }
  }
}

function logout(){
  if(confirm("Yakin mau logout?")){
    localStorage.removeItem("loginUser");
    location.href = "index.html";
  }
}