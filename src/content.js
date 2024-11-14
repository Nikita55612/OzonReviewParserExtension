
if (window.location.href.includes("entrypoint-api.bx/page/json/v2?url=")) {
    const preElement = document.querySelector("pre");
    if (preElement) {
        const data = JSON.parse(preElement.textContent);
        console.log(window.location.href);
        chrome.runtime.sendMessage({ action: "widgetState", data: data, url: window.location.href }, (response) => {
            console.log(response);
            window.close();
        });
    }
}

if (window.location.href.includes("/product/") && !window.location.href.includes("entrypoint-api.bx/page/json/v2?url=")) {
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            const element = document.querySelector('div[data-widget="webReviewTabs"]');
            if (element) {
                const button = document.createElement("button");
                button.textContent = "Скачать отзывы";
                button.style.padding = "11px 20px";
                button.style.marginBottom = "12px"
                button.style.backgroundColor = "#005bff";
                button.style.color = "#fff";
                button.style.border = "none";
                button.style.borderRadius = "11px";
                button.style.cursor = "pointer";
                button.style.fontWeight = "400";
                button.style.fontFamily = "GTEestiPro, Arial, sans-serif";
                button.style.fontSize = "16px";
            
                element.prepend(button);
            
                button.addEventListener("click", () => {
                    const locationUrl = window.location.href;
                    const match = locationUrl.match(/\/product\/[^/]+-(\d+)\//);
                    const itemId = match ? match[1] : null;
                    const url = `https://www.ozon.ru/api/entrypoint-api.bx/page/json/v2?url=/product/${itemId}/reviews/?page=1&sort=published_at_desc`;
                    window.open(url, '_blank');
                });

                observer.disconnect();
                break;
            }
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}