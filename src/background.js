let pageKey;
let totalReviews;
let reviews = [];

try {
  importScripts('xlsx.full.min.js');
} catch (e) {
  console.error('Failed to load XLSX library:', e);
}

function parseData(objState) {
  if (!objState?.reviews) return;
  
  objState.reviews.forEach((r) => {
    try {
      const review = {
        createdAt: new Date((r.createdAt || 0) * 1000).toISOString(),
        itemId: r.itemId || null,
        author: r?.author?.firstName || null,
        authorId: r?.author?.id || null,
        status: r?.status?.name || null,
        score: r?.content?.score || null,
        comment: r?.content?.comment || null,
        positive: r?.content?.positive || null,
        negative: r?.content?.negative || null,
        contextQuestions: JSON.stringify(r?.content?.contextQuestions || null),
        videos: r?.content?.videos?.length || 0,
        photos: r?.content?.photos?.length || 0,
        comments: JSON.stringify(r?.comments?.list || null)
      };
      reviews.push(review);
    } catch (error) {
      console.error('Error parsing review:', error);
    }
  });
}

function openReviewsWindow() {
  chrome.tabs.create({ url: "reviews.html" }, () => {
    chrome.storage.local.set({ reviewData: reviews.slice(0, totalReviews - 1) });
  });
}

function getWebListReviews(widgetStates) {
  if (!widgetStates) return null;
  
  const reviewWidget = Object.entries(widgetStates)
    .find(([key]) => key.includes('webListReviews-'));
    
  if (!reviewWidget) return null;
  
  try {
    return JSON.parse(reviewWidget[1]);
  } catch (error) {
    console.error('Error parsing widget state:', error);
    return null;
  }
}

function exportToExcel(data, productId) {
  try {
    if (typeof XLSX === 'undefined') {
      throw new Error('XLSX library not loaded');
    }

    // Создаем и настраиваем лист
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Устанавливаем ширину колонок
    const maxWidth = 12;
    const cols = Object.keys(data[0] || {}).map(() => ({ wch: maxWidth }));
    worksheet['!cols'] = cols;

    // Создаем книгу и добавляем лист
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reviews");

    // Генерируем имя файла с датой
    const date = new Date().toISOString().split('T')[0];
    const filename = `ozon_reviews_${productId}_${date}.xlsx`;

    // Конвертируем в base64
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "base64" });
    
    // Создаем Data URL
    const dataUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelBuffer}`;
    
    // Скачиваем файл
    chrome.downloads.download({
      url: dataUrl,
      filename: filename,
      saveAs: true
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('Download failed:', chrome.runtime.lastError);
        // Отправляем сообщение об ошибке на popup
        chrome.runtime.sendMessage({
          type: 'ERROR',
          message: 'Ошибка при сохранении файла'
        });
      } else {
        console.log('File downloaded successfully');
      }
    });
    
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    // Отправляем сообщение об ошибке на popup
    chrome.runtime.sendMessage({
      type: 'ERROR',
      message: 'Ошибка при экспорте в Excel'
    });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("Расширение установлено успешно!");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "widgetState") {
    try {
      const currentUrl = new URL(message.url.split("?url=")[1], "https://example.com");
      const pageNum = parseInt(currentUrl.searchParams.get("page")) || 1;
      const productId = currentUrl.pathname.split("/")[2];

      const widgetStates = message.data?.widgetStates;
      const objState = getWebListReviews(widgetStates);

      if (!objState) {
        throw new Error('Failed to get widget state');
      }

      if (pageNum === 1) {
        const url = new URL(message.data.nextPage, "https://example.com");
        pageKey = url.searchParams.get("page_key");
        totalReviews = objState.paging?.commonTotal || 0;
        reviews = [];
      }

      parseData(objState);
      sendResponse({ success: true, reviewsCount: reviews.length });

      if (pageNum * 30 < totalReviews) {
        const nextUrl = `https://www.ozon.ru/api/entrypoint-api.bx/page/json/v2?url=/product/${productId}/reviews/?page=${pageNum + 1}&page_key=${pageKey}&sort=published_at_desc`;
        chrome.tabs.create({ url: nextUrl });
      } else {
        openReviewsWindow();
        exportToExcel(reviews.slice(0, totalReviews - 1), productId);
      }
      
    } catch (error) {
      openReviewsWindow();
      exportToExcel(reviews.slice(0, totalReviews - 1), "-");
      sendResponse({ success: false, error: "ERROR" });
      chrome.runtime.sendMessage({
        type: 'ERROR',
        message: error.message
      });
    }
    return true;
  }
});