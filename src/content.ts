import browser from "webextension-polyfill";

document.addEventListener("DOMContentLoaded", () => {
    const script = document.createElement("script");
    script.src = browser.runtime.getURL("dist/inject.js");
    script.onload = () => {
        script.remove();
        const event = new CustomEvent(
            "YouTubeWideVolumeSliderMutedIconUrlPassEvent",
            { detail: browser.runtime.getURL("images/muted_icon.svg") },
        );
        document.dispatchEvent(event);
    };
    document.documentElement.appendChild(script);
});
