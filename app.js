document.addEventListener('DOMContentLoaded', () => {
  // ===== Navigation buttons =====
  const btnConfig   = document.getElementById('btnConfig');
  const btnLogTemp  = document.getElementById('btnLogTemp');
  const btnViewLogs = document.getElementById('btnViewLogs');

  const pageConfig = document.getElementById('page-config');
  const pageForm   = document.getElementById('page-form');
  const pageLogs   = document.getElementById('page-logs');

  function activate(btn, page) {
    [btnConfig, btnLogTemp, btnViewLogs].forEach(b => b?.classList.remove('active'));
    [pageConfig, pageForm, pageLogs].forEach(p => p?.classList.remove('active'));
    btn?.classList.add('active');
    page?.classList.add('active');
  }

  // ===== Auto API Base =====
  const isVercel = location.hostname.endsWith('vercel.app');
  const isPort5000 = location.port === '5000';
  const API_BASE = (isVercel || isPort5000) ? '' : 'http://localhost:5000';

  let CURRENT_CONFIG = null;

  // ===== Load Config =====
  async function loadConfig() {
    try {
      const res = await fetch(`${API_BASE}/api/config`);
      const data = await res.json();
      CURRENT_CONFIG = data;

      document.getElementById('droneId').textContent = data.droneId;
      document.getElementById('droneName').textContent = data.droneName;
      document.getElementById('light').textContent = data.light;
      document.getElementById('country').textContent = data.country;

      document.getElementById('form-drone-id').value = data.droneId;
      document.getElementById('form-drone-name').value = data.droneName;
      document.getElementById('form-country').value = data.country;

    } catch (e) {
      console.error("Config load failed", e);
    }
  }

  // ===== Load Logs =====
  async function loadLogs() {
    try {
      const res = await fetch(`${API_BASE}/api/logs`);
      const data = await res.json();

      const tbody = document.querySelector('#logs-table tbody');
      tbody.innerHTML = '';

      (data.rows || []).forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.created}</td>
          <td>${row.country}</td>
          <td>${row.droneId}</td>
          <td>${row.droneName}</td>
          <td>${row.celsius}</td>
        `;
        tbody.appendChild(tr);
      });

    } catch (e) {
      console.error("Log load failed", e);
    }
  }

  // ===== Form Submit =====
  const form = document.getElementById('log-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('form-status');

    const payload = {
      droneId:   document.getElementById('form-drone-id').value,
      droneName: document.getElementById('form-drone-name').value,
      country:   document.getElementById('form-country').value,
      celsius:   parseFloat(document.getElementById('form-celsius').value)
    };

    try {
      status.textContent = "Submitting...";

      const res = await fetch(`${API_BASE}/api/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Submit failed");

      status.textContent = "Saved ✔";
      document.getElementById('form-celsius').value = "";

    } catch (e) {
      status.textContent = "Submit failed ✘";
      console.error(e);
    }
  });

  // ===== nav button actions =====
  btnConfig.addEventListener('click', () => { activate(btnConfig, pageConfig); loadConfig(); });
  btnLogTemp.addEventListener('click', () => activate(btnLogTemp, pageForm));
  btnViewLogs.addEventListener('click', () => { activate(btnViewLogs, pageLogs); loadLogs(); });

  // Init
  activate(btnConfig, pageConfig);
  loadConfig();
});