/* ===================================================
   app.js â€” ط¨ظˆط§ط¨ط© ظ†طھط§ط¦ط¬ ط§ظ„ط·ظ„ط¨ط© (ظ…ط¹ Firebase)
   =================================================== */

/* -------- ط¥ط¹ط¯ط§ط¯ط§طھ Firebase -------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs,
  updateDoc, deleteDoc, doc, query, where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// â¬‡ï¸ڈ ط¶ط¹ ظ‡ظ†ط§ ط¥ط¹ط¯ط§ط¯ط§طھ ظ…ط´ط±ظˆط¹ظƒ ظ…ظ† Firebase Console
const firebaseConfig = {
  apiKey:            "AIzaSyCOroJ-c4WMseSVYAjniCkqT9tvbFxFCwk",
  authDomain:        "ameerabdi07hz.firebaseapp.com",
  projectId:         "ameerabdi07hz",
  storageBucket:     "ameerabdi07hz.firebasestorage.app",
  messagingSenderId: "828694243912",
  appId:             "1:828694243912:web:2aa0c4cf35f6ded54c467d",
  measurementId:     "G-FB7Y1ZZ8HE"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const COL = "students"; // ط§ط³ظ… ط§ظ„ظ…ط¬ظ…ظˆط¹ط© ظپظٹ Firestore

/* -------- ط¨ظٹط§ظ†ط§طھ ط§ظ„ط£ط³طھط§ط° -------- */
const TEACHER_USER = "abdo";
const TEACHER_PASS = "hz5758";

/* -------- ظ…ط®ط²ظ† ظ…ط­ظ„ظٹ ظ…ط¤ظ‚طھ (ظٹظڈظ…ظ„ط£ ظ…ظ† Firebase) -------- */
let students = [];

/* ===================================================
   ظ…ط³ط§ط¹ط¯ط§طھ ط§ظ„طھظ‚ط¯ظٹط±
   =================================================== */
function getGrade(score) {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "F";
}
function getGradeLabel(g) {
  return { A: "ظ…ظ…طھط§ط²", B: "ط¬ظٹط¯ ط¬ط¯ط§ظ‹", C: "ط¬ظٹط¯", F: "ط±ط§ط³ط¨" }[g];
}

/* ===================================================
   ط¬ظ„ط¨ ط§ظ„ط¨ظٹط§ظ†ط§طھ ظ…ظ† Firebase
   =================================================== */
async function loadStudents() {
  showLoading(true);
  try {
    const snap = await getDocs(collection(db, COL));
    students = snap.docs.map(d => ({ _docId: d.id, ...d.data() }));
  } catch (e) {
    console.error("ط®ط·ط£ ظپظٹ ط¬ظ„ط¨ ط§ظ„ط¨ظٹط§ظ†ط§طھ:", e);
    alert("âڑ ï¸ڈ طھط¹ط°ظ‘ط± ط§ظ„ط§طھطµط§ظ„ ط¨ظ‚ط§ط¹ط¯ط© ط§ظ„ط¨ظٹط§ظ†ط§طھ. طھط£ظƒط¯ ظ…ظ† ط¥ط¹ط¯ط§ط¯ط§طھ Firebase.");
  }
  showLoading(false);
}

function showLoading(on) {
  let el = document.getElementById("loading-overlay");
  if (!el) {
    el = document.createElement("div");
    el.id = "loading-overlay";
    el.style.cssText =
      "position:fixed;inset:0;background:#0f172acc;display:flex;" +
      "align-items:center;justify-content:center;z-index:9999;" +
      "font-size:1.3rem;color:#60a5fa;font-family:'Tajawal',sans-serif;";
    el.textContent = "âڈ³ ط¬ط§ط±ظچ ط§ظ„طھط­ظ…ظٹظ„...";
    document.body.appendChild(el);
  }
  el.style.display = on ? "flex" : "none";
}

/* ===================================================
   ط§ظ„طھظ†ظ‚ظ„ ط¨ظٹظ† ط§ظ„ط´ط§ط´ط§طھ
   =================================================== */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active");
    s.style.display = "none";
  });
  const el = document.getElementById(id);
  el.style.display = "flex";
  el.classList.add("active");
  ["t-err","s-err"].forEach(e => {
    const el2 = document.getElementById(e);
    if (el2) el2.textContent = "";
  });
}

/* ===================================================
   ط¯ط®ظˆظ„ ط§ظ„ط£ط³طھط§ط°
   =================================================== */
async function teacherLogin() {
  const user = document.getElementById("t-user").value.trim();
  const pass = document.getElementById("t-pass").value.trim();
  const err  = document.getElementById("t-err");
  if (user === TEACHER_USER && pass === TEACHER_PASS) {
    err.textContent = "";
    document.getElementById("t-user").value = "";
    document.getElementById("t-pass").value = "";
    await loadStudents();
    showScreen("screen-teacher");
    renderStats();
    renderTable();
  } else {
    err.textContent = "âڑ ï¸ڈ ط§ط³ظ… ط§ظ„ظ…ط³طھط®ط¯ظ… ط£ظˆ ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط؛ظٹط± طµط­ظٹط­ط©";
  }
}

/* ===================================================
   ط¯ط®ظˆظ„ ط§ظ„ط·ط§ظ„ط¨
   =================================================== */
async function studentLogin() {
  const sid = document.getElementById("s-id").value.trim();
  const err = document.getElementById("s-err");
  showLoading(true);
  try {
    const q    = query(collection(db, COL), where("id", "==", sid));
    const snap = await getDocs(q);
    showLoading(false);
    if (snap.empty) {
      err.textContent = "âڑ ï¸ڈ ط±ظ‚ظ… ط§ظ„ظ‚ظٹط¯ ط؛ظٹط± ظ…ظˆط¬ظˆط¯طŒ ظٹط±ط¬ظ‰ ط§ظ„طھط­ظ‚ظ‚.";
      return;
    }
    err.textContent = "";
    const results = snap.docs.map(d => ({ _docId: d.id, ...d.data() }));
    showStudentResult(results);
  } catch (e) {
    showLoading(false);
    err.textContent = "âڑ ï¸ڈ طھط¹ط°ظ‘ط± ط§ظ„ط§طھطµط§ظ„ ط¨ظ‚ط§ط¹ط¯ط© ط§ظ„ط¨ظٹط§ظ†ط§طھ.";
    console.error(e);
  }
}

function showStudentResult(results) {
  const student  = results[0];
  const initials = student.name.split(" ").slice(0,2).map(w => w[0]).join("");
  document.getElementById("r-avatar").textContent    = initials;
  document.getElementById("r-name").textContent      = student.name;
  document.getElementById("r-id-label").textContent  = "ط±ظ‚ظ… ط§ظ„ظ‚ظٹط¯: " + student.id;

  const cards = document.getElementById("r-cards");
  cards.innerHTML = results.map(r => {
    const g = getGrade(r.score);
    return `
      <div class="result-row">
        <span class="subject">ًں“ڑ ${r.subject}</span>
        <div style="display:flex;align-items:center;gap:.75rem">
          <span class="score-num">${r.score}</span>
          <span class="badge badge-${g.toLowerCase()}">${g} â€” ${getGradeLabel(g)}</span>
        </div>
      </div>`;
  }).join("");

  const avg = Math.round(results.reduce((a, r) => a + r.score, 0) / results.length);
  const g   = getGrade(avg);
  document.getElementById("r-avg").textContent   = avg + "%";
  document.getElementById("r-grade").textContent = g + " â€” " + getGradeLabel(g);
  document.getElementById("r-status").textContent = avg >= 60 ? "âœ… ظ†ط§ط¬ط­" : "â‌Œ ط±ط§ط³ط¨";
  document.getElementById("r-status").style.color = avg >= 60 ? "#34d399" : "#f87171";

  showScreen("screen-student-result");
}

/* ===================================================
   طھط³ط¬ظٹظ„ ط§ظ„ط®ط±ظˆط¬
   =================================================== */
function logout() {
  students = [];
  showScreen("screen-home");
}

/* ===================================================
   ط¥ط­طµط§ط¦ظٹط§طھ ط§ظ„ط£ط³طھط§ط°
   =================================================== */
function renderStats() {
  const total  = students.length;
  const passed = students.filter(s => s.score >= 60).length;
  const avg    = total ? Math.round(students.reduce((a, s) => a + s.score, 0) / total) : 0;
  const top    = total ? Math.max(...students.map(s => s.score)) : 0;
  document.getElementById("stats").innerHTML = `
    <div class="stat-card"><div class="stat-label">ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ط·ظ„ط§ط¨</div><div class="stat-value">${total}</div></div>
    <div class="stat-card"><div class="stat-label">ط§ظ„ظ†ط§ط¬ط­ظˆظ†</div><div class="stat-value">${passed}</div></div>
    <div class="stat-card"><div class="stat-label">ط§ظ„ط±ط§ط³ط¨ظˆظ†</div><div class="stat-value">${total - passed}</div></div>
    <div class="stat-card"><div class="stat-label">ظ…طھظˆط³ط· ط§ظ„ط¯ط±ط¬ط§طھ</div><div class="stat-value">${avg}%</div></div>
    <div class="stat-card"><div class="stat-label">ط£ط¹ظ„ظ‰ ط¯ط±ط¬ط©</div><div class="stat-value">${top}</div></div>
  `;
}

/* ===================================================
   ط¬ط¯ظˆظ„ ط§ظ„ط£ط³طھط§ط°
   =================================================== */
function renderTable() {
  const q  = document.getElementById("search").value.trim().toLowerCase();
  const fg = document.getElementById("filterGrade").value;
  const filtered = students.filter(s => {
    const g = getGrade(s.score);
    return (!q  || s.name.toLowerCase().includes(q) || s.id.includes(q))
        && (!fg || g === fg);
  });
  const tbody = document.getElementById("tbody");
  if (!filtered.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">ظ„ط§ طھظˆط¬ط¯ ظ†طھط§ط¦ط¬ ظ…ط·ط§ط¨ظ‚ط©</td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map(s => {
    const g = getGrade(s.score);
    return `
      <tr>
        <td style="color:#64748b;font-size:.85rem">${s.id}</td>
        <td><strong>${s.name}</strong></td>
        <td>${s.subject}</td>
        <td style="font-weight:700;color:#60a5fa">${s.score}</td>
        <td><span class="badge badge-${g.toLowerCase()}">${g} â€” ${getGradeLabel(g)}</span></td>
        <td>
          <button class="btn-edit" onclick="editStudent('${s._docId}')">طھط¹ط¯ظٹظ„</button>
          <button class="btn-del"  onclick="deleteStudent('${s._docId}')">ط­ط°ظپ</button>
        </td>
      </tr>`;
  }).join("");
  renderStats();
}

/* ===================================================
   ط­ط°ظپ ط·ط§ظ„ط¨
   =================================================== */
async function deleteStudent(docId) {
  if (!confirm("ظ‡ظ„ ط£ظ†طھ ظ…طھط£ظƒط¯ ظ…ظ† ط­ط°ظپ ظ‡ط°ظ‡ ط§ظ„ظ†طھظٹط¬ط©طں")) return;
  showLoading(true);
  try {
    await deleteDoc(doc(db, COL, docId));
    students = students.filter(s => s._docId !== docId);
    renderTable();
  } catch (e) {
    alert("âڑ ï¸ڈ طھط¹ط°ظ‘ط± ط§ظ„ط­ط°ظپطŒ ط­ط§ظˆظ„ ظ…ط¬ط¯ط¯ط§ظ‹.");
    console.error(e);
  }
  showLoading(false);
}

/* ===================================================
   طھط¹ط¯ظٹظ„ ط·ط§ظ„ط¨
   =================================================== */
async function editStudent(docId) {
  const s = students.find(st => st._docId === docId);
  if (!s) return;
  const newScore = prompt(
    `طھط¹ط¯ظٹظ„ ط¯ط±ط¬ط© "${s.name}" ظپظٹ ظ…ط§ط¯ط© "${s.subject}"\nط§ظ„ط¯ط±ط¬ط© ط§ظ„ط­ط§ظ„ظٹط©: ${s.score}\nط£ط¯ط®ظ„ ط§ظ„ط¯ط±ط¬ط© ط§ظ„ط¬ط¯ظٹط¯ط©:`,
    s.score
  );
  if (newScore === null) return;
  const parsed = parseInt(newScore);
  if (isNaN(parsed) || parsed < 0 || parsed > 100) {
    alert("âڑ ï¸ڈ ط§ظ„ط¯ط±ط¬ط© ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† ط¨ظٹظ† 0 ظˆ 100");
    return;
  }
  showLoading(true);
  try {
    await updateDoc(doc(db, COL, docId), { score: parsed });
    s.score = parsed;
    renderTable();
  } catch (e) {
    alert("âڑ ï¸ڈ طھط¹ط°ظ‘ط± ط§ظ„طھط¹ط¯ظٹظ„طŒ ط­ط§ظˆظ„ ظ…ط¬ط¯ط¯ط§ظ‹.");
    console.error(e);
  }
  showLoading(false);
}

/* ===================================================
   ط¥ط¶ط§ظپط© ط·ط§ظ„ط¨
   =================================================== */
async function addStudent() {
  const id      = document.getElementById("nId").value.trim();
  const name    = document.getElementById("nName").value.trim();
  const subject = document.getElementById("nSubject").value.trim();
  const score   = parseInt(document.getElementById("nScore").value);
  const msg     = document.getElementById("formMsg");

  if (!id || !name || !subject) {
    msg.textContent = "âڑ ï¸ڈ ظٹط±ط¬ظ‰ ظ…ظ„ط، ط¬ظ…ظٹط¹ ط§ظ„ط­ظ‚ظˆظ„.";
    msg.className   = "form-msg error";
    return;
  }
  if (isNaN(score) || score < 0 || score > 100) {
    msg.textContent = "âڑ ï¸ڈ ط§ظ„ط¯ط±ط¬ط© ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† ط¨ظٹظ† 0 ظˆ 100.";
    msg.className   = "form-msg error";
    return;
  }

  showLoading(true);
  try {
    const docRef = await addDoc(collection(db, COL), { id, name, subject, score });
    students.push({ _docId: docRef.id, id, name, subject, score });
    ["nId","nName","nSubject","nScore"].forEach(k => document.getElementById(k).value = "");
    msg.textContent = `âœ… طھظ…طھ ط¥ط¶ط§ظپط© ${name} ط¨ظ†ط¬ط§ط­.`;
    msg.className   = "form-msg success";
    setTimeout(() => (msg.textContent = ""), 3000);
    renderTable();
  } catch (e) {
    msg.textContent = "âڑ ï¸ڈ طھط¹ط°ظ‘ط±طھ ط§ظ„ط¥ط¶ط§ظپط©طŒ ط­ط§ظˆظ„ ظ…ط¬ط¯ط¯ط§ظ‹.";
    msg.className   = "form-msg error";
    console.error(e);
  }
  showLoading(false);
}

/* ===================================================
   طھظ‡ظٹط¦ط© ط§ظ„طµظپط­ط©
   =================================================== */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("t-pass").addEventListener("keydown", e => {
    if (e.key === "Enter") teacherLogin();
  });
  document.getElementById("s-id").addEventListener("keydown", e => {
    if (e.key === "Enter") studentLogin();
  });
  showScreen("screen-home");
});

/* ===================================================
   طھطµط¯ظٹط± ط§ظ„ط¯ظˆط§ظ„ ظ„ظ„ظ€ HTML (onclick)
   =================================================== */
window.showScreen     = showScreen;
window.teacherLogin   = teacherLogin;
window.studentLogin   = studentLogin;
window.logout         = logout;
window.renderTable    = renderTable;
window.editStudent    = editStudent;
window.deleteStudent  = deleteStudent;
window.addStudent     = addStudent;
