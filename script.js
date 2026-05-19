const STORAGE_KEY = "separadinho-pwa-v1";

const themes = [
  {
    id: "nubank",
    name: "Nubank",
    accent: "#820ad1",
    accent2: "#b84dff",
    bg: "#f6edff",
    panel: "rgba(255, 255, 255, 0.72)",
    text: "#17111d",
    muted: "#756a7d",
  },
  {
    id: "itau",
    name: "Itaú",
    accent: "#ff7a00",
    accent2: "#0050a4",
    bg: "#fff3e4",
    panel: "rgba(255, 255, 255, 0.72)",
    text: "#16120d",
    muted: "#7c705f",
  },
  {
    id: "picpay",
    name: "PicPay",
    accent: "#11a85b",
    accent2: "#64d96b",
    bg: "#ebfaef",
    panel: "rgba(255, 255, 255, 0.72)",
    text: "#101811",
    muted: "#667568",
  },
  {
    id: "santander",
    name: "Santander",
    accent: "#ec0000",
    accent2: "#ff6b5f",
    bg: "#fff0ef",
    panel: "rgba(255, 255, 255, 0.72)",
    text: "#1b1010",
    muted: "#7d6a69",
  },
  {
    id: "bradesco",
    name: "Bradesco",
    accent: "#cc092f",
    accent2: "#f05a77",
    bg: "#fff0f4",
    panel: "rgba(255, 255, 255, 0.72)",
    text: "#1b1014",
    muted: "#7c6970",
  },
  {
    id: "caixa",
    name: "Caixa",
    accent: "#005ca9",
    accent2: "#f39200",
    bg: "#edf5ff",
    panel: "rgba(255, 255, 255, 0.72)",
    text: "#10151b",
    muted: "#68727d",
  },
  {
    id: "bb",
    name: "Banco do Brasil",
    accent: "#fdd600",
    accent2: "#21409a",
    bg: "#fff9d7",
    panel: "rgba(255, 255, 255, 0.72)",
    text: "#171507",
    muted: "#7b7554",
  },
  {
    id: "mp",
    name: "Mercado Pago",
    accent: "#00a9e0",
    accent2: "#ffe600",
    bg: "#eaf8ff",
    panel: "rgba(255, 255, 255, 0.72)",
    text: "#0f1518",
    muted: "#63747c",
  },
];
const reserveColors = ["#007aff", "#34c759", "#ffcc00", "#ff9500", "#af52de", "#ff3b30"];
const reserveIcons = ["credit-card", "wifi", "piggy-bank", "home", "shopping-bag", "heart"];

let state = loadState();
let selectedColor = reserveColors[0];
let selectedIcon = reserveIcons[0];

const elements = {
  totalBalance: document.querySelector("#totalBalance"),
  freeBalance: document.querySelector("#freeBalance"),
  reservedBalance: document.querySelector("#reservedBalance"),
  reserveList: document.querySelector("#reserveList"),
  themeButton: document.querySelector("#themeButton"),
  themeModal: document.querySelector("#themeModal"),
  themeGrid: document.querySelector("#themeGrid"),
  menuButton: document.querySelector("#menuButton"),
  drawer: document.querySelector("#drawer"),
  drawerBackdrop: document.querySelector("#drawerBackdrop"),
  closeDrawer: document.querySelector("#closeDrawer"),
  editBalance: document.querySelector("#editBalance"),
  addReserve: document.querySelector("#addReserve"),
  balanceModal: document.querySelector("#balanceModal"),
  balanceForm: document.querySelector("#balanceForm"),
  balanceInput: document.querySelector("#balanceInput"),
  reserveModal: document.querySelector("#reserveModal"),
  reserveForm: document.querySelector("#reserveForm"),
  reserveModalTitle: document.querySelector("#reserveModalTitle"),
  reserveId: document.querySelector("#reserveId"),
  reserveName: document.querySelector("#reserveName"),
  reserveAmount: document.querySelector("#reserveAmount"),
  deleteReserve: document.querySelector("#deleteReserve"),
  iconOptions: document.querySelector("#iconOptions"),
  colorOptions: document.querySelector("#colorOptions"),
  reservesView: document.querySelector("#reservesView"),
  aboutView: document.querySelector("#aboutView"),
};

render();
bindEvents();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) return JSON.parse(saved);

  return {
    themeIndex: 0,
    total: 2000,
    reserves: [
      { id: crypto.randomUUID(), name: "Cartão", amount: 200, color: "#007aff", icon: "credit-card" },
      { id: crypto.randomUUID(), name: "Internet", amount: 80, color: "#34c759", icon: "wifi" },
      { id: crypto.randomUUID(), name: "Juntar", amount: 100, color: "#ffcc00", icon: "piggy-bank" },
    ],
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function bindEvents() {
  elements.menuButton.addEventListener("click", openDrawer);
  elements.closeDrawer.addEventListener("click", closeDrawer);
  elements.drawerBackdrop.addEventListener("click", closeDrawer);

  document.querySelectorAll(".drawer-nav button").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      closeDrawer();

      if (action === "reserves") showView("reserves");
      if (action === "about") showView("about");
      if (action === "theme") openThemeModal();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
  });

  elements.themeButton.addEventListener("click", openThemeModal);

  elements.editBalance.addEventListener("click", openBalanceModal);
  elements.editBalance.addEventListener("keydown", (event) => {
    if (event.key === "Enter") openBalanceModal();
  });

  elements.addReserve.addEventListener("click", () => openReserveModal());

  elements.balanceForm.addEventListener("submit", () => {
    state.total = Math.max(0, parseMoney(elements.balanceInput.value));
    saveState();
    render();
  });

  elements.reserveForm.addEventListener("submit", () => {
    const id = elements.reserveId.value || crypto.randomUUID();
    const name = elements.reserveName.value.trim();
    const amount = parseMoney(elements.reserveAmount.value);

    if (!name || amount <= 0) {
      alert("Preencha nome e valor.");
      return;
    }

    const reserve = { id, name, amount, color: selectedColor, icon: selectedIcon };
    const index = state.reserves.findIndex((item) => item.id === id);

    if (index >= 0) state.reserves[index] = reserve;
    else state.reserves.unshift(reserve);

    saveState();
    render();
  });

  elements.deleteReserve.addEventListener("click", () => {
    state.reserves = state.reserves.filter((reserve) => reserve.id !== elements.reserveId.value);
    elements.reserveModal.close();
    saveState();
    render();
  });

  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(`#${button.dataset.close}`).close();
    });
  });
}

function render() {
  applyTheme();
  renderBalances();
  renderReserves();
  renderIconOptions();
  renderColorOptions();
  renderThemeOptions();
  refreshIcons();
}

function applyTheme() {
  const theme = themes[state.themeIndex] || themes[0];
  const root = document.documentElement;

  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-2", theme.accent2);
  root.style.setProperty("--bg", theme.bg);
  root.style.setProperty("--panel", theme.panel);
  root.style.setProperty("--text", theme.text);
  root.style.setProperty("--muted", theme.muted);
}

function renderBalances() {
  const reserved = state.reserves.reduce((sum, reserve) => sum + reserve.amount, 0);
  elements.totalBalance.textContent = formatMoney(state.total);
  elements.freeBalance.textContent = formatMoney(state.total - reserved);
  elements.reservedBalance.textContent = formatMoney(reserved);
}

function renderReserves() {
  elements.reserveList.innerHTML = "";

  if (!state.reserves.length) {
    elements.reserveList.innerHTML = '<div class="empty-state">Crie sua primeira reserva.</div>';
    return;
  }

  state.reserves.forEach((reserve) => {
    const button = document.createElement("button");
    button.className = "reserve-item";
    button.type = "button";
    button.style.setProperty("--reserve-color", reserve.color);
    button.innerHTML = `
      <span class="reserve-symbol"><i data-lucide="${reserve.icon || "wallet"}"></i></span>
      <span class="reserve-info">
        <span class="reserve-name">${escapeHtml(reserve.name)}</span>
        <span class="reserve-note">Reserva virtual</span>
      </span>
      <span class="reserve-value">${formatMoney(reserve.amount)}</span>
    `;
    button.addEventListener("click", () => openReserveModal(reserve));
    elements.reserveList.appendChild(button);
  });
}

function renderIconOptions() {
  elements.iconOptions.innerHTML = "";

  reserveIcons.forEach((icon) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `choice ${icon === selectedIcon ? "selected" : ""}`;
    button.innerHTML = `<i data-lucide="${icon}"></i>`;
    button.addEventListener("click", () => {
      selectedIcon = icon;
      renderIconOptions();
      refreshIcons();
    });
    elements.iconOptions.appendChild(button);
  });
}

function renderColorOptions() {
  elements.colorOptions.innerHTML = "";

  reserveColors.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `choice ${color === selectedColor ? "selected" : ""}`;
    button.style.setProperty("--choice-bg", color);
    button.style.setProperty("--choice-color", "#fff");
    button.addEventListener("click", () => {
      selectedColor = color;
      renderColorOptions();
    });
    elements.colorOptions.appendChild(button);
  });
}

function renderThemeOptions() {
  elements.themeGrid.innerHTML = "";

  themes.forEach((theme, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `theme-option ${index === state.themeIndex ? "selected" : ""}`;
    button.innerHTML = `
      <span class="theme-swatch" style="--a:${theme.accent}; --b:${theme.accent2}"></span>
      <span>${theme.name}</span>
    `;
    button.addEventListener("click", () => {
      state.themeIndex = index;
      saveState();
      applyTheme();
      renderThemeOptions();
      refreshIcons();
    });
    elements.themeGrid.appendChild(button);
  });
}

function openBalanceModal() {
  elements.balanceInput.value = state.total.toFixed(2).replace(".", ",");
  elements.balanceModal.showModal();
  elements.balanceInput.focus();
}

function openReserveModal(reserve = null) {
  elements.reserveModalTitle.textContent = reserve ? "Editar reserva" : "Nova reserva";
  elements.reserveId.value = reserve?.id || "";
  elements.reserveName.value = reserve?.name || "";
  elements.reserveAmount.value = reserve ? reserve.amount.toFixed(2).replace(".", ",") : "";
  selectedColor = reserve?.color || reserveColors[0];
  selectedIcon = reserve?.icon || reserveIcons[0];
  elements.deleteReserve.style.display = reserve ? "block" : "none";
  renderIconOptions();
  renderColorOptions();
  refreshIcons();
  elements.reserveModal.showModal();
  elements.reserveName.focus();
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function openThemeModal() {
  renderThemeOptions();
  elements.themeModal.showModal();
  refreshIcons();
}

function showView(view) {
  const isAbout = view === "about";
  elements.aboutView.hidden = !isAbout;
  elements.reservesView.hidden = isAbout;
  refreshIcons();
}

function openDrawer() {
  elements.drawerBackdrop.hidden = false;
  elements.drawer.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => document.body.classList.add("drawer-open"));
}

function closeDrawer() {
  document.body.classList.remove("drawer-open");
  elements.drawer.setAttribute("aria-hidden", "true");
  window.setTimeout(() => {
    if (!document.body.classList.contains("drawer-open")) {
      elements.drawerBackdrop.hidden = true;
    }
  }, 220);
}

function parseMoney(value) {
  return Number(
    String(value)
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
  ) || 0;
}

function formatMoney(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}
