import browser from "webextension-polyfill";
import { CURRENT_MULTIPLE, Messages } from "./constants";
import { InitialSettings } from "./types";

document.addEventListener("DOMContentLoaded", () => {
    const script = document.createElement("script");
    script.src = browser.runtime.getURL("dist/inject.js");
    script.onload = async () => {
        script.remove();
        const initialMultiple = Number(
            (await browser.storage.local.get(CURRENT_MULTIPLE))[
                CURRENT_MULTIPLE
            ],
        );
        const event = new CustomEvent(
            "YouTubeWideVolumeSliderInitialSettingsPassEvent",
            {
                detail: JSON.stringify({
                    mutedIconUrl: browser.runtime.getURL(
                        "images/muted_icon.svg",
                    ),
                    initialWidthMultiple: initialMultiple,
                }),
            },
        );
        document.dispatchEvent(event);
    };
    document.documentElement.appendChild(script);
});
browser.runtime.onMessage.addListener((message: any) => {
    console.log(message);
    if (message && message.name == Messages.NOTIFY_CHANGE) {
        const event = new CustomEvent(
            "YouTubeWideVolumeSliderWidthMultipleChangedEvent",
            { detail: message.value },
        );
        document.dispatchEvent(event);
    }
});
