export interface VolumeSliderElements {
    container: HTMLElement;
    muteToggle: {
        button: HTMLButtonElement;
        label: HTMLSpanElement;
        icon: HTMLImageElement;
    };
    slider: HTMLInputElement;
    style: HTMLStyleElement;
}

export const createVolumeSliderElements = (): VolumeSliderElements => {
    const container = document.createElement("youtube-wide-volume-slider");
    container.classList.add("ytp-volume-area");

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";

    const toggleButton = document.createElement("button");

    const toggleLabel = document.createElement("span");
    const toggleIcon = document.createElement("img");

    toggleButton.appendChild(toggleLabel);
    toggleButton.appendChild(toggleIcon);

    const style = document.createElement("style");
    style.textContent = `
        youtube-wide-volume-slider {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 8px 0 8px 0;
            padding: 0 16px !important;
            --ywvs-track-width: 180px;
            --ywvs-thumb-size: 16px;
            --ywvs-track-thickness: 5px;
            --ywvs-hitbox-padding: 6px;
            --ywvs-muted-icon-size: 20px;
        }

        youtube-wide-volume-slider input[type="range"] {
            width: var(--ywvs-track-width);
            margin-right: 4px;
            -webkit-appearance: none;
            appearance: none;
            background: transparent;

            /* increase clickable area */
            padding: var(--ywvs-hitbox-padding) 0;
            margin: calc(-1 * var(--ywvs-hitbox-padding)) 0;
            height: calc(var(--ywvs-track-thickness) + 2 * var(--ywvs-hitbox-padding));
            box-sizing: content-box;
        }

        /* Track */
        youtube-wide-volume-slider input[type="range"]::-webkit-slider-runnable-track {
            background: white !important;
            height: var(--ywvs-track-thickness);
            border-radius: calc(var(--ywvs-track-thickness) / 2);
        }

        youtube-wide-volume-slider input[type="range"]::-moz-range-track {
            background: white !important;
            height: var(--ywvs-track-thickness);
            border-radius: calc(var(--ywvs-track-thickness) / 2);
        }

        /* Thumb */
        youtube-wide-volume-slider input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: var(--ywvs-thumb-size);
            width: var(--ywvs-thumb-size);
            background: white !important;
            border-radius: 50%;
            margin-top: calc((var(--ywvs-track-thickness) - var(--ywvs-thumb-size)) / 2);
        }

        youtube-wide-volume-slider input[type="range"]::-moz-range-thumb {
            height: var(--ywvs-thumb-size);
            width: var(--ywvs-thumb-size);
            background: white !important;
            border-radius: 50%;
            border: none;
        }

        youtube-wide-volume-slider button {
            color: white;
            background-color: #0000;
            font-weight: bold;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        youtube-wide-volume-slider img {
            width: var(--ywvs-muted-icon-size);
            height: var(--ywvs-muted-icon-size);
        }
    `;

    container.appendChild(slider);
    container.appendChild(toggleButton);
    container.appendChild(style);

    return {
        container: container,
        muteToggle: {
            button: toggleButton,
            label: toggleLabel,
            icon: toggleIcon,
        },
        slider: slider,
        style: style,
    };
};
