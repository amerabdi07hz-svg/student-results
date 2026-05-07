import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCOroJ-c4WMseSVYAjniCkqT9tvbFxFCwk",
  authDomain: "ameerabdi07hz.firebaseapp.com",
  projectId: "ameerabdi07hz",
  storageBucket: "ameerabdi07hz.firebasestorage.app",
  messagingSenderId: "828694243912",
  appId: "1:828694243912:web:2aa0c4cf35f6ded54c467d",
  measurementId: "G-FB7Y1ZZ8HE"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const studentsCol = collection(db, "students");
const appealsCol = collection(db, "appeals");

const TEACHER_USER = "abdo";
const TEACHER_PASS = "hz5758";
let globalStudents = [];

function getGrade(score) {
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 65) return "C";
  if (score >= 50) return "D";
  return "F";
}
function getGradeLabel(g) {
  return { A: "ممتاز", B: "جيد جداً", C: "جيد", D: "مقبول", F: "راسب" }[g];
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active");
    s.style.display = "none";
  });
  const el = document.getElementById(id);
  el.style.display = "flex";
  el.classList.add("active");
}

async function teacherLogin() {
  const user = document.getElementById("t-user").value.trim();
  const pass = document.getElementById("t-pass").value.trim();
  const err  = document.getElementById("t-err");
  if (user === TEACHER_USER && pass === TEACHER_PASS) {
    showScreen("screen-teacher");
    await reloadTable();
  } else {
    err.textContent = "⚠️ اسم المستخدم أو كلمة المرور غير صحيحة";
  }
}

async function studentLogin() {
  const sid = document.getElementById("s-id").value.trim();
  const err = document.getElementById("s-err");
  if (!sid) { err.textContent = "⚠️ يرجى إدخال رقم القيد."; return; }
  err.textContent = "⏳ جاري البحث...";
  try {
    const q = query(studentsCol, where("id", "==", sid));
    const snapshot = await getDocs(q);
    if (snapshot.empty) { err.textContent = "⚠️ رقم القيد غير موجود."; return; }
    const results = snapshot.docs.map(d => ({ docId: d.id, ...d.data() }));
    showStudentResult(results);
  } catch (e) { err.textContent = "⚠️ خطأ في الاتصال."; }
}

function showStudentResult(results) {
  const student = results[0];
  document.getElementById("r-avatar").textContent = student.name[0];
  document.getElementById("r-name").textContent = student.name;
  document.getElementById("r-id-label").textContent = "رقم القيد: " + student.id;
  const cards = document.getElementById("r-cards");
  cards.innerHTML = results.map(r => {
    const total = r.score || 0;
    const g = getGrade(total);
    return `
      <div class="result-row" style="flex-direction:column; align-items:flex-start;">
        <div style="display:flex; justify-content:space-between; width:100%;">
          <span class="subject">📚 ${r.subject}</span>
          <div><span class="score-num">${total}</span> <span class="badge badge-${g.toLowerCase()}">${g}</span></div>
        </div>
        <div class="score-details">
          <span>أعمال: ${r.coursework||0}</span> <span>نصفي: ${r.midterm||0}</span> <span>نهائي: ${r.final||0}</span>
        </div>
      </div>`;
  }).join("");
  const avg = Math.round(results.reduce((a, r) => a + (r.score || 0), 0) / results.length);
  document.getElementById("r-avg").textContent = avg + "%";
  document.getElementById("r-grade").textContent = getGrade(avg) + " — " + getGradeLabel(getGrade(avg));
  document.getElementById("r-status").textContent = avg >= 50 ? "✅ ناجح" : "❌ راسب";
  document.getElementById("r-status").style.color = avg >= 50 ? "#34d399" : "#f87171";
  showScreen("screen-student-result");
}

async function submitAppeal() {
  const id = document.getElementById("a-id").value.trim();
  const sub = document.getElementById("a-subject").value.trim();
  const rea = document.getElementById("a-reason").value.trim();
  const msg = document.getElementById("a-msg");
  if(!id || !sub || !rea) { msg.textContent = "⚠️ املأ الحقول."; return; }
  try {
    await addDoc(appealsCol, { studentId: id, subject: sub, reason: rea, date: new Date().toISOString() });
    msg.textContent = "✅ تم الإرسال.";
    setTimeout(() => showScreen("screen-home"), 2000);
  } catch(e) { msg.textContent = "⚠️ فشل الإرسال."; }
}

async function reloadTable() {
  const snapshot = await getDocs(studentsCol);
  globalStudents = snapshot.docs.map(d => ({ docId: d.id, ...d.data() }));
  renderStats(globalStudents);
  window.filterTable();
}

function renderStats(students) {
  const total = students.length;
  const passed = students.filter(s => s.score >= 50).length;
  document.getElementById("stats").innerHTML = `
    <div class="stat-card"><div class="stat-label">الإجمالي</div><div class="stat-value">${total}</div></div>
    <div class="stat-card"><div class="stat-label">الناجحون</div><div class="stat-value" style="color:#34d399;">${passed}</div></div>
    <div class="stat-card"><div class="stat-label">الراسبون</div><div class="stat-value" style="color:#f87171;">${total - passed}</div></div>
  `;
}

window.filterTable = function() {
  const q = document.getElementById("search").value.toLowerCase();
  const fg = document.getElementById("filterGrade").value;
  const filtered = globalStudents.filter(s => {
    const g = getGrade(s.score || 0);
    return (!q || s.name.toLowerCase().includes(q) || s.id.includes(q)) && (!fg || g === fg);
  });
  document.getElementById("tbody").innerHTML = filtered.map(s => `
    <tr>
      <td>${s.id}</td><td><strong>${s.name}</strong></td><td>${s.subject}</td>
      <td>${s.coursework||0}</td><td>${s.midterm||0}</td><td>${s.final||0}</td>
      <td style="font-weight:800;color:#60a5fa">${s.score||0}</td>
      <td><span class="badge badge-${getGrade(s.score||0).toLowerCase()}">${getGrade(s.score||0)}</span></td>
      <td><button class="btn-edit" onclick="openEditModal('${s.docId}')">تعديل</button>
      <button class="btn-del" onclick="deleteStudent('${s.docId}')">حذف</button></td>
    </tr>`).join("");
}

async function addStudent() {
  const id = document.getElementById("nId").value.trim();
  const name = document.getElementById("nName").value.trim();
  const sub = document.getElementById("nSubject").value.trim();
  const cw = parseInt(document.getElementById("nCw").value) || 0;
  const mid = parseInt(document.getElementById("nMid").value) || 0;
  const fin = parseInt(document.getElementById("nFin").value) || 0;
  if (!id || !name || !sub) return;
  await addDoc(studentsCol, { id, name, subject: sub, coursework: cw, midterm: mid, final: fin, score: cw+mid+fin });
  await reloadTable();
}

window.openEditModal = function(docId) {
  const s = globalStudents.find(x => x.docId === docId);
  document.getElementById("eDocId").value = docId;
  document.getElementById("eId").value = s.id;
  document.getElementById("eName").value = s.name;
  document.getElementById("eSubject").value = s.subject;
  document.getElementById("eCw").value = s.coursework || 0;
  document.getElementById("eMid").value = s.midterm || 0;
  document.getElementById("eFin").value = s.final || 0;
  document.getElementById("editModal").classList.add("active");
}
window.closeEditModal = () => document.getElementById("editModal").classList.remove("active");
window.saveEdit = async () => {
  const dId = document.getElementById("eDocId").value;
  const cw = parseInt(document.getElementById("eCw").value) || 0;
  const mid = parseInt(document.getElementById("eMid").value) || 0;
  const fin = parseInt(document.getElementById("eFin").value) || 0;
  await updateDoc(doc(db, "students", dId), {
    id: document.getElementById("eId").value,
    name: document.getElementById("eName").value,
    subject: document.getElementById("eSubject").value,
    coursework: cw, midterm: mid, final: fin, score: cw+mid+fin
  });
  closeEditModal(); await reloadTable();
}

async function deleteStudent(docId) { if(confirm("حذف؟")) { await deleteDoc(doc(db, "students", docId)); await reloadTable(); } }

window.showScreen = showScreen;
window.teacherLogin = teacherLogin;
window.studentLogin = studentLogin;
window.submitAppeal = submitAppeal;
window.deleteStudent = deleteStudent;
window.addStudent = addStudent;
window.logout = () => showScreen("screen-home");
document.addEventListener("DOMContentLoaded", () => showScreen("screen-home"));
