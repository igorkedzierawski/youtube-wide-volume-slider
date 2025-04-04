import browser from "webextension-polyfill";

document.addEventListener("DOMContentLoaded", () => {
    const script = document.createElement("script");
    script.src = browser.runtime.getURL("dist/inject.js");
    script.onload = () => script.remove();
    document.documentElement.appendChild(script);
});
