const mockSequence = [
  {
    connected: false,
    data: {
      status: "entry",
      speed: null,
      entry_timestamp: null,
      exit_timestamp: null,
      passed: null,
    },
  },
  {
    connected: true,
    data: {
      status: "entry",
      speed: null,
      entry_timestamp: null,
      exit_timestamp: null,
      passed: null,
    },
  },
  {
    connected: true,
    data: {
      status: "exit",
      speed: null,
      entry_timestamp: "2026-06-21T19:26:04Z",
      exit_timestamp: null,
      passed: null,
    },
  },
  {
    connected: true,
    data: {
      status: "completed",
      speed: 32.4,
      entry_timestamp: "2026-06-21T19:26:04Z",
      exit_timestamp: "2026-06-21T19:26:07Z",
      passed: true,
    },
  },
  {
    connected: true,
    data: {
      status: "completed",
      speed: 27.8,
      entry_timestamp: "2026-06-21T19:31:10Z",
      exit_timestamp: "2026-06-21T19:31:14Z",
      passed: false,
    },
  },
];

let currentIndex = 0;

function formatDateTime(value) {
  if (value === null) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function getTrialStatus(data) {
  if (data.status === "entry") return "Oczekiwanie na start";
  if (data.status === "exit") return "W trakcie przejazdu";
  if (data.status === "completed") return "Zakończona";
  return "Nieznany";
}

function updateConnection(isConnected) {
  const connectionBox = document.querySelector("[data-connection]");
  const connectionText = document.querySelector("[data-connection-text]");

  if (!connectionBox || !connectionText) return;

  connectionBox.classList.toggle("connection--online", isConnected);
  connectionBox.classList.toggle("connection--offline", !isConnected);

  connectionText.textContent = isConnected
    ? "Połączono z ESP"
    : "Brak połączenia z ESP";
}

function updateResult(data) {
  const resultPill = document.querySelector("[data-result-pill]");
  const resultText = document.querySelector("[data-result-text]");

  if (!resultPill || !resultText) return;

  resultPill.classList.remove(
    "result-pill--ok",
    "result-pill--fail",
    "result-pill--wait",
  );

  resultText.classList.remove(
    "result-description--ok",
    "result-description--fail",
    "result-description--wait",
  );

  if (data.status === "entry") {
    resultPill.textContent = "Oczekiwanie";
    resultPill.classList.add("result-pill--wait");

    resultText.textContent =
      "System oczekuje na przejazd przez bramkę początkową.";
    resultText.classList.add("result-description--wait");
    return;
  }

  if (data.status === "exit") {
    resultPill.textContent = "Pomiar trwa";
    resultPill.classList.add("result-pill--wait");

    resultText.textContent =
      "Zarejestrowano bramkę wejściową. Oczekiwanie na bramkę końcową.";
    resultText.classList.add("result-description--wait");
    return;
  }

  if (data.status === "completed") {
    if (data.passed === true) {
      resultPill.textContent = "Zaliczone";
      resultPill.classList.add("result-pill--ok");

      resultText.textContent =
        "Średnia prędkość spełnia warunek zadania egzaminacyjnego.";
      resultText.classList.add("result-description--ok");
    } else {
      resultPill.textContent = "Niezaliczone";
      resultPill.classList.add("result-pill--fail");

      resultText.textContent =
        "Średnia prędkość nie spełnia wymaganego minimum 30 km/h.";
      resultText.classList.add("result-description--fail");
    }
  }
}

function updateSpeed(data) {
  const speedEl = document.querySelector("[data-speed]");
  if (!speedEl) return;

  if (data.speed === null) {
    speedEl.innerHTML = "— <span>km/h</span>";
  } else {
    speedEl.innerHTML = `${data.speed.toFixed(1)} <span>km/h</span>`;
  }
}

function updateDetails(data) {
  const statusEl = document.querySelector("[data-status]");
  const entryEl = document.querySelector("[data-entry]");
  const exitEl = document.querySelector("[data-exit]");

  if (statusEl) statusEl.textContent = getTrialStatus(data);
  if (entryEl) entryEl.textContent = formatDateTime(data.entry_timestamp);
  if (exitEl) exitEl.textContent = formatDateTime(data.exit_timestamp);
}

function showDisconnectedState(data) {
  const statusEl = document.querySelector("[data-status]");
  const entryEl = document.querySelector("[data-entry]");
  const exitEl = document.querySelector("[data-exit]");
  const speedEl = document.querySelector("[data-speed]");
  const resultPill = document.querySelector("[data-result-pill]");
  const resultText = document.querySelector("[data-result-text]");

  updateConnection(false);

  if (statusEl) statusEl.textContent = "Brak komunikacji";
  if (entryEl) entryEl.textContent = formatDateTime(data.entry_timestamp);
  if (exitEl) exitEl.textContent = formatDateTime(data.exit_timestamp);
  if (speedEl) speedEl.innerHTML = "— <span>km/h</span>";

  if (resultPill) {
    resultPill.classList.remove(
      "result-pill--ok",
      "result-pill--fail",
      "result-pill--wait",
    );
    resultPill.classList.add("result-pill--fail");
    resultPill.textContent = "Brak połączenia";
  }

  if (resultText) {
    resultText.classList.remove(
      "result-description--ok",
      "result-description--fail",
      "result-description--wait",
    );
    resultText.classList.add("result-description--fail");
    resultText.textContent =
      "Nie można pobrać danych z modułu ESP. Sprawdź połączenie.";
  }
}

function updateUI(step) {
  if (!step) return;

  if (!step.connected) {
    showDisconnectedState(step.data);
    return;
  }

  updateConnection(true);
  updateSpeed(step.data);
  updateResult(step.data);
  updateDetails(step.data);
}

document.addEventListener("DOMContentLoaded", () => {
  updateUI(mockSequence[0]);

  setInterval(() => {
    currentIndex = (currentIndex + 1) % mockSequence.length;
    updateUI(mockSequence[currentIndex]);
  }, 5000);
});
