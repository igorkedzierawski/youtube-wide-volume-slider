import browser from "webextension-polyfill";
import { DEFAULT_WIDTH_MULTIPLIER_INDEX } from "./slider-width";

export const WIDTH_MULTIPLIER_INDEX_KEY = "width_multiplier_index";
export const WIDTH_MULTIPLIER_INDEX_DEFAULT = DEFAULT_WIDTH_MULTIPLIER_INDEX;

export const RESPONSIVE_WIDTH_KEY = "reponsive_width";
export const RESPONSIVE_WIDTH_DEFAULT = true;

export async function getSettingsOrDefault() {
    const result = await browser.storage.local.get([
        WIDTH_MULTIPLIER_INDEX_KEY,
        RESPONSIVE_WIDTH_KEY,
    ]);

    let needUpdate = false;
    const settings: Record<string, number | boolean> = {};

    if (
        typeof result[WIDTH_MULTIPLIER_INDEX_KEY] !== "number" ||
        Number.isNaN(result[WIDTH_MULTIPLIER_INDEX_KEY])
    ) {
        settings[WIDTH_MULTIPLIER_INDEX_KEY] = WIDTH_MULTIPLIER_INDEX_DEFAULT;
        needUpdate = true;
    } else {
        settings[WIDTH_MULTIPLIER_INDEX_KEY] =
            result[WIDTH_MULTIPLIER_INDEX_KEY];
    }

    if (typeof result[RESPONSIVE_WIDTH_KEY] !== "boolean") {
        settings[RESPONSIVE_WIDTH_KEY] = RESPONSIVE_WIDTH_DEFAULT;
        needUpdate = true;
    } else {
        settings[RESPONSIVE_WIDTH_KEY] = result[RESPONSIVE_WIDTH_KEY];
    }

    if (needUpdate) {
        await browser.storage.local.set(settings);
    }

    return settings;
}
