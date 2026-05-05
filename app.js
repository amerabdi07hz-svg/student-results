/* ===================================================
   app.js — بوابة نتائج الطلبة (مع Firebase)
   =================================================== */

/* -------- إعدادات Firebase -------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs,
  updateDoc, deleteDoc, doc, query, where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ⬇️ ضع هنا إعدادات مشروعك من Firebase Console
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
const COL = "students"; // اسم المجموعة في Firestore

/* -------- بيانات الأستاذ -------- */
const TEACHER_USER = "abdo";
const TEACHER_PASS = "hz5758";

/* -------- مخزن محلي مؤقت (يُملأ من Firebase) -------- */
let students = [];

/* ===================================================
   مساعدات التقدير
   =================================================== */
function getGrade(score) {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "F";
}
function getGradeLabel(g) {
  return { A: "ممتاز", B: "جيد جداً", C: "جيد", F: "راسب" }[g];
}

/* ===================================================
   جلب البيانات من Firebase
   =================================================== */
async function loadStudents() {
  showLoading(true);
  try {
    const snap = await getDocs(collection(db, COL));
    students = snap.docs.map(d => ({ _docId: d.id, ...d.data() }));
  } catch (e) {
    console.error("خطأ في جلب البيانات:", e);
    alert("⚠️ تعذّر الاتصال بقاعدة البيانات. تأكد من إعدادات Firebase.");
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
    el.textContent = "⏳ جارٍ التحميل...";
    document.body.appendChild(el);
  }
  el.style.display = on ? "flex" : "none";
}

/* ===================================================
   التنقل بين الشاشات
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
   دخول الأستاذ
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
    err.textContent = "⚠️ اسم المستخدم أو كلمة المرور غير صحيحة";
  }
}

/* ===================================================
   دخول الطالب
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
      err.textContent = "⚠️ رقم القيد غير موجود، يرجى التحقق.";
      return;
    }
    err.textContent = "";
    const results = snap.docs.map(d => ({ _docId: d.id, ...d.data() }));
    showStudentResult(results);
  } catch (e) {
    showLoading(false);
    err.textContent = "⚠️ تعذّر الاتصال بقاعدة البيانات.";
    console.error(e);
  }
}

function showStudentResult(results) {
  const student  = results[0];
  const initials = student.name.split(" ").slice(0,2).map(w => w[0]).join("");
  document.getElementById("r-avatar").textContent    = initials;
  document.getElementById("r-name").textContent      = student.name;
  document.getElementById("r-id-label").textContent  = "رقم القيد: " + student.id;

  const cards = document.getElementById("r-cards");
  cards.innerHTML = results.map(r => {
    const g = getGrade(r.score);
    return `
      <div class="result-row">
        <span class="subject">📚 ${r.subject}</span>
        <div style="display:flex;align-items:center;gap:.75rem">
          <span class="score-num">${r.score}</span>
          <span class="badge badge-${g.toLowerCase()}">${g} — ${getGradeLabel(g)}</span>
        </div>
      </div>`;
  }).join("");

  const avg = Math.round(results.reduce((a, r) => a + r.score, 0) / results.length);
  const g   = getGrade(avg);
  document.getElementById("r-avg").textContent   = avg + "%";
  document.getElementById("r-grade").textContent = g + " — " + getGradeLabel(g);
  document.getElementById("r-status").textContent = avg >= 60 ? "✅ ناجح" : "❌ راسب";
  document.getElementById("r-status").style.color = avg >= 60 ? "#34d399" : "#f87171";

  showScreen("screen-student-result");
}

/* ===================================================
   تسجيل الخروج
   =================================================== */
function logout() {
  students = [];
  showScreen("screen-home");
}

/* ===================================================
   إحصائيات الأستاذ
   =================================================== */
function renderStats() {
  const total  = students.length;
  const passed = students.filter(s => s.score >= 60).length;
  const avg    = total ? Math.round(students.reduce((a, s) => a + s.score, 0) / total) : 0;
  const top    = total ? Math.max(...students.map(s => s.score)) : 0;
  document.getElementById("stats").innerHTML = `
    <div class="stat-card"><div class="stat-label">إجمالي الطلاب</div><div class="stat-value">${total}</div></div>
    <div class="stat-card"><div class="stat-label">الناجحون</div><div class="stat-value">${passed}</div></div>
    <div class="stat-card"><div class="stat-label">الراسبون</div><div class="stat-value">${total - passed}</div></div>
    <div class="stat-card"><div class="stat-label">متوسط الدرجات</div><div class="stat-value">${avg}%</div></div>
    <div class="stat-card"><div class="stat-label">أعلى درجة</div><div class="stat-value">${top}</div></div>
  `;
}

/* ===================================================
   جدول الأستاذ
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
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">لا توجد نتائج مطابقة</td></tr>`;
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
        <td><span class="badge badge-${g.toLowerCase()}">${g} — ${getGradeLabel(g)}</span></td>
        <td>
          <button class="btn-edit" onclick="editStudent('${s._docId}')">تعديل</button>
          <button class="btn-del"  onclick="deleteStudent('${s._docId}')">حذف</button>
        </td>
      </tr>`;
  }).join("");
  renderStats();
}

/* ===================================================
   حذف طالب
   =================================================== */
async function deleteStudent(docId) {
  if (!confirm("هل أنت متأكد من حذف هذه النتيجة؟")) return;
  showLoading(true);
  try {
    await deleteDoc(doc(db, COL, docId));
    students = students.filter(s => s._docId !== docId);
    renderTable();
  } catch (e) {
    alert("⚠️ تعذّر الحذف، حاول مجدداً.");
    console.error(e);
  }
  showLoading(false);
}

/* ===================================================
   تعديل طالب
   =================================================== */
async function editStudent(docId) {
  const s = students.find(st => st._docId === docId);
  if (!s) return;
  const newScore = prompt(
    `تعديل درجة "${s.name}" في مادة "${s.subject}"\nالدرجة الحالية: ${s.score}\nأدخل الدرجة الجديدة:`,
    s.score
  );
  if (newScore === null) return;
  const parsed = parseInt(newScore);
  if (isNaN(parsed) || parsed < 0 || parsed > 100) {
    alert("⚠️ الدرجة يجب أن تكون بين 0 و 100");
    return;
  }
  showLoading(true);
  try {
    await updateDoc(doc(db, COL, docId), { score: parsed });
    s.score = parsed;
    renderTable();
  } catch (e) {
    alert("⚠️ تعذّر التعديل، حاول مجدداً.");
    console.error(e);
  }
  showLoading(false);
}

/* ===================================================
   إضافة طالب
   =================================================== */
async function addStudent() {
  const id      = document.getElementById("nId").value.trim();
  const name    = document.getElementById("nName").value.trim();
  const subject = document.getElementById("nSubject").value.trim();
  const score   = parseInt(document.getElementById("nScore").value);
  const msg     = document.getElementById("formMsg");

  if (!id || !name || !subject) {
    msg.textContent = "⚠️ يرجى ملء جميع الحقول.";
    msg.className   = "form-msg error";
    return;
  }
  if (isNaN(score) || score < 0 || score > 100) {
    msg.textContent = "⚠️ الدرجة يجب أن تكون بين 0 و 100.";
    msg.className   = "form-msg error";
    return;
  }

  showLoading(true);
  try {
    const docRef = await addDoc(collection(db, COL), { id, name, subject, score });
    students.push({ _docId: docRef.id, id, name, subject, score });
    ["nId","nName","nSubject","nScore"].forEach(k => document.getElementById(k).value = "");
    msg.textContent = `✅ تمت إضافة ${name} بنجاح.`;
    msg.className   = "form-msg success";
    setTimeout(() => (msg.textContent = ""), 3000);
    renderTable();
  } catch (e) {
    msg.textContent = "⚠️ تعذّرت الإضافة، حاول مجدداً.";
    msg.className   = "form-msg error";
    console.error(e);
  }
  showLoading(false);
}

/* ===================================================
   تهيئة الصفحة
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
   تصدير الدوال للـ HTML (onclick)
   =================================================== */
window.showScreen     = showScreen;
window.teacherLogin   = teacherLogin;
window.studentLogin   = studentLogin;
window.logout         = logout;
window.renderTable    = renderTable;
window.editStudent    = editStudent;
window.deleteStudent  = deleteStudent;
window.addStudent     = addStudent;
