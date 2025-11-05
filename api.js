const API = {
  async getConfig(droneId){
    const url = ${CONFIG.API_BASE_URL}/config/${encodeURIComponent(droneId)};
    const res = await fetch(url);
    if (!res.ok) throw new Error(Config error ${res.status});
    return res.json(); // {drone_id, drone_name, light, country, ...}
  },

  async postLog({drone_id, drone_name, country, celsius}){
    const url = ${CONFIG.API_BASE_URL}/logs;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ drone_id, drone_name, country, celsius })
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(POST /logs failed ${res.status}: ${txt});
    }
    return res.json(); // {drone_id, drone_name, created, country, celsius}
  },

  async getLogs(droneId, {page=1, perPage=12}={}){
    const url = new URL(${CONFIG.API_BASE_URL}/log/${droneId});
    url.searchParams.set('page', page);
    url.searchParams.set('perPage', perPage);
    // backend จัดเรียง created ล่าสุดก่อนอยู่แล้วจากที่ทำใน Assignment #1
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(Logs error ${res.status});
    return res.json(); // Array of {created,country,drone_id,drone_name,celsius}
  }
};