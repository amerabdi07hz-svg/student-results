/* ===================================================
   app.js — بوابة نتائج الطلبة
   =================================================== */

/* -------- بيانات الأستاذ -------- */
const TEACHER_USER = "abdo";
const TEACHER_PASS = "hz5758";

/* -------- بيانات الطلبة (يمكن الإضافة والحذف من لوحة الأستاذ) -------- */
let students = [
  { id: "2021001", name: "أحمد محمد العمري",      subject: "رياضيات", score: 92 },
  { id: "2021002", name: "فاطمة علي الزهراني",    subject: "فيزياء",   score: 78 },
  { id: "2021003", name: "محمد سالم الغامدي",     subject: "رياضيات", score: 55 },
  { id: "2021004", name: "نورة عبدالله الحربي",   subject: "كيمياء",  score: 88 },
  { id: "2021005", name: "عمر خالد المطيري",      subject: "فيزياء",   score: 45 },
  { id: "2021006", name: "ريم سعد القحطاني",      subject: "كيمياء",  score: 97 },
  { id: "2021007", name: "يوسف إبراهيم الدوسري", subject: "رياضيات", score: 71 },
  { id: "2021008", name: "هند ناصر البلوي",       subject: "فيزياء",   score: 83 },
];

/* -------- مساعدات التقدير -------- */
function getGrade(score) {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "F";
}
function getGradeLabel(g) {
  return { A: "ممتاز", B: "جيد جداً", C: "جيد", F: "راسب" }[g];
}

/* -------- التنقل بين الشاشات -------- */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active");
    s.style.display = "none";
  });
  const el = document.getElementById(id);
  el.style.display = "flex";
  el.classList.add("active");
  // مسح رسائل الخطأ عند التنقل
  ["t-err","s-err"].forEach(e => {
    const el = document.getElementById(e);
    if (el) el.textContent = "";
  });
}

/* -------- دخول الأستاذ -------- */
function teacherLogin() {
  const user = document.getElementById("t-user").value.trim();
  const pass = document.getElementById("t-pass").value.trim();
  const err  = document.getElementById("t-err");
  if (user === TEACHER_USER && pass === TEACHER_PASS) {
    err.textContent = "";
    document.getElementById("t-user").value = "";
    document.getElementById("t-pass").value = "";
    showScreen("screen-teacher");
    renderStats();
    renderTable();
  } else {
    err.textContent = "⚠️ اسم المستخدم أو كلمة المرور غير صحيحة";
  }
}

/* -------- دخول الطالب -------- */
function studentLogin() {
  const sid = document.getElementById("s-id").value.trim();
  const err = document.getElementById("s-err");
  // جمع كل نتائج الطالب
  const results = students.filter(s => s.id === sid);
  if (results.length === 0) {
    err.textContent = "⚠️ رقم القيد غير موجود، يرجى التحقق.";
    return;
  }
  err.textContent = "";
  showStudentResult(results);
}

function showStudentResult(results) {
  const student = results[0];
  // الحروف الأولى للاسم
  const initials = student.name.split(" ").slice(0,2).map(w => w[0]).join("");
  document.getElementById("r-avatar").textContent = initials;
  document.getElementById("r-name").textContent = student.name;
  document.getElementById("r-id-label").textContent = "رقم القيد: " + student.id;

  // بطاقات المواد
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

  // المعدل والتقدير العام
  const avg = Math.round(results.reduce((a, r) => a + r.score, 0) / results.length);
  const g   = getGrade(avg);
  document.getElementById("r-avg").textContent   = avg + "%";
  document.getElementById("r-grade").textContent = g + " — " + getGradeLabel(g);
  document.getElementById("r-status").textContent = avg >= 60 ? "✅ ناجح" : "❌ راسب";
  document.getElementById("r-status").style.color  = avg >= 60 ? "#34d399" : "#f87171";

  showScreen("screen-student-result");
}

/* -------- تسجيل الخروج -------- */
function logout() {
  showScreen("screen-home");
}

/* -------- إحصائيات الأستاذ -------- */
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

/* -------- جدول الأستاذ -------- */
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
          <button class="btn-edit" onclick="editStudent('${s.id}')">تعديل</button>
          <button class="btn-del"  onclick="deleteStudent('${s.id}')">حذف</button>
        </td>
      </tr>`;
  }).join("");
  renderStats();
}

/* -------- حذف طالب -------- */
function deleteStudent(id) {
  if (!confirm("هل أنت متأكد من حذف هذه النتيجة؟")) return;
  students = students.filter(s => s.id !== id);
  renderTable();
}

/* -------- تعديل طالب -------- */
function editStudent(id) {
  const s = students.find(st => st.id === id);
  if (!s) return;
  const newScore = prompt(`تعديل درجة "${s.name}" في مادة "${s.subject}"\nالدرجة الحالية: ${s.score}\nأدخل الدرجة الجديدة:`, s.score);
  if (newScore === null) return;
  const parsed = parseInt(newScore);
  if (isNaN(parsed) || parsed < 0 || parsed > 100) {
    alert("⚠️ الدرجة يجب أن تكون بين 0 و 100");
    return;
  }
  s.score = parsed;
  renderTable();
}

/* -------- إضافة طالب -------- */
function addStudent() {
  const id      = document.getElementById("nId").value.trim();
  const name    = document.getElementById("nName").value.trim();
  const subject = document.getElementById("nSubject").value.trim();
  const score   = parseInt(document.getElementById("nScore").value);
  const msg     = document.getElementById("formMsg");

  if (!id || !name || !subject) {
    msg.textContent = "⚠️ يرجى ملء جميع الحقول.";
    msg.className = "form-msg error";
    return;
  }
  if (isNaN(score) || score < 0 || score > 100) {
    msg.textContent = "⚠️ الدرجة يجب أن تكون بين 0 و 100.";
    msg.className = "form-msg error";
    return;
  }

  students.push({ id, name, subject, score });
  ["nId","nName","nSubject","nScore"].forEach(k => document.getElementById(k).value = "");
  msg.textContent = `✅ تمت إضافة ${name} بنجاح.`;
  msg.className = "form-msg success";
  setTimeout(() => msg.textContent = "", 3000);
  renderTable();
}

/* -------- دعم Enter في حقول تسجيل الدخول -------- */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("t-pass").addEventListener("keydown", e => {
    if (e.key === "Enter") teacherLogin();
  });
  document.getElementById("s-id").addEventListener("keydown", e => {
    if (e.key === "Enter") studentLogin();
  });
  // تأكد من عرض الشاشة الرئيسية
  showScreen("screen-home");
});
