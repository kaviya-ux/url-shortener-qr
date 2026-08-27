// script.js
// Handles URL validation, calling the free shortening API, generating a QR
// code image for the result, and keeping a local history of past links.

// ELEMENTS
const urlInput = document.getElementById("urlInput");
const shortenBtn = document.getElementById("shortenBtn");
const errorMessage = document.getElementById("errorMessage");
const loadingState = document.getElementById("loadingState");
const resultBox = document.getElementById("resultBox");
const qrImage = document.getElementById("qrImage");
const shortUrlOutput = document.getElementById("shortUrlOutput");
const downloadQrLink = document.getElementById("downloadQrLink");
const historyList = document.getElementById("historyList");
const historyEmptyState = document.getElementById("historyEmptyState");

const HISTORY_KEY = "url-shortener-history";

// BUILD A QR CODE IMAGE URL FOR ANY TEXT/LINK
// Uses the free QR Server API (no API key required). This just loads an
// <img>, so it works purely by requesting an image and does not need CORS.
function buildQrUrl(data) {
    return "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(data);
}

// BASIC URL VALIDATION
function isValidUrl(value) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (error) {
        return false;
    }
}

// SHOW / HIDE HELPERS
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
}

function hideError() {
    errorMessage.classList.add("hidden");
    errorMessage.textContent = "";
}

function setLoading(isLoading) {
    if (isLoading) {
        loadingState.classList.remove("hidden");
        loadingState.classList.add("flex");
        shortenBtn.disabled = true;
    } else {
        loadingState.classList.add("hidden");
        loadingState.classList.remove("flex");
        shortenBtn.disabled = false;
    }
}

// CALL THE FREE CLEANURI SHORTENING API
// No signup or API key required. Returns { result_url: "..." } on success
// or { error: "..." } on failure.
async function shortenUrl(longUrl) {
    const response = await fetch("https://cleanuri.com/api/v1/shorten", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "url=" + encodeURIComponent(longUrl)
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error);
    }

    return data.result_url;
}

// MAIN BUTTON HANDLER
async function handleShorten() {
    hideError();

    const longUrl = urlInput.value.trim();

    if (!longUrl) {
        showError("Please enter a URL first.");
        return;
    }

    if (!isValidUrl(longUrl)) {
        showError("Please enter a valid URL, including http:// or https://");
        return;
    }

    setLoading(true);
    resultBox.classList.add("hidden");

    try {
        const shortUrl = await shortenUrl(longUrl);
        displayResult(longUrl, shortUrl);
        saveToHistory(longUrl, shortUrl);
        renderHistory();
    } catch (error) {
        showError(
            "Couldn't shorten that link right now (the free shortening service may be unavailable). Please try again in a moment."
        );
    } finally {
        setLoading(false);
    }
}

// DISPLAY THE RESULT CARD
function displayResult(longUrl, shortUrl) {
    shortUrlOutput.value = shortUrl;

    const qrUrl = buildQrUrl(shortUrl);
    qrImage.src = qrUrl;
    downloadQrLink.href = qrUrl;

    resultBox.classList.remove("hidden");
}

// COPY SHORT URL TO CLIPBOARD
function copyToClipboard() {
    shortUrlOutput.select();
    shortUrlOutput.setSelectionRange(0, 99999); // for mobile support

    navigator.clipboard.writeText(shortUrlOutput.value).catch(function () {
        // Fallback for browsers/contexts where the Clipboard API is blocked
        document.execCommand("copy");
    });
}

// LOCAL STORAGE HISTORY
function getHistory() {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
}

function saveToHistory(longUrl, shortUrl) {
    const history = getHistory();

    history.unshift({
        original: longUrl,
        shortened: shortUrl,
        createdAt: new Date().toISOString()
    });

    // keep the last 20 entries only
    const trimmed = history.slice(0, 20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

function renderHistory() {
    const history = getHistory();
    historyList.innerHTML = "";

    if (history.length === 0) {
        historyEmptyState.classList.remove("hidden");
        return;
    }

    historyEmptyState.classList.add("hidden");

    history.forEach(function (item, index) {
        const row = document.createElement("div");
        row.className = "flex items-center gap-3 border border-gray-200 rounded-lg p-3";

        row.innerHTML =
            '<img src="' + buildQrUrl(item.shortened) + '" alt="QR code" class="w-12 h-12 flex-shrink-0">' +
            '<div class="flex-1 min-w-0">' +
                '<p class="text-blue-600 font-medium truncate">' + item.shortened + '</p>' +
                '<p class="text-gray-400 text-xs truncate">' + item.original + '</p>' +
            '</div>' +
            '<button data-index="' + index + '" class="copy-history-btn text-sm text-green-600 hover:underline whitespace-nowrap">Copy</button>' +
            '<button data-index="' + index + '" class="delete-history-btn text-sm text-red-600 hover:underline whitespace-nowrap">Delete</button>';

        historyList.appendChild(row);
    });

    // wire up copy/delete buttons for this render pass
    historyList.querySelectorAll(".copy-history-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            const index = Number(button.getAttribute("data-index"));
            const item = getHistory()[index];
            if (item) {
                navigator.clipboard.writeText(item.shortened).catch(function () {});
            }
        });
    });

    historyList.querySelectorAll(".delete-history-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            const index = Number(button.getAttribute("data-index"));
            const history = getHistory();
            history.splice(index, 1);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
            renderHistory();
        });
    });
}

function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
}

// ALLOW PRESSING ENTER IN THE INPUT FIELD
urlInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        handleShorten();
    }
});

// INITIAL LOAD
renderHistory();
