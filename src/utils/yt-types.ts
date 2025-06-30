export interface YtVolumeSettings {
    volume: number;
    muted: boolean;
}

export interface YtVolumeController {
    getVolume(): number;
    setVolume(volume: number): void;
    isMuted(): boolean;
    mute(): void;
    unMute(): void;
}

export type YtMoviePlayer = YtVolumeController & Element;
