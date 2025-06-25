import type { VolumeSettings } from "./types";

const createWideVolumeSliderElement = (mutedIconUrl: string): HTMLElement => {
    const container = document.createElement("div");
    container.id = "youtube-wide-volume-slider-container";

    const input = document.createElement("input");
    input.className = "custom-slider";
    input.type = "range";
    input.min = "0";
    input.max = "100";

    const buttonLabel = document.createElement("span");

    const buttonMutedIcon = document.createElement("img");
    buttonMutedIcon.setAttribute("src", mutedIconUrl)

    const button = document.createElement("button");
    button.appendChild(buttonLabel);
    button.appendChild(buttonMutedIcon);

    document.addEventListener('LMFAOEVENT', (e: any) => {
        console.log(e.detail);
        console.log(e.detail);
        console.log(e.detail);
        console.log(e.detail);
    }, {once: true});

    const style = document.createElement("style");
    style.textContent = `
        #youtube-wide-volume-slider-container {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 8px 0 8px 0;
            padding: 0 8px 0 8px;
            --track-width: 180px;
            --thumb-size: 16px;
            --track-thickness: 5px;
            --hitbox-padding: 6px;
            --muted-icon-size: 20px;
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
            display: flex;
            align-items: center;
            justify-content: center;
        }

        #youtube-wide-volume-slider-container img {
            width: var(--muted-icon-size);
            height: var(--muted-icon-size);
        }
    `;

    container.appendChild(input);
    container.appendChild(button);
    container.appendChild(style);

    return container;
};

export interface WideVolumeSliderComponent {
    setSettingsChangeHandler(handler: (settings: VolumeSettings) => void): void;
    setSettings(newSettings: VolumeSettings): void;
    setWidth(widthPx: number): void;
    getElement(): Element;
}

export const createWideVolumeSliderComponent = (
    mutedIconUrl: string,
): WideVolumeSliderComponent => {
        let settings: VolumeSettings = {
            volume: 0,
            muted: false,
        };
        let settingsChangeHandler:
            | ((settings: VolumeSettings) => void)
            | undefined;

        const container = createWideVolumeSliderElement(mutedIconUrl);
        const button = container.querySelector("BUTTON")! as HTMLButtonElement;
        const slider = container.querySelector("INPUT")! as HTMLInputElement;
        const buttonLabel = container.querySelector("SPAN")! as HTMLElement;
        const buttonMutedIcon = container.querySelector("IMG")! as HTMLElement;
        const style = container.querySelector("STYLE")! as HTMLElement;

        const updateButtonContent = (settings: VolumeSettings) => {
            if(settings.muted) {
                buttonLabel.style.display = "none";
                buttonMutedIcon.style.display = "";
            } else {
                buttonMutedIcon.style.display = "none";
                buttonLabel.style.display = "";
                buttonLabel.innerText = `${settings.volume}%`;
            }
        }

        button.addEventListener("click", () => {
            settings.muted = !settings.muted;
            settingsChangeHandler && settingsChangeHandler({ ...settings });
            updateButtonContent(settings);
        });

        slider.addEventListener("input", () => {
            settings.muted = false;
            settings.volume = parseInt(slider.value);
            settingsChangeHandler && settingsChangeHandler({ ...settings });
            updateButtonContent(settings);
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
                updateButtonContent(settings);
            },
            setWidth: (widthPx: number) => {
                style.innerHTML = style.innerHTML.replace(/--track-width:\s*[^px]*px/, `--track-width: ${widthPx}px`);
            },
            getElement: () => {
                return container;
            },
        };
    };
