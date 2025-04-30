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
            --track-width: 180px;
            --thumb-size: 16px;
            --track-thickness: 5px;
            --hitbox-padding: 6px;
        }

        #youtube-wide-volume-slider-container input[type="range"] {
            width: var(--track-width);
            margin-right: 4px;
            -webkit-appearance: none;
            appearance: none;
            background: transparent;

            /* increase clickable area */
            padding: var(--hitbox-padding) 0;
            margin: calc(-1 * var(--hitbox-padding)) 0;
            height: calc(var(--track-thickness) + 2 * var(--hitbox-padding));
            box-sizing: content-box;
        }

        /* Track */
        #youtube-wide-volume-slider-container input[type="range"]::-webkit-slider-runnable-track {
            background: white !important;
            height: var(--track-thickness);
            border-radius: calc(var(--track-thickness) / 2);
        }

        #youtube-wide-volume-slider-container input[type="range"]::-moz-range-track {
            background: white !important;
            height: var(--track-thickness);
            border-radius: calc(var(--track-thickness) / 2);
        }

        /* Thumb */
        #youtube-wide-volume-slider-container input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: var(--thumb-size);
            width: var(--thumb-size);
            background: white !important;
            border-radius: 50%;
            margin-top: calc((var(--track-thickness) - var(--thumb-size)) / 2);
        }

        #youtube-wide-volume-slider-container input[type="range"]::-moz-range-thumb {
            height: var(--thumb-size);
            width: var(--thumb-size);
            background: white !important;
            border-radius: 50%;
            border: none;
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
