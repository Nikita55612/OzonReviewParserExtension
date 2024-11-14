const preElement = document.querySelector("pre");
if (preElement) {
    const data = JSON.parse(preElement.textContent);
    console.log(window.location.href);
    chrome.runtime.sendMessage({ action: "widgetState", data: data, url: window.location.href }, (response) => {
        console.log(response);
        window.close();
    });
}