import browser from "webextension-polyfill";
import {
    getSettingsOrDefault,
    RESPONSIVE_WIDTH_KEY,
    WIDTH_MULTIPLIER_INDEX_KEY,
} from "./common/extension-storage";
import {
    createInitParamsPassedEvent,
    createSettingsChangedEvent,
    MESSAGE_SETTINGS_UPDATED,
} from "./common/communication";

document.addEventListener("DOMContentLoaded", () => {
    const script = document.createElement("script");
    script.src = browser.runtime.getURL("dist/inject.js");
    script.onload = async () => {
        script.remove();

        const initialSettings = await getSettingsOrDefault();

        document.dispatchEvent(
            createInitParamsPassedEvent({
                widthMultipleIndex: initialSettings[
                    WIDTH_MULTIPLIER_INDEX_KEY
                ] as number,
                responsiveWidth: initialSettings[
                    RESPONSIVE_WIDTH_KEY
                ] as boolean,
                mutedIconUrl: browser.runtime.getURL("images/muted_icon.svg"),
            }),
        );
    };
    document.documentElement.appendChild(script);
});

browser.runtime.onMessage.addListener((message: any) => {
    if (message && message.name == MESSAGE_SETTINGS_UPDATED) {
        document.dispatchEvent(
            createSettingsChangedEvent({
                widthMultipleIndex: message.value[WIDTH_MULTIPLIER_INDEX_KEY],
                responsiveWidth: message.value[RESPONSIVE_WIDTH_KEY],
            }),
        );
    }
});
