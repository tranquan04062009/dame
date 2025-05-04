// Các key hợp lệ lấy từ API (dự phòng khi không kết nối được với server)
const validKeys = [
  {
    id: "67ffb8ab9eb2f",
    key_value: "1",
    created_at: "2025-04-16 14:03:23",
    expiry_date: "2025-11-11",
    is_active: true,
    used_by: []
  }
];

// Kiểm tra key đã được lưu trong localStorage
function checkSavedKey() {
  const savedKey = localStorage.getItem('jpProfiler_key');
  if (savedKey) {
    const keyDetails = JSON.parse(savedKey);
    const now = new Date();
    const expiryDate = new Date(keyDetails.expiry_date);
    
    if (expiryDate > now && keyDetails.is_active) {
      activateControls();
      showKeyStatus('Key đã được kích hoạt!', 'success');
      return true;
    } else {
      localStorage.removeItem('jpProfiler_key');
      showKeyStatus('Key đã hết hạn, vui lòng nhập key mới', 'error');
    }
  }
  return false;
}

// Xác thực key với server
function validateKeyOnline(inputKey) {
  showKeyStatus('Đang kiểm tra key...', 'warning');
  
  chrome.runtime.sendMessage(
    { type: "validateKey", key: inputKey },
    (response) => {
      if (response.valid) {
        // Lưu key vào localStorage
        localStorage.setItem('jpProfiler_key', JSON.stringify(response.keyData));
        
        showKeyStatus('Key đã được kích hoạt thành công!', 'success');
        activateControls();
      } else if (response.offline) {
        // Nếu không kết nối được với server, sử dụng key offline
        validateKeyOffline(inputKey);
      } else {
        showKeyStatus(response.message, 'error');
      }
    }
  );
}

// Xác thực key offline (dự phòng)
function validateKeyOffline(inputKey) {
  const matchedKey = validKeys.find(key => key.key_value === inputKey);
  
  if (!matchedKey) {
    showKeyStatus('Key không hợp lệ!', 'error');
    return false;
  }
  
  const now = new Date();
  const expiryDate = new Date(matchedKey.expiry_date);
  
  if (expiryDate <= now) {
    showKeyStatus('Key đã hết hạn!', 'error');
    return false;
  }
  
  if (!matchedKey.is_active) {
    showKeyStatus('Key đã bị vô hiệu hóa!', 'error');
    return false;
  }
  
  // Lưu key vào localStorage
  localStorage.setItem('jpProfiler_key', JSON.stringify(matchedKey));
  
  showKeyStatus('Key đã được kích hoạt thành công! (kiểm tra offline)', 'success');
  activateControls();
  return true;
}

// Hiển thị trạng thái key
function showKeyStatus(message, status) {
  const keyStatusEl = document.getElementById('key-status');
  keyStatusEl.textContent = message;
  
  keyStatusEl.className = 'key-status';
  if (status) {
    keyStatusEl.classList.add(status);
  }
}

// Hiển thị phần điều khiển
function activateControls() {
  const keySection = document.getElementById('key-section');
  const controlsSection = document.getElementById('controls-section');
  
  // Thêm hiệu ứng chuyển đổi
  keySection.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  keySection.style.opacity = '0';
  keySection.style.transform = 'translateY(-10px)';
  
  setTimeout(() => {
    keySection.style.display = 'none';
    controlsSection.classList.add('active');
    
    // Hiệu ứng hiển thị phần điều khiển
    controlsSection.style.opacity = '0';
    controlsSection.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
      controlsSection.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      controlsSection.style.opacity = '1';
      controlsSection.style.transform = 'translateY(0)';
    }, 50);
  }, 300);
}

function sendMessage(action) {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action}, (response) => {
      if (response?.status) {
        updateStatusUI(response.status);
      }
    });
  });
}

function updateStatusUI(status) {
  const statusText = document.getElementById('status');
  const statusIndicator = document.getElementById('status-indicator');
  
  statusText.textContent = "Trạng thái: " + status;
  
  // Xoá tất cả các class
  statusIndicator.classList.remove('running', 'paused', 'stopped');
  
  // Thêm hiệu ứng chuyển đổi trạng thái
  statusIndicator.style.transition = 'all 0.3s ease';
  
  // Thêm class phù hợp dựa theo trạng thái
  if (status === "Đang chạy liên tục") {
    statusIndicator.classList.add('running');
    animateStatusChange('running');
    updateStatusLEDs('running');
  } else if (status === "Tạm dừng") {
    statusIndicator.classList.add('paused');
    animateStatusChange('paused');
    updateStatusLEDs('paused');
  } else if (status === "Chưa chạy" || status === "Đã dừng") {
    statusIndicator.classList.add('stopped');
    animateStatusChange('stopped');
    updateStatusLEDs('stopped');
  }
}

function updateStatusLEDs(status) {
  const redLed = document.getElementById('led-red');
  const yellowLed = document.getElementById('led-yellow');
  const greenLed = document.getElementById('led-green');
  
  // Xóa trạng thái active từ tất cả LED
  redLed.classList.remove('active');
  yellowLed.classList.remove('active');
  greenLed.classList.remove('active');
  
  // Cập nhật trạng thái LED tương ứng
  switch(status) {
    case 'running':
      greenLed.classList.add('active');
      break;
    case 'paused':
      yellowLed.classList.add('active');
      break;
    case 'stopped':
      redLed.classList.add('active');
      break;
  }
}

function animateStatusChange(statusClass) {
  const statusCard = document.querySelector('.status-card');
  
  // Tạo hiệu ứng flash khi thay đổi trạng thái
  statusCard.style.transition = 'box-shadow 0.3s ease';
  
  switch (statusClass) {
    case 'running':
      statusCard.style.boxShadow = '0 0 15px rgba(40, 167, 69, 0.3)';
      break;
    case 'paused':
      statusCard.style.boxShadow = '0 0 15px rgba(255, 193, 7, 0.3)';
      break;
    case 'stopped':
      statusCard.style.boxShadow = '0 0 15px rgba(220, 53, 69, 0.3)';
      break;
  }
  
  setTimeout(() => {
    statusCard.style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
  }, 500);
}

function addButtonAnimation(button, action) {
  button.addEventListener('click', () => {
    // Hiệu ứng tỏa sáng khi nhấn nút
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    button.appendChild(ripple);
    
    ripple.style.width = `${Math.max(button.clientWidth, button.clientHeight) * 2}px`;
    ripple.style.height = ripple.style.width;
    ripple.style.left = `${-button.clientWidth}px`;
    ripple.style.top = `${-button.clientHeight}px`;
    
    ripple.style.animation = 'ripple 0.6s ease-out forwards';
    
    setTimeout(() => {
      ripple.remove();
      sendMessage(action);
    }, 300);
  });
}

// Tạo hiệu ứng LED nhấp nháy ngẫu nhiên
function animateRandomLEDs() {
  const leds = document.querySelectorAll('.led-container .led');
  
  // Chọn ngẫu nhiên một LED để thay đổi độ sáng
  setInterval(() => {
    const randomLed = leds[Math.floor(Math.random() * leds.length)];
    
    randomLed.style.transition = 'all 0.3s ease';
    randomLed.style.opacity = '0.3';
    
    setTimeout(() => {
      randomLed.style.opacity = '1';
    }, 300);
  }, 1000);
}

// Thêm hiệu ứng nút kích hoạt key
function setupKeyActivation() {
  const activateButton = document.getElementById('activate-key-btn');
  const keyInput = document.getElementById('key-input');
  
  activateButton.addEventListener('click', () => {
    const key = keyInput.value.trim();
    if (!key) {
      showKeyStatus('Vui lòng nhập key!', 'warning');
      return;
    }
    
    validateKeyOnline(key);
  });
  
  // Cho phép nhấn Enter để kích hoạt
  keyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      activateButton.click();
    }
  });
  
  // Hiệu ứng nút nhấn
  activateButton.addEventListener('mousedown', () => {
    activateButton.style.transform = 'scale(0.98)';
  });
  
  activateButton.addEventListener('mouseup', () => {
    activateButton.style.transform = '';
  });
  
  activateButton.addEventListener('mouseleave', () => {
    activateButton.style.transform = '';
  });
}

// Thêm CSS cho hiệu ứng ripple
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.textContent = `
  .btn {
    position: relative;
    overflow: hidden;
  }
  
  .ripple {
    position: absolute;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    transform: scale(0);
    opacity: 1;
    pointer-events: none;
  }
  
  @keyframes ripple {
    to {
      transform: scale(1);
      opacity: 0;
    }
  }
`;
document.head.appendChild(styleSheet);

document.addEventListener("DOMContentLoaded", () => {
  // Bắt đầu animation cho LED ngẫu nhiên
  animateRandomLEDs();
  
  // Hiện thông báo chào mừng
  showKeyStatus('Vui lòng nhập key để kích hoạt tiện ích', 'warning');
  
  // Kiểm tra key đã lưu
  if (!checkSavedKey()) {
    // Nếu chưa có key, thiết lập chức năng kích hoạt key
    setupKeyActivation();
  }
  
  // Thiết lập các nút điều khiển
  const startBtn = document.getElementById('start');
  const pauseBtn = document.getElementById('pause');
  const resumeBtn = document.getElementById('resume');
  const stopBtn = document.getElementById('stop');
  
  // Thay đổi cách xử lý sự kiện click để thêm hiệu ứng
  startBtn.onclick = null;
  pauseBtn.onclick = null;
  resumeBtn.onclick = null;
  stopBtn.onclick = null;
  
  addButtonAnimation(startBtn, "startActions");
  addButtonAnimation(pauseBtn, "pauseActions");
  addButtonAnimation(resumeBtn, "resumeActions");
  addButtonAnimation(stopBtn, "stopActions");
  
  // Cập nhật trạng thái ban đầu
  sendMessage("getStatus");
});
