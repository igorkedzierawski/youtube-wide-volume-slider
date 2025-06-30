import { VolumeSettings } from "../types";

const YT_PLAYER_VOLUME_KEY = "yt-player-volume";

const EXPIRATION_PERIOD = 30 * 24 * 3600 * 1000;

const DEFAULT_UPDATE_PERIOD_MS = 160;

export interface YtLocalStorageUpdateScheduler {
    schedulePlayerVolumeUpdate(volume: number, muted: boolean): void;
}

export class YtLocalStorageUpdateScheduler {

    private volume: number = 0;
    private muted: boolean = false;
    private timeout: NodeJS.Timeout | null = null;

    constructor(
        private readonly cooldownMs: number = DEFAULT_UPDATE_PERIOD_MS,
    ) {
        if (cooldownMs < 50) {
            throw new Error("cooldownMs must be at least 50ms");
        }
    }

    public schedulePlayerVolumeUpdate(volume: number, muted: boolean): void {
        this.volume = volume;
        this.muted = muted;

        if (this.timeout !== null) {
            return;
        }

        this.timeout = setTimeout((() => {
            this.timeout = null;
            const now = Date.now();
            localStorage[YT_PLAYER_VOLUME_KEY] = JSON.stringify({
                creation: now,
                expiration: now + EXPIRATION_PERIOD,
                data: JSON.stringify({
                    volume: this.volume,
                    muted: this.muted,
                }),
            });
        }).bind(this), this.cooldownMs);
    }
}

export const readVolumeSettingsFromLocalStorage = (): VolumeSettings | null => {
    try {
        const parsed = JSON.parse(localStorage[YT_PLAYER_VOLUME_KEY]);

        const data = parsed.data ? JSON.parse(parsed.data) : null;
        if (!data) {
            return null;
        }

        const parsedVolume = Number(data.volume);

        const isValidVolume =
            !isNaN(parsedVolume) &&
            Number.isInteger(parsedVolume) &&
            parsedVolume >= 0 &&
            parsedVolume <= 100;

        const isValidMuted = typeof data.muted === "boolean";

        if (isValidVolume && isValidMuted) {
            return { volume: parsedVolume, muted: data.muted };
        }
    } catch (ignored) {}
    return null;
};
