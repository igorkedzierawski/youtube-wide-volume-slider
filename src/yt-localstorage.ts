import { VolumeSettings } from "./types";

const YT_PLAYER_VOLUME_KEY = "yt-player-volume";

const EXPIRATION_PERIOD = 30 * 24 * 3600 * 1000;

const DEFAULT_UPDATE_PERIOD_MS = 160;

export interface YtLocalstorageUpdateScheduler {
    schedulePlayerVolumeUpdate(volume: number, muted: boolean): void;
}

export const CreateYtLocalstorageUpdateScheduler = (
    cooldown_ms?: number,
): YtLocalstorageUpdateScheduler => {
    if (!cooldown_ms) {
        cooldown_ms = DEFAULT_UPDATE_PERIOD_MS;
    }
    let playerVolumeUpdate = {
        scheduled: false,
        volume: 0,
        muted: false,
    };
    return {
        schedulePlayerVolumeUpdate(volume, muted) {
            playerVolumeUpdate.volume = volume;
            playerVolumeUpdate.muted = muted;
            if (playerVolumeUpdate.scheduled) {
                return;
            }
            playerVolumeUpdate.scheduled = true;
            setTimeout(() => {
                playerVolumeUpdate.scheduled = false;
                const now = Date.now();
                localStorage[YT_PLAYER_VOLUME_KEY] = JSON.stringify({
                    creation: now,
                    expiration: now + EXPIRATION_PERIOD,
                    data: JSON.stringify({
                        volume: playerVolumeUpdate.volume,
                        muted: playerVolumeUpdate.muted,
                    }),
                });
            }, cooldown_ms);
        },
    };
};

export const readYtLocalstorage = (): VolumeSettings | null => {
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
