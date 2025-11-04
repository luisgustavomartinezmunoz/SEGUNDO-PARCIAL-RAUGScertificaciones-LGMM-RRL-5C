
// RauGS Certificaciones 

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const certMeta = JSON.parse(localStorage.getItem("exam_cert") || "null");

  if (!token) {
    return Swal.fire("Acceso restringido", "Debes iniciar sesión para presentar el examen", "warning")
      .then(() => (window.location.href = "index.html"));
  }

  if (!certMeta || !certMeta.certId) {
    return Swal.fire("Atención", "No se encontró la certificación seleccionada.", "warning")
      .then(() => (window.location.href = "certificaciones.html"));
  }

  try {
    const res = await fetch("http://localhost:3000/api/exam/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ certId: certMeta.certId }),
    });

    const data = await res.json();

    if (!res.ok) {
      return Swal.fire("Error", data.message || "No se pudieron cargar las preguntas del examen", "error");
    }

    renderPreguntas(data.questions);
    mostrarMetaExamen(data.cert);
  } catch (e) {
    console.error(e);
    Swal.fire("Error", "No se pudieron cargar las preguntas del examen", "error");
  }
});

function renderPreguntas(questions) {
  const form = document.getElementById("examForm");
  form.innerHTML = "";

  questions.forEach((q, i) => {
    const fs = document.createElement("fieldset");
    fs.className = "question";
    fs.dataset.id = q.id;

    let options = "";
    q.options.forEach((op) => {
      const code = typeof op === "object" ? op.code : op;
      const text = typeof op === "object" ? op.text || JSON.stringify(op) : String(op);
      options += `
        <label>
          <input type="radio" name="pregunta${i}" value="${code}">
          ${text}
        </label>`;
    });

    fs.innerHTML = `
      <legend><strong>${i + 1}. ${q.text}</strong></legend>
      ${options}`;
    form.appendChild(fs);
  });
}

function mostrarMetaExamen(cert) {
  const fullname = localStorage.getItem("fullname") || localStorage.getItem("account") || "Usuario";
  const fecha = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
  const name = cert?.name || "Certificación";
  const u = document.getElementById("examUser");
  const d = document.getElementById("examDate");
  const c = document.getElementById("examCertName");
  if (u) u.textContent = `${fullname}`;
  if (d) d.textContent = `${fecha}`;
  if (c) c.textContent = `${name}`;
}

document.getElementById("btnSubmitExam").addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  const certMeta = JSON.parse(localStorage.getItem("exam_cert") || "null");

  if (!token) return Swal.fire("Error", "Debes iniciar sesión para enviar el examen", "error");
  if (!certMeta) return Swal.fire("Atención", "No hay certificación seleccionada", "warning");

  const answers = [];
  document.querySelectorAll(".question").forEach((q) => {
    const id = Number(q.dataset.id);
    const sel = q.querySelector('input[type="radio"]:checked');
    answers.push({ id, answer: sel ? sel.value : null });
  });

  try {
    const res = await fetch("http://localhost:3000/api/exam/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ certId: certMeta.certId, answers }),
    });

    const data = await res.json();

    if (!res.ok) {
      return Swal.fire("Error", data.message || "Error al enviar el examen", "error");
    }

    if (data.passed) {
      Swal.fire({
        icon: "success",
        title: "Examen aprobado",
        text: `Calificación: ${data.score}/${data.total}. Se generará tu certificado.`,
        confirmButtonText: "Descargar certificado",
      }).then(() => {
        fetch("http://localhost:3000/api/certificate/pdf", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => {
            if (!r.ok) throw new Error("Sin certificado disponible");
            return r.blob();
          })
          .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Certificado_RauGS.pdf";
            a.click();
            Swal.fire({
              title: "Certificado generado",
              text: "Tu certificado se ha descargado correctamente.",
              icon: "success",
              confirmButtonText: "Volver al inicio",
            }).then(() => (window.location.href = "index.html"));
          })
          .catch(() => window.location.href = "index.html");
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Examen no aprobado",
        text: `Calificación: ${data.score}/${data.total}. Puedes intentarlo nuevamente.`,
      }).then(() => (window.location.href = "index.html"));
    }
  } catch (e) {
    console.error(e);
    Swal.fire("Error", "Ocurrió un problema al enviar el examen", "error");
  }
});
