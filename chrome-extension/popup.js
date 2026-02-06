document.addEventListener("DOMContentLoaded", () => {
  const sizeButtons = document.querySelectorAll(".size-btn");
  const pageToggle = document.getElementById("page-toggle");
  const pageToggleRow = document.getElementById("page-toggle-row");
  const enableAllBtn = document.getElementById("enable-all-btn");
  const disableAllBtn = document.getElementById("disable-all-btn");
  const globalStatus = document.getElementById("global-status");
  let currentPageKey = null;

  // Update size selection UI
  function updateSizeSelectionUI(selectedSize) {
    sizeButtons.forEach((button) => {
      if (button.dataset.size === selectedSize) {
        button.classList.add("selected");
      } else {
        button.classList.remove("selected");
      }
    });
  }

  function normalizePageUrl(url) {
    try {
      const parsed = new URL(url);
      parsed.hash = "";
      return parsed.toString();
    } catch (error) {
      return url;
    }
  }

  function updateVisibilityUI(disabledAll, disabledPages) {
    const pageDisabled = currentPageKey && disabledPages.includes(currentPageKey);

    // Update page toggle
    if (pageToggle) {
      // Checked means enabled (not in disabled list)
      pageToggle.checked = !pageDisabled;
      pageToggle.disabled = !!disabledAll || !currentPageKey;
    }

    // Update toggle row disabled state
    if (pageToggleRow) {
      pageToggleRow.classList.toggle("disabled", !!disabledAll || !currentPageKey);
    }

    // Update global buttons
    if (enableAllBtn) {
      enableAllBtn.classList.toggle("active", !disabledAll);
    }
    if (disableAllBtn) {
      disableAllBtn.classList.toggle("active", !!disabledAll);
    }

    // Update status message
    if (globalStatus) {
      if (disabledAll) {
        globalStatus.textContent = "Shimeji is disabled on all pages";
        globalStatus.classList.add("warning");
      } else if (pageDisabled) {
        globalStatus.textContent = "Disabled on this page (remembered)";
        globalStatus.classList.remove("warning");
      } else {
        globalStatus.textContent = "";
        globalStatus.classList.remove("warning");
      }
    }
  }

  function loadVisibilityState() {
    chrome.storage.sync.get(["disabledAll", "disabledPages"], (data) => {
      const disabledPages = Array.isArray(data.disabledPages) ? data.disabledPages : [];
      updateVisibilityUI(!!data.disabledAll, disabledPages);
    });
  }

  // Initial load from storage
  chrome.storage.sync.get(["size"], (data) => {
    updateSizeSelectionUI(data.size || "medium");
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabUrl = tabs[0]?.url || "";
    if (tabUrl.startsWith("http")) {
      currentPageKey = normalizePageUrl(tabUrl);
    }
    loadVisibilityState();
  });

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "sync") {
      if (changes.size) {
        updateSizeSelectionUI(changes.size.newValue);
      }
      if (changes.disabledAll || changes.disabledPages) {
        const disabledAll = changes.disabledAll ? changes.disabledAll.newValue : undefined;
        const disabledPages = changes.disabledPages ? changes.disabledPages.newValue : undefined;
        chrome.storage.sync.get(["disabledAll", "disabledPages"], (data) => {
          const resolvedDisabledAll = disabledAll !== undefined ? disabledAll : data.disabledAll;
          const resolvedDisabledPages = Array.isArray(disabledPages)
            ? disabledPages
            : Array.isArray(data.disabledPages)
              ? data.disabledPages
              : [];
          updateVisibilityUI(!!resolvedDisabledAll, resolvedDisabledPages);
        });
      }
    }
  });

  // Size buttons
  sizeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const size = button.dataset.size;
      chrome.storage.sync.set({ size }, () => {
        updateSizeSelectionUI(size);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "updateSize", size });
          }
        });
      });
    });
  });

  // Page toggle (checkbox)
  if (pageToggle) {
    pageToggle.addEventListener("change", () => {
      if (!currentPageKey) return;

      chrome.storage.sync.get(["disabledPages", "disabledAll"], (data) => {
        if (data.disabledAll) return; // Don't allow changes when globally disabled

        const disabledPages = Array.isArray(data.disabledPages) ? data.disabledPages : [];
        const pageIndex = disabledPages.indexOf(currentPageKey);

        if (pageToggle.checked) {
          // Enable on this page (remove from disabled list)
          if (pageIndex >= 0) {
            disabledPages.splice(pageIndex, 1);
          }
        } else {
          // Disable on this page (add to disabled list)
          if (pageIndex < 0) {
            disabledPages.push(currentPageKey);
          }
        }

        chrome.storage.sync.set({ disabledPages }, () => {
          updateVisibilityUI(!!data.disabledAll, disabledPages);
        });
      });
    });
  }

  // Enable All button
  if (enableAllBtn) {
    enableAllBtn.addEventListener("click", () => {
      chrome.storage.sync.get(["disabledPages"], (data) => {
        const disabledPages = Array.isArray(data.disabledPages) ? data.disabledPages : [];
        chrome.storage.sync.set({ disabledAll: false }, () => {
          updateVisibilityUI(false, disabledPages);
        });
      });
    });
  }

  // Disable All button
  if (disableAllBtn) {
    disableAllBtn.addEventListener("click", () => {
      chrome.storage.sync.get(["disabledPages"], (data) => {
        const disabledPages = Array.isArray(data.disabledPages) ? data.disabledPages : [];
        chrome.storage.sync.set({ disabledAll: true }, () => {
          updateVisibilityUI(true, disabledPages);
        });
      });
    });
  }
});
