// === content.js ===
let running = false;
let paused = false;

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "startActions") {
    if (!running) {
      running = true;
      paused = false;
      performActions();
    }
    sendResponse({status: getStatus()});
  } else if (req.action === "pauseActions") {
    paused = true;
    sendResponse({status: getStatus()});
  } else if (req.action === "resumeActions") {
    paused = false;
    sendResponse({status: getStatus()});
  } else if (req.action === "stopActions") {
    running = false;
    paused = false;
    sendResponse({status: getStatus()});
  } else if (req.action === "getStatus") {
    sendResponse({status: getStatus()});
  }
});

function getStatus() {
  if (!running) return running ? "Đã dừng" : "Chưa chạy";
  if (paused) return "Tạm dừng";
  return "Đang chạy liên tục";
}

function notify(title, msg) {
  chrome.runtime.sendMessage({type: "showNotification", title, message: msg});
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function clickWithDelay(selector, delayTime) {
  await delay(delayTime);
  const el = document.querySelector(selector);
  if (el) {
    el.dispatchEvent(new MouseEvent("click", {bubbles: true}));
    notify("Đã Click", selector);
  } else {
    notify("Không tìm thấy", selector);
  }
}

async function processStep(keywordObj) {
  let clicked = false;
  document.querySelectorAll('span').forEach(span => {
    const text = span.innerText.trim();
    if (Object.values(keywordObj).some(k => text.includes(k))) {
      span.click();
      clicked = true;
      notify("Click", text);
    }
  });
  if (!clicked) {
    notify("Không thấy", JSON.stringify(keywordObj));
  }
  await delay(1000);
}

async function performActions() {
  const delayTime = 1000;
  while (running) {
    if (paused) {
      await delay(500);
      continue;
    }
    await clickWithDelay('div[role="none"] svg', delay); // Mở phần tử div[role="none"]

    // Bước 2: Tiến hành bấm "Báo cáo trang cá nhân"
    const baocaotcn = {
        "vi": "Báo cáo trang cá nhân",
        "en": "Report profile",
        "es": "Informe de perfil",
        "ja": "プロフィールを報告",
        "hi": "प्रोफाइल रिपोर्ट गर्नुहोस्"
    };
    await processStep(baocaotcn);

    // Bước 3: Tiến hành bấm "Thông tin về trang này"
    const thongtinvetrang = {
        "vi": "Thông tin về trang này",
        "en": "Page Information",
        "es": "Información de la página",
        "ja": "このプロフィールに関すること",
        "hi": "यो प्रोफाइलका बारेमा केही कुरा",
        "nepal" : "यो प्रोफाइलका बारेमा केही कुरा",
        "Tienganh" : "Something about this profile"

    };
    await processStep(thongtinvetrang);

    // Bước 4: Tiến hành bấm "Tên giả mạo"
    const tengiammao = {
        "vi": "Tên giả mạo",
        "ja": "偽名",
        "hi": "नक्कली नाम",
        "Tienganh" : "Fake name"
    };
    await processStep(tengiammao);

    // Bước 5: Tiến hành bấm "Xong"
    const xong = {
        "vi": "Xong",
        "en": "Done",
        "es": "Hecho",
        "ja": "完了",
        "hi": "सम्पन्न भयो",
        "fr": "Fait",
        "de": "Fertig",
        "it": "Fatto",
        "pt": "Feito"
    };
    await processStep(xong);
    // dòng 4
    await clickWithDelay('div[role="none"] svg', delay); // Mở phần tử div[role="none"]
    await processStep(baocaotcn);
    await processStep(thongtinvetrang);
    const ndkphuhop = {
        "vi": "Đăng nội dung không phù hợp",
        "en": "Posting inappropriate things",
        "es": "Publicar contenido inapropiado",
        "ja": "不適切なコンテンツの投稿",
        "hi": "अनुपयुक्त कुराहरू पोस्ट गर्ने",
    };
    await processStep(ndkphuhop);
    await processStep(xong);
    // dòng 5
    await clickWithDelay('div[role="none"] svg', delay); // Mở phần tử div[role="none"]
    await processStep(baocaotcn);
    await processStep(thongtinvetrang);
    const quayroi = {
        "vi": "Quấy rối hoặc bắt nạt",
        "en": "Harassment or bullying",
        "es": "Acoso o intimidación",
        "ja": "嫌がらせやいじめ",
        "hi": "दुर्व्यवहार वा दादागिरी",
        "anh": "Harassment or bullying"
    };
    await processStep(quayroi);
    await processStep(xong);
    // Dòng 6 - 1 
    await clickWithDelay('div[role="none"] svg', delay); // Mở phần tử div[role="none"]
    await processStep(baocaotcn);
    await processStep(thongtinvetrang);
    const giupdo = {
        "vi": "Tôi muốn giúp đỡ",
        "en": "I want to help",
        "es": "Quiero ayuda",
        "ja": "この人を助けたい",
        "hi": "म मद्दत गर्न चाहन्छु",
    };
    await processStep(giupdo);
    const tutu = {
        "vi": "Tự tử",
        "en": "Suicide",
        "es": "Suicidio",
        "ja": "自殺",
        "hi": "आत्महत्या",
    };
    await processStep(tutu);
    await processStep(xong);
    // dong 6 -2
    await clickWithDelay('div[role="none"] svg', delay); // Mở phần tử div[role="none"]
    await processStep(baocaotcn);
    await processStep(thongtinvetrang);
    await processStep(giupdo);
    const thuontich = {
        "vi": "Tự gây thương tích",         // Tiếng Việt
        "en": "Self-injury",                  // Tiếng Anh
        "es": "Autolesiones",               // Tiếng Tây Ban Nha
        "ja": "自傷行為",              // Tiếng Nhật (Japanese)
        "hi": "आत्मघात",  // Tiếng Hindi (Hindi)
    };
    await processStep(thuontich);
    await processStep(xong);
    // dong 6-3
    await clickWithDelay('div[role="none"] svg', delay); // Mở phần tử div[role="none"]
    await processStep(baocaotcn);
    await processStep(thongtinvetrang);
    await processStep(giupdo);
    const quayroine = {
        "vi": "Quấy rối",                 // Tiếng Việt
        "en": "Harassment",                // Tiếng Anh
        "es": "Acoso",                     // Tiếng Tây Ban Nha
        "ja": "嫌がらせ",              // Tiếng Nhật (Japanese)
        "hi": "दुर्व्यवहार",  // Tiếng Hindi (Hindi)
    };
    await processStep(quayroine);
    await processStep(xong);
    // dong 6-4
    await clickWithDelay('div[role="none"] svg', delay); // Mở phần tử div[role="none"]
    await processStep(baocaotcn);
    await processStep(thongtinvetrang);
    await processStep(giupdo);
    const bihack = {
        "vi": "Bị hack",                  // Tiếng Việt
        "en": "Hacked",                    // Tiếng Anh
        "es": "Hackeado",                  // Tiếng Tây Ban Nha
        "ja": "不正アクセス",              // Tiếng Nhật (Japanese)
        "hi": "ह्याक गरिएको",  // Tiếng Hindi (Hindi)
    };
    await processStep(bihack);
    await processStep(xong);
    // d 7
    await clickWithDelay('div[role="none"] svg', delay); // Mở phần tử div[role="none"]
    await processStep(baocaotcn);
    await processStep(thongtinvetrang);
    const khac = {
        "vi": "Vấn đề khác",               // Tiếng Việt
        "en": "Something else",                // Tiếng Anh
        "es": "Otro problema",              // Tiếng Tây Ban Nha
        "ja": "その他",              // Tiếng Nhật (Japanese)
        "hi": "अरू केही",  // Tiếng Hindi (Hindi)
    };
    await processStep(khac);
    await processStep(xong);
    await delay(3000);
  }
}

function createFloatingPanel() {
  if (document.getElementById('floating-status-box')) return;

  const panel = document.createElement('div');
  panel.id = 'floating-status-box';
  panel.style = `
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 999999;
    background: white;
    color: black;
    font-size: 14px;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 0 8px rgba(0,0,0,0.2);
    font-family: sans-serif;
  `;

  panel.innerHTML = `
    <div id="status-text">Trạng thái: ⏹ Chưa chạy</div>
    <button id="btn-start">▶ Bắt đầu</button>
    <button id="btn-pause">⏸ Tạm dừng</button>
    <button id="btn-resume">⏯ Tiếp tục</button>
    <button id="btn-stop">⏹ Dừng</button>
  `;

  document.body.appendChild(panel);

  document.getElementById('btn-start').onclick = () => {
    if (!running) {
      running = true;
      paused = false;
      performActions();
    }
    updateStatusText();
  };

  document.getElementById('btn-pause').onclick = () => {
    paused = true;
    updateStatusText();
  };

  document.getElementById('btn-resume').onclick = () => {
    paused = false;
    updateStatusText();
  };

  document.getElementById('btn-stop').onclick = () => {
    running = false;
    paused = false;
    updateStatusText();
  };
}

function updateStatusText() {
  const text = getStatus();
  const statusText = document.getElementById('status-text');
  if (statusText) {
    statusText.textContent = `Trạng thái: ${text}`;
  }
}

function updateStatusFromContent(response) {
  if (response?.status) {
    const statusText = document.getElementById('status-text');
    if (statusText) {
      statusText.textContent = `Trạng thái: ${response.status}`;
    }
  }
}

createFloatingPanel();
