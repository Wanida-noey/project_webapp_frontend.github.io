// document.addEventListener('DOMContentLoaded', () => {
//   const btnConfig   = document.getElementById('btnConfig');
//   const btnLogTemp  = document.getElementById('btnLogTemp');
//   const btnViewLogs = document.getElementById('btnViewLogs');

//   const pageConfig = document.getElementById('page-config');
//   const pageForm   = document.getElementById('page-form');
//   const pageLogs   = document.getElementById('page-logs');

//   const allBtns  = [btnConfig, btnLogTemp, btnViewLogs];
//   const allPages = [pageConfig, pageForm, pageLogs];

//   function activate(button, page){
//     allPages.forEach(p => p.classList.remove('active'));
//     allBtns.forEach(b => b.classList.remove('active'));

//     page.classList.add('active');
//     button.classList.add('active');
//   }

//   window.showConfig    = () => activate(btnConfig, pageConfig);
//   window.showLogTemp   = () => activate(btnLogTemp, pageForm);
//   window.showViewLogs  = () => activate(btnViewLogs, pageLogs);

//   btnConfig  .addEventListener('click', window.showConfig);
//   btnLogTemp .addEventListener('click', window.showLogTemp);
//   btnViewLogs.addEventListener('click', window.showViewLogs);

//   window.showConfig();
// });

// app.js
document.addEventListener('DOMContentLoaded', () => {
  // --- nav buttons ---
  const btnConfig   = document.getElementById('btnConfig');
  const btnLogTemp  = document.getElementById('btnLogTemp');
  const btnViewLogs = document.getElementById('btnViewLogs');

  // --- pages ---
  const pageConfig = document.getElementById('page-config');
  const pageForm   = document.getElementById('page-form');
  const pageLogs   = document.getElementById('page-logs');

  const allBtns  = [btnConfig, btnLogTemp, btnViewLogs];
  const allPages = [pageConfig, pageForm, pageLogs];

  function activate(button, page){
    allPages.forEach(p => p && p.classList.remove('active'));
    allBtns.forEach(b => b && b.classList.remove('active'));
    page && page.classList.add('active');
    button && button.classList.add('active');
  }

  // ===== Backend base =====
  const API_BASE = 'http://localhost:5000';
  let CURRENT_CONFIG = null;

  // ===== Config handlers =====
  async function loadConfig(){
    const idEl      = document.getElementById('droneId');
    const nameEl    = document.getElementById('droneName');
    const lightEl   = document.getElementById('light');
    const countryEl = document.getElementById('country');
    const statusEl  = document.getElementById('config-status');

    try {
      statusEl && (statusEl.textContent = 'Loading...');
      const res  = await fetch(`${API_BASE}/api/config`);
      const data = await res.json();
      CURRENT_CONFIG = data;

      idEl      && (idEl.textContent      = data.droneId ?? '—');
      nameEl    && (nameEl.textContent    = data.droneName ?? '—');
      lightEl   && (lightEl.textContent   = data.light ?? '—');
      countryEl && (countryEl.textContent = data.country ?? '—');

      // autofill หน้า 2
      const fId   = document.getElementById('form-drone-id');
      const fName = document.getElementById('form-drone-name');
      const fCtry = document.getElementById('form-country');
      fId   && (fId.value   = data.droneId ?? '');
      fName && (fName.value = data.droneName ?? '');
      fCtry && (fCtry.value = data.country ?? '');

      statusEl && (statusEl.textContent = 'Loaded');
      console.log('Config loaded:', data);
    } catch (err) {
      statusEl && (statusEl.textContent = '❌ Error loading config');
      console.error('loadConfig error', err);
    }
  }

  // ===== Logs handlers =====
  async function loadLogs(){
    const wrap = document.getElementById('logsContainer');
    const tbody = document.querySelector('#logs-table tbody');
    const status = document.getElementById('logs-status');

    try {
      status && (status.textContent = 'Loading...');
      const res = await fetch(`${API_BASE}/api/logs`);
      const data = await res.json();

      // simple render
      if (wrap) {
        wrap.innerHTML = (data.logs || []).map(x => `<div>${x}</div>`).join('') || 'No logs';
      }

      // table render (ถ้า backend คืนเป็นรายการ object ภายหลังค่อยปรับ)
      if (tbody) {
        tbody.innerHTML = '';
        (data.rows || []).forEach(row => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${row.created ?? '-'}</td>
            <td>${row.country ?? '-'}</td>
            <td>${row.droneId ?? '-'}</td>
            <td>${row.droneName ?? '-'}</td>
            <td>${row.celsius ?? '-'}</td>
          `;
          tbody.appendChild(tr);
        });
      }

      status && (status.textContent = 'Loaded');
      console.log('Logs loaded:', data);
    } catch (err) {
      status && (status.textContent = '❌ Error loading logs');
      console.error('loadLogs error', err);
    }
  }

  // ===== Form submit (หน้า 2) =====
  const form = document.getElementById('log-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('form-status');

      const payload = {
        droneId:   document.getElementById('form-drone-id')?.value || CURRENT_CONFIG?.droneId,
        droneName: document.getElementById('form-drone-name')?.value || CURRENT_CONFIG?.droneName,
        country:   document.getElementById('form-country')?.value || CURRENT_CONFIG?.country,
        celsius:   parseFloat(document.getElementById('form-celsius')?.value)
      };

      try {
        status && (status.textContent = 'Submitting...');
        const res  = await fetch(`${API_BASE}/api/logs`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        status && (status.textContent = 'Saved ✔');
        console.log('Submit result:', data);
      } catch (err) {
        status && (status.textContent = '❌ Submit failed');
        console.error('submit error', err);
      }
    });
  }

  // ===== Buttons -> pages =====
  window.showConfig = () => { activate(btnConfig, pageConfig); loadConfig(); };
  window.showLogTemp = () => { activate(btnLogTemp, pageForm); };
  window.showViewLogs = () => { activate(btnViewLogs, pageLogs); loadLogs(); };

  btnConfig  && btnConfig.addEventListener('click', window.showConfig);
  btnLogTemp && btnLogTemp.addEventListener('click', window.showLogTemp);
  btnViewLogs&& btnViewLogs.addEventListener('click', window.showViewLogs);

  // เปิดหน้าแรก + โหลดข้อมูล
  window.showConfig();
  console.log('app.js initialized');
});