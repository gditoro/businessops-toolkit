(function () {
  const vscode = acquireVsCodeApi();

  const steps = window.BO_STEPS || [];
  const lang = window.BO_LANG || "pt-br";

  let state = window.BO_STATE || { answers: {} };
  let idx = 0;
  let isSaving = false;
  let navHistory = []; // Track navigation for proper back functionality

  // Restore state from VS Code if available
  const previousState = vscode.getState();
  if (previousState) {
    idx = previousState.idx || 0;
    state = previousState.state || state;
    navHistory = previousState.navHistory || [];
  }

  // Save state for webview restoration
  function persistState() {
    vscode.setState({ idx, state, navHistory });
  }

  // Listen for messages from extension
  window.addEventListener("message", (event) => {
    const msg = event.data;
    if (msg.type === "saveResult") {
      isSaving = false;
      if (msg.success) {
        showNotification(t("Salvo com sucesso!", "Saved successfully!"), "success");
      } else {
        showNotification(t("Erro ao salvar: ", "Error saving: ") + (msg.error || "Unknown"), "error");
      }
      render();
    }
    if (msg.type === "jumpToStep") {
      const targetIdx = parseInt(msg.stepIndex, 10);
      if (!isNaN(targetIdx) && targetIdx >= 0 && targetIdx < steps.length) {
        navHistory.push(idx);
        idx = targetIdx;
        persistState();
        render();
      }
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    // Ignore if typing in input
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const nextBtn = document.getElementById("next");
        if (nextBtn && !nextBtn.disabled) nextBtn.click();
      }
      return;
    }

    switch (e.key) {
      case "ArrowLeft":
      case "Backspace":
        if (idx > 0) {
          e.preventDefault();
          goBack();
        }
        break;
      case "ArrowRight":
      case "Enter":
        e.preventDefault();
        const nextBtn = document.getElementById("next");
        if (nextBtn && !nextBtn.disabled) nextBtn.click();
        break;
      case "1": case "2": case "3": case "4": case "5":
      case "6": case "7": case "8": case "9":
        // Quick select options by number
        const optionIdx = parseInt(e.key, 10) - 1;
        const options = document.querySelectorAll("button.option");
        if (options[optionIdx]) {
          e.preventDefault();
          options[optionIdx].click();
        }
        break;
      case "s":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const saveBtn = document.getElementById("save");
          if (saveBtn && !saveBtn.disabled) saveBtn.click();
        }
        break;
      case "Home":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          goToStart();
        }
        break;
    }
  });

  function showNotification(message, type) {
    const existing = document.querySelector(".notification");
    if (existing) existing.remove();

    const div = document.createElement("div");
    div.className = `notification ${type}`;
    div.innerHTML = `
      <span class="notification-icon">${type === "success" ? "✓" : "✕"}</span>
      <span class="notification-text">${escapeHtml(message)}</span>
    `;
    document.body.appendChild(div);

    // Animate in
    requestAnimationFrame(() => div.classList.add("show"));

    setTimeout(() => {
      div.classList.remove("show");
      setTimeout(() => div.remove(), 300);
    }, 3000);
  }

  function t(pt, en) {
    return lang === "en" ? en : pt;
  }

  function goBack() {
    if (idx > 0) {
      navHistory.push(idx);
      idx--;
      persistState();
      render();
    }
  }

  function goToStart() {
    if (idx > 0) {
      navHistory.push(idx);
      idx = 0;
      persistState();
      render();
    }
  }

  function jumpToStep(targetIdx) {
    if (targetIdx >= 0 && targetIdx < steps.length && targetIdx !== idx) {
      navHistory.push(idx);
      idx = targetIdx;
      persistState();
      render();
    }
  }

  function getCompletedCount() {
    return steps.filter((s) => {
      const v = state.answers[s.id];
      return v !== undefined && v !== null && String(v).trim() !== "";
    }).length;
  }

  function isStepComplete(step) {
    const v = state.answers[step.id];
    return v !== undefined && v !== null && String(v).trim() !== "";
  }

  function canProceed(step) {
    if (!step.required) return true;
    return isStepComplete(step);
  }

  function renderProgressBar() {
    const completed = getCompletedCount();
    const percent = steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0;

    return `
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percent}%"></div>
        </div>
        <div class="progress-text">
          ${t("Etapa", "Step")} ${idx + 1} / ${steps.length}
          <span class="progress-percent">(${percent}% ${t("completo", "complete")})</span>
        </div>
      </div>
    `;
  }

  function renderStepIndicator() {
    const indicators = steps.map((step, i) => {
      const isComplete = isStepComplete(step);
      const isCurrent = i === idx;
      const isAccessible = i <= idx || isComplete || i === idx + 1;

      let statusClass = "";
      if (isCurrent) statusClass = "current";
      else if (isComplete) statusClass = "complete";
      else if (isAccessible) statusClass = "accessible";
      else statusClass = "locked";

      const title = lang === "en" ? step.titleEn : step.titlePt;
      const shortTitle = title.length > 25 ? title.substring(0, 22) + "..." : title;

      return `
        <button
          class="step-indicator ${statusClass}"
          data-step="${i}"
          title="${escapeHtml(title)}"
          ${!isAccessible ? "disabled" : ""}
        >
          <span class="step-number">${isComplete ? "✓" : i + 1}</span>
          <span class="step-label">${escapeHtml(shortTitle)}</span>
        </button>
      `;
    }).join("");

    return `<div class="step-nav">${indicators}</div>`;
  }

  function render() {
    const step = steps[idx];
    if (!step) {
      return renderDone();
    }

    const title = lang === "en" ? step.titleEn : step.titlePt;
    const current = state.answers[step.id] ?? "";
    const isFirst = idx === 0;
    const isLast = idx === steps.length - 1;
    const canGoNext = canProceed(step);

    const app = document.getElementById("app");
    app.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>${t("BusinessOps Wizard", "BusinessOps Wizard")}</h2>
          <div class="header-actions">
            <button id="restart" class="icon-btn" title="${t("Recomeçar do início", "Restart from beginning")}">
              ↺
            </button>
          </div>
        </div>

        ${renderProgressBar()}
        ${renderStepIndicator()}

        <div class="question-container">
          <h3 class="question-title">${title}</h3>
          ${step.required ? `<span class="required-badge">${t("Obrigatório", "Required")}</span>` : ""}
          <div id="content"></div>
        </div>

        <div class="button-row">
          <div class="nav-buttons">
            <button id="back" class="nav-btn" ${isFirst ? "disabled" : ""}>
              <span class="btn-icon">←</span>
              <span class="btn-text">${t("Voltar", "Back")}</span>
            </button>
            <button id="next" class="nav-btn primary" ${!canGoNext ? "disabled" : ""}>
              <span class="btn-text">${isLast ? t("Concluir", "Finish") : t("Próximo", "Next")}</span>
              <span class="btn-icon">${isLast ? "✓" : "→"}</span>
            </button>
          </div>
          <div class="action-buttons">
            <button id="save" class="action-btn" ${isSaving ? "disabled" : ""}>
              ${isSaving ? t("Salvando...", "Saving...") : t("Salvar", "Save")}
            </button>
            <button id="generate" class="action-btn primary" ${isSaving ? "disabled" : ""}>
              ${t("Gerar docs", "Generate docs")}
            </button>
          </div>
        </div>

        <div class="keyboard-hints">
          <span>⌨️ ${t("Atalhos:", "Shortcuts:")}</span>
          <span class="hint">← → ${t("navegar", "navigate")}</span>
          <span class="hint">1-9 ${t("selecionar", "select")}</span>
          <span class="hint">Ctrl+S ${t("salvar", "save")}</span>
        </div>
      </div>
    `;

    const content = document.getElementById("content");

    if (step.type === "select") {
      const buttons = step.options
        .map((o, i) => {
          const isSelected = current === o.value;
          return `
            <button
              class="option ${isSelected ? "selected" : ""}"
              data-value="${o.value}"
              tabindex="0"
            >
              <span class="option-key">${i + 1}</span>
              <span class="option-label">${escapeHtml(o.label)}</span>
              ${isSelected ? '<span class="option-check">✓</span>' : ""}
            </button>
          `;
        })
        .join("");

      content.innerHTML = `
        <div class="options-grid">${buttons}</div>
        <div class="input-hint">
          ${current
            ? `<span class="selected-value">✓ ${t("Selecionado:", "Selected:")} <strong>${current}</strong></span>`
            : `<span class="hint-text">${t("Clique ou pressione 1-9 para selecionar", "Click or press 1-9 to select")}</span>`
          }
        </div>
      `;

      content.querySelectorAll("button.option").forEach((btn) => {
        btn.addEventListener("click", () => {
          const v = btn.getAttribute("data-value");
          state.answers[step.id] = v;
          persistState();
          render();
        });
      });
    }

    if (step.type === "text") {
      const placeholder = lang === "en" ? step.placeholderEn || "" : step.placeholderPt || "";
      const hasValue = current && String(current).trim() !== "";

      content.innerHTML = `
        <div class="text-input-container ${hasValue ? "has-value" : ""}">
          <input
            id="text"
            type="text"
            placeholder="${escapeHtml(placeholder)}"
            value="${escapeHtml(current)}"
            autofocus
          />
          <span class="input-status">${hasValue ? "✓" : ""}</span>
        </div>
        <div class="input-hint">
          <span class="hint-text">${t("Digite sua resposta e pressione Enter ou clique Próximo", "Type your answer and press Enter or click Next")}</span>
        </div>
      `;

      const input = document.getElementById("text");
      input.addEventListener("input", (e) => {
        state.answers[step.id] = e.target.value;
        persistState();
        // Update visual feedback
        const container = input.closest(".text-input-container");
        const status = container.querySelector(".input-status");
        const hasVal = e.target.value.trim() !== "";
        container.classList.toggle("has-value", hasVal);
        status.textContent = hasVal ? "✓" : "";
        // Update next button state
        const nextBtn = document.getElementById("next");
        if (step.required) {
          nextBtn.disabled = !hasVal;
        }
      });

      // Focus the input
      setTimeout(() => input.focus(), 50);
    }

    // Step indicator clicks
    document.querySelectorAll(".step-indicator").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!btn.disabled) {
          const targetIdx = parseInt(btn.getAttribute("data-step"), 10);
          jumpToStep(targetIdx);
        }
      });
    });

    // Navigation buttons
    document.getElementById("back").onclick = goBack;
    document.getElementById("restart").onclick = goToStart;

    document.getElementById("next").onclick = () => {
      const valid = validateStep(step);
      if (!valid.ok) {
        showNotification(valid.msg, "error");
        return;
      }
      navHistory.push(idx);
      idx++;
      persistState();
      render();
    };

    document.getElementById("save").onclick = () => {
      if (isSaving) return;
      isSaving = true;
      render();
      vscode.postMessage({ type: "save", state });
    };

    document.getElementById("generate").onclick = () => {
      if (isSaving) return;
      isSaving = true;
      render();
      vscode.postMessage({ type: "save", state });
      vscode.postMessage({ type: "generate" });
    };
  }

  function validateStep(step) {
    const v = state.answers[step.id];
    if (step.required && (!v || String(v).trim() === "")) {
      return {
        ok: false,
        msg: t("Esta pergunta é obrigatória. Por favor, forneça uma resposta.",
               "This question is required. Please provide an answer.")
      };
    }
    return { ok: true };
  }

  function renderDone() {
    const completed = getCompletedCount();
    const total = steps.length;
    const allComplete = completed === total;

    const app = document.getElementById("app");
    app.innerHTML = `
      <div class="card done-card">
        <div class="done-header">
          <span class="done-icon">${allComplete ? "🎉" : "📋"}</span>
          <h2>${allComplete
            ? t("Wizard concluído!", "Wizard complete!")
            : t("Resumo do Wizard", "Wizard Summary")}</h2>
        </div>

        <div class="done-stats">
          <div class="stat">
            <span class="stat-value">${completed}</span>
            <span class="stat-label">${t("respondidas", "answered")}</span>
          </div>
          <div class="stat">
            <span class="stat-value">${total - completed}</span>
            <span class="stat-label">${t("pendentes", "pending")}</span>
          </div>
        </div>

        ${!allComplete ? `
          <div class="incomplete-warning">
            <span class="warning-icon">⚠️</span>
            <span>${t("Algumas perguntas não foram respondidas. Você ainda pode gerar os docs.",
                       "Some questions were not answered. You can still generate docs.")}</span>
          </div>
        ` : `
          <p class="done-message">${t("Todas as perguntas foram respondidas! Você pode gerar os docs agora.",
                                        "All questions answered! You can generate docs now.")}</p>
        `}

        <div class="done-actions">
          <button id="review" class="action-btn">
            ${t("Revisar respostas", "Review answers")}
          </button>
          <button id="save" class="action-btn" ${isSaving ? "disabled" : ""}>
            ${isSaving ? t("Salvando...", "Saving...") : t("Salvar", "Save")}
          </button>
          <button id="generate" class="action-btn primary" ${isSaving ? "disabled" : ""}>
            ${t("🚀 Gerar documentação", "🚀 Generate documentation")}
          </button>
        </div>
      </div>
    `;

    document.getElementById("review").onclick = () => {
      idx = 0;
      persistState();
      render();
    };

    document.getElementById("save").onclick = () => {
      if (isSaving) return;
      isSaving = true;
      renderDone();
      vscode.postMessage({ type: "save", state });
    };

    document.getElementById("generate").onclick = () => {
      if (isSaving) return;
      isSaving = true;
      renderDone();
      vscode.postMessage({ type: "save", state });
      vscode.postMessage({ type: "generate" });
    };
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  render();
})();
