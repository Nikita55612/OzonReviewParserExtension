document.getElementById('startParseButton').addEventListener('click', () => {
  const itemId = document.getElementById("item_id").value;
  if (!itemId) {
      showError('Введите ID товара');
      return;
  }
  const url = `https://www.ozon.ru/api/entrypoint-api.bx/page/json/v2?url=/product/${itemId}/reviews/?page=1&sort=published_at_desc`;
  chrome.tabs.create({ url });
});

// Обработка сообщений об ошибках от background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'ERROR') {
      showError(message.message);
  }
});

function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => {
      errorDiv.style.display = 'none';
  }, 3000);
}