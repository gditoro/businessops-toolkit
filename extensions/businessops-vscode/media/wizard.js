(function () {
  const vscode = acquireVsCodeApi();

  const steps = window.BO_STEPS || [];
  const lang = window.BO_LANG || "pt-br";

  let state = window.BO_STATE || { answers: {} };
  let idx = 0;

  function t(pt, en) {
    return lang === "en" ? en : pt;
  }

  function render() {
    const step = steps[idx];
    if (!step) {
      return renderDone();
    }

    const title = lang === "en" ? step.titleEn : step.titlePt;
    const current = state.answers[step.id] ?? "";

    const app = document.getElementById("app");
    app.innerHTML = `
      <div class="card">
        <h2>${t("BusinessOps Wizard (Intake)", "BusinessOps Wizard (Intake)")}</h2>
        <div class="progress">${t("Etapa", "Step")} ${idx + 1} / ${steps.length}</div>

        <h3>${title}</h3>

        <div id="content"></div>

        <div class="row">
          <button id="back">${t("Voltar", "Back")}</button>
          <button class="primary" id="next">${t("Próximo", "Next")}</button>
          <button id="save">${t("Salvar", "Save")}</button>
          <button id="generate">${t("Gerar docs", "Generate docs")}</button>
        </div>

        <div class="meta">${t("Safe Mode: 1 pergunta por vez, com validação.", "Safe Mode: 1 question at a time, with validation.")}</div>
      </div>
    `;

    const content = document.getElementById("content");

    if (step.type === "select") {
      const buttons = step.options
        .map(
          (o) => `<button class="option" data-value="${o.value}">${o.label}</button>`
        )
        .join("");
      content.innerHTML = `<div class="row">${buttons}</div><div class="meta">${t(
        "Clique numa opção.",
        "Click an option."
      )}</div>`;

      content.querySelectorAll("button.option").forEach((btn) => {
        btn.addEventListener("click", () => {
          const v = btn.getAttribute("data-value");
          state.answers[step.id] = v;
          render(); // re-render to reflect change
        });
      });

      // show selected value
      if (current) {
        const meta = document.createElement("div");
        meta.className = "meta";
        meta.textContent = t("Selecionado: ", "Selected: ") + current;
        content.appendChild(meta);
      }
    }

    if (step.type === "text") {
      const placeholder =
        lang === "en" ? step.placeholderEn || "" : step.placeholderPt || "";
      content.innerHTML = `
        <input id="text" placeholder="${placeholder}" value="${escapeHtml(current)}"/>
        <div class="meta">${t("Digite e clique Próximo.", "Type and click Next.")}</div>
      `;

      const input = document.getElementById("text");
      input.addEventListener("input", (e) => {
        state.answers[step.id] = e.target.value;
      });
    }

    // Buttons
    document.getElementById("back").onclick = () => {
      if (idx > 0) idx--;
      render();
    };

    document.getElementById("next").onclick = () => {
      const valid = validateStep(step);
      if (!valid.ok) {
        alert(valid.msg);
        return;
      }
      idx++;
      render();
    };

    document.getElementById("save").onclick = () => {
      vscode.postMessage({ type: "save", state });
    };

    document.getElementById("generate").onclick = () => {
      vscode.postMessage({ type: "save", state });
      vscode.postMessage({ type: "generate" });
    };
  }

  function validateStep(step) {
    const v = state.answers[step.id];
    if (step.required && (!v || String(v).trim() === "")) {
      return { ok: false, msg: t("Resposta obrigatória.", "Answer is required.") };
    }
    return { ok: true };
  }

  function renderDone() {
    const app = document.getElementById("app");
    app.innerHTML = `
      <div class="card">
        <h2>${t("Wizard concluído ✅", "Wizard complete ✅")}</h2>
        <p>${t("Você pode gerar os docs agora.", "You can generate docs now.")}</p>
        <div class="row">
          <button id="save">${t("Salvar", "Save")}</button>
          <button class="primary" id="generate">${t("Gerar docs", "Generate docs")}</button>
        </div>
      </div>
    `;

    document.getElementById("save").onclick = () => {
      vscode.postMessage({ type: "save", state });
    };

    document.getElementById("generate").onclick = () => {
      vscode.postMessage({ type: "save", state });
      vscode.postMessage({ type: "generate" });
    };
  }

  function escapeHtml(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  render();
})();
