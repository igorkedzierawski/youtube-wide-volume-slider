import browser from "webextension-polyfill";
import { InitialSettings } from "./types";
import {
    WIDTH_MULTIPLIER_INDEX_DEFAULT,
    WIDTH_MULTIPLIER_INDEX_KEY,
} from "./common/extension-storage";
import { MESSAGE_SETTINGS_UPDATED } from "./common/communication";

document.addEventListener("DOMContentLoaded", () => {
    const script = document.createElement("script");
    script.src = browser.runtime.getURL("dist/inject.js");
    script.onload = async () => {
        script.remove();
        const initialMultiple = Number(
            (
                await browser.storage.local.get({
                    [WIDTH_MULTIPLIER_INDEX_KEY]:
                        WIDTH_MULTIPLIER_INDEX_DEFAULT,
                })
            )[WIDTH_MULTIPLIER_INDEX_KEY],
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
    if (message && message.name == MESSAGE_SETTINGS_UPDATED) {
        const event = new CustomEvent(
            "YouTubeWideVolumeSliderWidthMultipleChangedEvent",
            { detail: message.value[WIDTH_MULTIPLIER_INDEX_KEY] },
        );
        document.dispatchEvent(event);
    }
});
