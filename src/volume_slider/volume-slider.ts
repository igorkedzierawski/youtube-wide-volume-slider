import { VolumeSettings } from "../types";
import { createVolumeSliderElements } from "./volume-slider-elements";

export interface VolumeSliderComponent {
    onSettingsChange(handler: (settings: VolumeSettings) => void): void;
    updateSettings(newSettings: VolumeSettings): void;
    setSliderWidth(widthPx: number): void;
    getRootElement(): HTMLElement;
}

export const createVolumeSliderComponent = (
    mutedIconUrl: string,
): VolumeSliderComponent => {
    let settings: VolumeSettings = {
        volume: 0,
        muted: false,
    };
    let settingsChangeHandler: ((settings: VolumeSettings) => void) | undefined;

    const elements = createVolumeSliderElements();

    elements.muteToggle.icon.src = mutedIconUrl;

    const updateButtonContent = (settings: VolumeSettings) => {
        if (settings.muted) {
            elements.muteToggle.label.style.display = "none";
            elements.muteToggle.icon.style.display = "";
        } else {
            elements.muteToggle.icon.style.display = "none";
            elements.muteToggle.label.style.display = "";
            elements.muteToggle.label.innerText = `${settings.volume}%`;
        }
    };

    elements.muteToggle.button.addEventListener("click", () => {
        settings.muted = !settings.muted;
        settingsChangeHandler && settingsChangeHandler({ ...settings });
        updateButtonContent(settings);
    });

    elements.slider.addEventListener("input", () => {
        settings.muted = false;
        settings.volume = parseInt(elements.slider.value);
        settingsChangeHandler && settingsChangeHandler({ ...settings });
        updateButtonContent(settings);
    });

    return {
        onSettingsChange: (handler: (settings: VolumeSettings) => void) => {
            settingsChangeHandler = handler;
        },
        updateSettings: (newSettings: VolumeSettings) => {
            settings = { ...newSettings };
            elements.slider.value = `${settings.volume}`;
            updateButtonContent(settings);
        },
        setSliderWidth: (widthPx: number) => {
            elements.slider.style.setProperty(
                "--ywvs-track-width",
                `${widthPx}px`,
            );
        },
        getRootElement: () => {
            return elements.container;
        },
    };
};
