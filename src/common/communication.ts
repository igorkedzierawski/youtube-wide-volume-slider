export const MESSAGE_SETTINGS_UPDATED = "SETTINGS_UPDATED";

export const INIT_PARAMS_PASSED_EVENT =
    "YouTubeWideVolumeSliderInitParamsPassedEvent";
export interface InitParamsPassedEvent {
    mutedIconUrl: string;
    widthMultipleIndex: number;
    responsiveWidth: boolean;
}
export const createInitParamsPassedEvent = (
    params: InitParamsPassedEvent,
): CustomEvent => {
    return new CustomEvent(INIT_PARAMS_PASSED_EVENT, {
        detail: JSON.stringify(params),
    });
};

export const SETTINGS_CHANGED_EVENT =
    "YouTubeWideVolumeSliderSettingsChangedEvent";
export interface SettingsChangedEvent {
    widthMultipleIndex: number;
    responsiveWidth: boolean;
}
export const createSettingsChangedEvent = (
    settings: SettingsChangedEvent,
): CustomEvent => {
    return new CustomEvent(SETTINGS_CHANGED_EVENT, {
        detail: JSON.stringify(settings),
    });
};
