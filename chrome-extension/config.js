// config.js for Shimeji Extension
// Add any specific configuration logic here later if needed.
console.log("Config page loaded.");

document.addEventListener('DOMContentLoaded', () => {
  const goToDappButton = document.getElementById('go-to-dapp');
  if (goToDappButton) {
    goToDappButton.addEventListener('click', () => {
      const instructionHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Open DApp Page</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
            h1 { color: #333; }
            p { color: #555; }
            code { background-color: #eee; padding: 2px 4px; border-radius: 3px; }
            .highlight { color: #007bff; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Open Your Freighter Connector Page</h1>
          <p>For local development, please open the <span class="highlight"><code>index.html</code></span> file directly in your browser.</p>
          <p>You can find it in your extension's directory, typically at:</p>
          <p><span class="highlight"><code>/home/lulox/1-PROJECTS/chrome-extension/index.html</code></span></p>
          <p>Once opened, the page will allow you to connect your Freighter wallet.</p>
        </body>
        </html>
      `;
      chrome.tabs.create({ url: `data:text/html;charset=utf-8,${encodeURIComponent(instructionHtml)}` });
    });
  }
});
