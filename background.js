chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "showNotification") {
    chrome.notifications.create('', {
      type: 'basic',
      iconUrl: 'icon.png',
      title: request.title,
      message: request.message,
      priority: 2
    });
  } else if (request.type === "validateKey") {
    validateKeyOnline(request.key)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        sendResponse({ valid: false, error: error.message });
      });
    return true; // Trả về true để chỉ ra rằng sẽ gọi sendResponse bất đồng bộ
  }
});

// Kiểm tra key với server
async function validateKeyOnline(key) {
  try {
    const response = await fetch('https://www.tiendeveloper.site/ctv/keys.json');
    
    if (!response.ok) {
      throw new Error('Không thể kết nối với máy chủ');
    }
    
    const keys = await response.json();
    const matchedKey = keys.find(k => k.key_value === key);
    
    if (!matchedKey) {
      return { valid: false, message: 'Key không hợp lệ!' };
    }
    
    const now = new Date();
    const expiryDate = new Date(matchedKey.expiry_date);
    
    if (expiryDate <= now) {
      return { valid: false, message: 'Key đã hết hạn!' };
    }
    
    if (!matchedKey.is_active) {
      return { valid: false, message: 'Key đã bị vô hiệu hóa!' };
    }
    
    return { 
      valid: true, 
      message: 'Key hợp lệ!',
      keyData: matchedKey
    };
  } catch (error) {
    console.error('Lỗi kiểm tra key:', error);
    // Trường hợp không kết nối được, sẽ kiểm tra key offline
    return { 
      valid: false, 
      offline: true,
      message: 'Không thể kết nối với máy chủ. Đang kiểm tra offline.' 
    };
  }
}
