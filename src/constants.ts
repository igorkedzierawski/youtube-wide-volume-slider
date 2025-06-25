export const YOUTUBE_DEFAULT_SLIDER_WIDTH_PX = 48;

export const AVAILABLE_SLIDER_MULTIPLES = [
    2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.5, 5, 5.5, 6,
];

export enum Messages {
    NOTIFY_CHANGE,
}

export const CURRENT_MULTIPLE = "game_settings";
/*
await browser.storage.local.set({
    [CURRENT_MULTIPLE]: settings,
});
let settings = (
    await browser.storage.local.get(GAME_SETTINGS_STORAGE_KEY)
)[GAME_SETTINGS_STORAGE_KEY];
*/
