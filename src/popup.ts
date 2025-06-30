import browser from "webextension-polyfill";
import { AVAILABLE_WIDTH_MULTIPLIERS } from "./common/slider-width";
import {
    RESPONSIVE_WIDTH_DEFAULT,
    RESPONSIVE_WIDTH_KEY,
    WIDTH_MULTIPLIER_INDEX_DEFAULT,
    WIDTH_MULTIPLIER_INDEX_KEY,
} from "./common/extension-storage";
import { MESSAGE_SETTINGS_UPDATED } from "./common/communication";
import {
    MSG_RESPONSIVE_WIDTH_LABEL,
    MSG_SLIDER_WIDTH_LABEL,
} from "./common/messages";

interface PopupElements {
    widthMultiplier: {
        title: HTMLSpanElement;
        display: HTMLSpanElement;
        input: HTMLInputElement;
    };
    responsiveWidth: {
        title: HTMLSpanElement;
        input: HTMLInputElement;
    };
}

const init = async (elements: PopupElements) => {
    const initialSettings = await browser.storage.local.get({
        [WIDTH_MULTIPLIER_INDEX_KEY]: WIDTH_MULTIPLIER_INDEX_DEFAULT,
        [RESPONSIVE_WIDTH_KEY]: RESPONSIVE_WIDTH_DEFAULT,
    });

    let widthMultiplierIndex = initialSettings[
        WIDTH_MULTIPLIER_INDEX_KEY
    ] as number;
    let responsiveWidth = initialSettings[RESPONSIVE_WIDTH_KEY] as boolean;

    const persistAndBroadcastSettings = () => {
        const settings = {
            [WIDTH_MULTIPLIER_INDEX_KEY]: widthMultiplierIndex,
            [RESPONSIVE_WIDTH_KEY]: responsiveWidth,
        };

        browser.storage.local.set(settings);

        browser.tabs.query({}).then(tabs => {
            const message = {
                name: MESSAGE_SETTINGS_UPDATED,
                value: settings,
            };
            tabs.forEach(tab => browser.tabs.sendMessage(tab.id!, message));
        });
    };

    // width multiplier selection section
    elements.widthMultiplier.title.innerText = browser.i18n.getMessage(
        MSG_SLIDER_WIDTH_LABEL,
    );
    elements.widthMultiplier.input.min = "0";
    elements.widthMultiplier.input.max = `${
        AVAILABLE_WIDTH_MULTIPLIERS.length - 1
    }`;
    elements.widthMultiplier.input.value = `${widthMultiplierIndex}`;

    elements.widthMultiplier.display.innerText =
        "x" + AVAILABLE_WIDTH_MULTIPLIERS[widthMultiplierIndex];

    elements.widthMultiplier.input.oninput = async () => {
        widthMultiplierIndex = Number(elements.widthMultiplier.input.value);
        elements.widthMultiplier.display.innerText =
            "x" + AVAILABLE_WIDTH_MULTIPLIERS[widthMultiplierIndex];
        persistAndBroadcastSettings();
    };

    // responsive width selection section
    elements.responsiveWidth.title.innerText = browser.i18n.getMessage(
        MSG_RESPONSIVE_WIDTH_LABEL,
    );

    elements.responsiveWidth.input.checked = responsiveWidth;

    elements.responsiveWidth.input.oninput = () => {
        responsiveWidth = elements.responsiveWidth.input.checked;
        persistAndBroadcastSettings();
    };
};

init({
    widthMultiplier: {
        title: document.getElementById("width_multiplier_title")!,
        display: document.getElementById("width_multiplier_display")!,
        input: document.getElementById(
            "width_multiplier_input",
        )! as HTMLInputElement,
    },
    responsiveWidth: {
        title: document.getElementById("responsive_width_title")!,
        input: document.getElementById(
            "responsive_width_input",
        )! as HTMLInputElement,
    },
});
