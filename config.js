// === ตั้งค่าตาม .env ฝั่ง Backend ของคุณ ===
const CONFIG = {
  API_BASE_URL: 'http://localhost:3000',  // <<< เปลี่ยนตาม backend ของคุณ
  DRONE_ID: 66010730                       // <<< drone id เริ่มต้น
};

// อนุญาตให้ override ผ่าน URL query
(function applyQueryOverride() {
  const params = new URLSearchParams(location.search);
  const id = params.get('drone_id');
  const api = params.get('api_base_url');

  if (id)  CONFIG.DRONE_ID = Number(id);
  if (api) CONFIG.API_BASE_URL = api;
})();