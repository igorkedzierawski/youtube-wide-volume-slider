export interface VolumeSettings {
    volume: number;
    muted: boolean;
}

export interface VolumeController {
    getVolume(): number;
    setVolume(volume: number): void;
    isMuted(): boolean;
    mute(): void;
    unMute(): void;
}

export type MoviePlayer = VolumeController & Element;