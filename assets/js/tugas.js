/* =========================
   SETUP DASAR
========================= */
const list = document.getElementById("list");

// AMBIL ELEMENT MODAL & FORM
const modal   = document.getElementById("modal");
const judul   = modal.querySelector("h3");
const matkul  = document.getElementById("matkul");
const desk    = document.getElementById("desk");
const calendar = document.getElementById("calendar");

const user = localStorage.getItem("loginUser");
const notifKey = "notif_login_" + user;

if(!user){
  location.href = "index.html";
}
document.getElementById("halo").innerText = "Halo, " + user + " 👋";

// 🔑 STORAGE PER USER
const storageKey = "tugas_" + user;
let tugas = JSON.parse(localStorage.getItem(storageKey)) || [];

let editId = null;

/* =========================
   UTIL
========================= */
function saveData(){
  localStorage.setItem(storageKey, JSON.stringify(tugas));
}

function sisaHari(deadline){
  const now = new Date();
  const end = new Date(deadline);

  now.setHours(0,0,0,0);
  end.setHours(0,0,0,0);

  return Math.floor((end - now) / (1000*60*60*24));
}

function isLate(deadline){
  return new Date() > new Date(deadline);
}

function formatJam(dt){
  const d = new Date(dt);
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function sortByDeadline(data){
  return [...data].sort((a, b) => {
    return new Date(a.deadline) - new Date(b.deadline);
  });
}


/* =========================
   MODAL
========================= */
function bukaModal(id = null){
  modal.style.display = "flex";
  editId = id;

  if(id !== null){
    const t = tugas.find(x => x.id === id);
    judul.innerText = "Edit Tugas";
    matkul.value = t.matkul;
    desk.value = t.desk;
    deadline.value = t.deadline;
  }else{
    judul.innerText = "Tambah Tugas";
    matkul.value = "";
    desk.value = "";
    deadline.value = "";
  }
}

function tutup(){
  modal.style.display = "none";
  editId = null;
}

/* =========================
   CRUD
========================= */
function simpan(){
  if(!matkul.value || !desk.value || !deadline.value){
    alert("Lengkapi semua");
    return;
  }

  const icon = document.getElementById("icon").value;

  if(editId !== null){
    const idx = tugas.findIndex(t => t.id === editId);
    tugas[idx].matkul = matkul.value;
    tugas[idx].desk = desk.value;
    tugas[idx].deadline = deadline.value;
    tugas[idx].icon = icon;
  }else{
    tugas.push({
      id: Date.now(),
      matkul: matkul.value,
      desk: desk.value,
      deadline: deadline.value,
      icon: icon,
      status: "pending"
    });
  }

  saveData();
  tutup();
  render();
}

function toggleSelesai(id){
  const idx = tugas.findIndex(t => t.id === id);
  if(!tugas[idx]) return;

  tugas[idx].status =
    tugas[idx].status === "selesai" ? "pending" : "selesai";

  saveData();
  render();
}


function hapus(id){
  if(!confirm("Hapus tugas?")) return;
  tugas = tugas.filter(t => t.id !== id);
  saveData();
  render();
}

function getIcon(matkul){
  if(!matkul) return "📌";
  matkul = matkul.toLowerCase();

  if(matkul.includes("basis")) return "📘";
  if(matkul.includes("program") || matkul.includes("web")) return "💻";
  if(matkul.includes("statistik")) return "📊";
  if(matkul.includes("kalkulus")) return "📐";
  if(matkul.includes("sql")) return "🗄️";

  return "📒";
}

/* =========================
   RENDER CARD
========================= */
function renderItem(t){
  let badge = "";

  if(t.status === "selesai"){
    badge = `<span class="badge done">✓ Selesai</span>`;
  } else {
    const now = new Date();
    const end = new Date(t.deadline);
    const jam = formatJam(t.deadline);

    const diffMs = end - now;
    const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if(diffMs < 0){
      badge = `<span class="badge late">Terlambat • pukul ${jam}</span>`;
    } else if(diffDay === 0){
      badge = `<span class="badge soon">Hari ini • pukul ${jam}</span>`;
    } else {
      badge = `<span class="badge soon">${diffDay} hari lagi • pukul ${jam}</span>`;
    }
  }

  list.innerHTML += `
    <div class="card task-card">
      <div class="task-header">
        <div class="task-icon">${t.icon || "📘"}</div>
        <div>
          <h4>${t.matkul}</h4>
          <small>${t.desk}</small>
        </div>
      </div>

      ${badge}

      <div class="action">
        <button onclick="toggleSelesai(${t.id})">
  ${t.status === "selesai" ? "↩ Undo" : "✓ Selesai"}
</button>

        <span onclick="bukaModal(${t.id})">Edit</span>
        <span onclick="hapus(${t.id})">Hapus</span>
      </div>
    </div>
  `;
}

function hitungTotal(){
  return tugas.length;
}

function hitungPending(){
  return tugas.filter(t => t.status !== "selesai").length;
}

function hitungSelesai(){
  return tugas.filter(t => t.status === "selesai").length;
}

function cekDeadlineHariIni(){
  const today = new Date().toISOString().split("T")[0];
  const popupKey = "notif_" + user + "_" + today;

  const adaTugasHariIni = tugas.some(t =>
    t.status !== "selesai" &&
    t.deadline.startsWith(today)
  );

  if(adaTugasHariIni && !localStorage.getItem(popupKey)){
    const popup = document.getElementById("notifPopup");
    const sound = document.getElementById("notifSound");

    popup.style.display = "flex";

    // play sound (delay dikit biar kebuka dulu)
    setTimeout(() => {
      sound.play().catch(() => {});
    }, 300);

    localStorage.setItem(popupKey, "shown");
  }
}

function tutupNotif(){
  document.getElementById("notifPopup").style.display = "none";
}


/* =========================
   RENDER UTAMA
========================= */
function render(){
  list.innerHTML = "";
  calendar.style.display = "none";
  list.style.display = "grid";

  const sorted = sortByDeadline(tugas);
  sorted.forEach((t,i) => renderItem(t, i));

  document.getElementById("count").innerText = hitungTotal();
}


function searchTugas(){
  const keyword = document.getElementById("search").value.toLowerCase();

  list.innerHTML = "";
  calendar.style.display = "none";
  list.style.display = "grid";

  const hasil = tugas.filter(t =>
    t.matkul.toLowerCase().includes(keyword) ||
    t.desk.toLowerCase().includes(keyword)
  );

  if(hasil.length === 0){
    list.innerHTML = `
      <div style="
        padding:40px;
        text-align:center;
        color:#7a8bbd;
        font-size:15px;
      ">
        🔍 Tidak ada tugas ditemukan
      </div>
    `;
    return;
  }

  hasil.forEach((t,i)=>renderItem(t,i));
}


/* =========================
   FILTER MENU
========================= */
function tampilkanSemua(){
  document.getElementById("search").value = "";

  render();
  setActiveMenu(0);
}

function tampilkanTugas(){
  list.innerHTML = "";
  calendar.style.display = "none";
  list.style.display = "grid";

  const filtered = tugas.filter(t => t.status !== "selesai");
  sortByDeadline(filtered).forEach((t,i)=>renderItem(t,i));

  setActiveMenu(1);
  document.getElementById("count").innerText = hitungPending();
}


function tampilkanSelesai(){
  list.innerHTML = "";
  calendar.style.display = "none";
  list.style.display = "grid";

  const selesai = tugas.filter(t => t.status === "selesai");
  sortByDeadline(selesai).forEach((t,i)=>renderItem(t,i));

  document.getElementById("count").innerText = hitungSelesai();
}


/* =========================
   KALENDER
========================= */
let cur = new Date();

function tampilkanKalender(){
  calendar.style.display = "block";
  list.style.display = "none";
  renderCalendar();
  setActiveMenu(2);
}

let pickedDate = null;
function renderCalendar(){
  const y = cur.getFullYear();
  const m = cur.getMonth();

  document.getElementById("calTitle").innerText =
    cur.toLocaleString("id-ID", { month: "long", year: "numeric" });

  const grid = document.getElementById("calGrid");
  grid.innerHTML = "";

  ["Min","Sen","Sel","Rab","Kam","Jum","Sab"]
    .forEach(d => grid.innerHTML += `<div class="cal-day">${d}</div>`);

  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();

  for(let i=0;i<first;i++) grid.innerHTML += `<div></div>`;

  for(let d=1; d<=days; d++){
    const tgl = `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const has = tugas.some(t => t.deadline.startsWith(tgl));
    const isToday = new Date().toDateString() === new Date(y,m,d).toDateString();

    grid.innerHTML += `
      <div 
      class="cal-cell ${has ? 'has-task' : ''} ${isToday ? 'today' : ''}"
      onclick="klikTanggal('${tgl}')"
      >
      ${d}
      ${has ? '<span class="dot"></span>' : ''}
      </div>
    `;
  }
}

function prevMonth(){
  cur.setMonth(cur.getMonth() - 1);
  renderCalendar();
}

function nextMonth(){
  cur.setMonth(cur.getMonth() + 1);
  renderCalendar();
}

function notifTugasHariIni() {
  const now = new Date();

  const hariIni = tugas.filter(t => {
    if (t.status === "selesai") return false;

    const d = new Date(t.deadline);

    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });

  if (hariIni.length === 0) return;

  const key = "notif_login_" + user;
  if (localStorage.getItem(key)) return;

  const yakin = confirm(
    `Hari ini ada tugas yang harus diselesaikan.\nLihat sekarang?`
  );

  if (yakin) {
    tampilkanTugas();
  }

  localStorage.setItem(key, "shown");
}



/* =========================
   INIT
========================= */
render();
notifTugasHariIni();


function setActiveMenu(index){
  const menus = document.querySelectorAll(".sidebar a");
  menus.forEach(m => m.classList.remove("active"));
  menus[index].classList.add("active");
}

function filterByDate(tgl){
  list.innerHTML = "";
  calendar.style.display = "none";
  list.style.display = "grid";

    const hasil = tugas.filter(t => t.deadline.startsWith(tgl));

if(hasil.length === 0){
  list.innerHTML = `
    <div style="
      padding:40px;
      text-align:center;
      color:#7a8bbd;
      font-size:15px;
    ">
      📭 Tidak ada tugas di tanggal ini
    </div>
  `;
}else{
  sortByDeadline(hasil).forEach((t,i)=>renderItem(t,i));

}

  setActiveMenu(2);
}

function klikTanggal(tgl){
  filterByDate(tgl);
}