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
  
  statusIndicator.classList.remove('running', 'paused', 'stopped');
  statusIndicator.style.transition = 'all 0.3s ease';
  
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
  
  redLed.classList.remove('active');
  yellowLed.classList.remove('active');
  greenLed.classList.remove('active');
  
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

function animateRandomLEDs() {
  const leds = document.querySelectorAll('.led-container .led');
  
  setInterval(() => {
    const randomLed = leds[Math.floor(Math.random() * leds.length)];
    
    randomLed.style.transition = 'all 0.3s ease';
    randomLed.style.opacity = '0.3';
    
    setTimeout(() => {
      randomLed.style.opacity = '1';
    }, 300);
  }, 1000);
}

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
  animateRandomLEDs();
  
  const startBtn = document.getElementById('start');
  const pauseBtn = document.getElementById('pause');
  const resumeBtn = document.getElementById('resume');
  const stopBtn = document.getElementById('stop');
  
  addButtonAnimation(startBtn, "startActions");
  addButtonAnimation(pauseBtn, "pauseActions");
  addButtonAnimation(resumeBtn, "resumeActions");
  addButtonAnimation(stopBtn, "stopActions");
  
  sendMessage("getStatus");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "showNotification") {
    chrome.notifications.create('', {
      type: 'basic',
      iconUrl: 'icon.png',
      title: request.title,
      message: request.message,
      priority: 2
    });
  }
});