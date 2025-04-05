import type { VolumeSettings } from "./types";

const createWideVolumeSliderElement = (): HTMLElement => {
    const container = document.createElement("div");
    container.id = "youtube-wide-volume-slider-container";

    const input = document.createElement("input");
    input.className = "custom-slider";
    input.type = "range";
    input.min = "0";
    input.max = "100";

    const button = document.createElement("button");

    const style = document.createElement("style");
    style.textContent = `
        #youtube-wide-volume-slider-container {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 8px;
        }
        #youtube-wide-volume-slider-container input {
            width: 180px;
            margin-right: 4px;
        }
        #youtube-wide-volume-slider-container button {
            color: white;
            background-color: #0000;
            font-weight: bold;
            border: none;
            cursor: pointer;
        }
    `;

    container.appendChild(input);
    container.appendChild(button);
    document.head.appendChild(style);

    return container;
};

export interface WideVolumeSliderComponent {
    setSettingsChangeHandler(handler: (settings: VolumeSettings) => void): void;
    setSettings(newSettings: VolumeSettings): void;
    getElement(): Element;
}

export const createWideVolumeSliderComponent =
    (): WideVolumeSliderComponent => {
        let settings: VolumeSettings = {
            volume: 0,
            muted: false,
        };
        let settingsChangeHandler:
            | ((settings: VolumeSettings) => void)
            | undefined;

        const container = createWideVolumeSliderElement();
        const button = container.querySelector("BUTTON")! as HTMLButtonElement;
        const slider = container.querySelector("INPUT")! as HTMLInputElement;

        button.addEventListener("click", () => {
            settings.muted = !settings.muted;
            settingsChangeHandler && settingsChangeHandler({ ...settings });
            button.innerText = settings.muted ? "Muted" : `${settings.volume}%`;
        });

        slider.addEventListener("input", () => {
            settings.muted = false;
            settings.volume = parseInt(slider.value);
            settingsChangeHandler && settingsChangeHandler({ ...settings });
            button.innerText = settings.muted ? "Muted" : `${settings.volume}%`;
        });

        return {
            setSettingsChangeHandler: (
                handler: (settings: VolumeSettings) => void,
            ) => {
                settingsChangeHandler = handler;
            },
            setSettings: (newSettings: VolumeSettings) => {
                settings = { ...newSettings };
                slider.value = `${settings.volume}`;
                button.innerText = settings.muted
                    ? "Muted"
                    : `${settings.volume}%`;
            },
            getElement: () => {
                return container;
            },
        };
    };
