import { VolumeController, VolumeSettings, type MoviePlayer } from "./types";
import {
    querySelectorLocateAndObserve,
    querySelectorLocateOnce,
} from "./query-selector-locate";
import { createWideVolumeSliderComponent } from "./wide-volume-slider";
import {
    CreateYtLocalstorageUpdateScheduler as createYtLocalstorageUpdateScheduler,
    readYtLocalstorage,
} from "./yt-localstorage";

// Locate movie player element within DOM
const locateMoviePlayerElement = async (): Promise<Element> => {
    const MOVIE_PLAYER_SELECTOR = "#movie_player";
    return querySelectorLocateOnce(document.body, MOVIE_PLAYER_SELECTOR);
};

// Locate volume slider container element within movie player
const locateVolumeArea = async (
    moviePlayerElement: Element,
): Promise<Element> => {
    const VOLUME_AREA_SELECTOR = ".ytp-left-controls .ytp-volume-area";
    return querySelectorLocateOnce(moviePlayerElement, VOLUME_AREA_SELECTOR);
};

// Observe changes for video elements and volume levels within those elements inside movie player
const monitorInternalVolume = (
    moviePlayerElement: Element,
    internalVolumeChangeHandler: () => void,
): void => {
    let prevVideo: Element | undefined = undefined;
    const VIDEO_SELECTOR = "VIDEO";
    querySelectorLocateAndObserve(moviePlayerElement, VIDEO_SELECTOR, elem => {
        prevVideo &&
            prevVideo.removeEventListener(
                "volumechange",
                internalVolumeChangeHandler,
            );
        elem.addEventListener("volumechange", internalVolumeChangeHandler);
        prevVideo = elem;
        internalVolumeChangeHandler();
    });
};

(async () => {
    // locate key elements within DOM
    const moviePlayerElement =
        (await locateMoviePlayerElement()) as MoviePlayer;
    const volumeArea = await locateVolumeArea(moviePlayerElement);

    const volumeAreaParent = volumeArea.parentElement;
    if (!volumeAreaParent) {
        throw new Error("Could not find volume area parent");
    }

    const volumeController: VolumeController = moviePlayerElement;

    // create volume slider component and a hook to youtube's localstorage
    const wideVolumeSlider = createWideVolumeSliderComponent();

    const ytLocalstorageUpdator = createYtLocalstorageUpdateScheduler();

    // handler function that gets called every time user interacts with the
    // slider created by this extension. with passed volume settings we update
    // the state of the movie player and also youtube's localstorage.
    const volumeSettingsChangeHandler = (settings: VolumeSettings) => {
        if (settings.muted) volumeController.mute();
        else volumeController.unMute();
        volumeController.setVolume(settings.volume);
        ytLocalstorageUpdator.schedulePlayerVolumeUpdate(
            settings.volume,
            settings.muted,
        );
    };
    wideVolumeSlider.setSettingsChangeHandler(volumeSettingsChangeHandler);

    // whenever movie player volume settings are externally updated, we
    // also update the state of the volume slider created by this extension  
    monitorInternalVolume(moviePlayerElement, () => {
        wideVolumeSlider.setSettings({
            volume: volumeController.getVolume(),
            muted: volumeController.isMuted(),
        });
    });

    // replace volume slider
    volumeAreaParent.insertBefore(wideVolumeSlider.getElement(), volumeArea);
    volumeAreaParent.removeChild(volumeArea);

    // synchronize volume settings with youtube's localstorage (or default)
    const initialVolumeSettings: VolumeSettings = readYtLocalstorage() || {
        volume: 10,
        muted: false,
    };
    wideVolumeSlider.setSettings(initialVolumeSettings);
    volumeSettingsChangeHandler(initialVolumeSettings);
})();
