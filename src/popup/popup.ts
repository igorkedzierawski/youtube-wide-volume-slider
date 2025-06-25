import browser from "webextension-polyfill";

import {
    AVAILABLE_SLIDER_MULTIPLES,
    CURRENT_MULTIPLE,
    Messages,
    YOUTUBE_DEFAULT_SLIDER_WIDTH_PX,
} from "../constants";

interface PopupInitElems {
    WIDTH_SELECTOR: HTMLInputElement;
    WIDTH_TITLE: HTMLSpanElement;
    WIDTH_DISPLAY: HTMLSpanElement;
}

const init = (elems: PopupInitElems) => {
    elems.WIDTH_TITLE.innerText = "Szerokość suwaka:";

    elems.WIDTH_SELECTOR.min = "0";
    elems.WIDTH_SELECTOR.max = "" + (AVAILABLE_SLIDER_MULTIPLES.length - 1);

    elems.WIDTH_SELECTOR.oninput = async () => {
        const selectedMultipleIndex = Number(elems.WIDTH_SELECTOR.value);
        const selectedMultiple =
            AVAILABLE_SLIDER_MULTIPLES[selectedMultipleIndex];
        elems.WIDTH_DISPLAY.innerText = "x" + selectedMultiple;
        await browser.storage.local.set({
            [CURRENT_MULTIPLE]: selectedMultipleIndex,
        });
        (await browser.tabs.query({})).forEach(async tab => {
            await browser.tabs.sendMessage(tab.id!, {
                name: Messages.NOTIFY_CHANGE,
                value: selectedMultipleIndex
            });
        })
    };
};

init({
    WIDTH_SELECTOR: document.getElementById(
        "width_selector",
    )! as HTMLInputElement,
    WIDTH_TITLE: document.getElementById("width_title")!,
    WIDTH_DISPLAY: document.getElementById("width_display")!,
});
