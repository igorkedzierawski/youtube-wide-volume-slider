import {
    InitialSettings,
    VolumeController,
    VolumeSettings,
    type MoviePlayer,
} from "./types";
import {
    querySelectorLocateAndObserve,
    querySelectorLocateOnce,
} from "./query-selector-locate";
import { createWideVolumeSliderComponent } from "./wide-volume-slider";
import {
    CreateYtLocalstorageUpdateScheduler as createYtLocalstorageUpdateScheduler,
    readYtLocalstorage,
} from "./yt-localstorage";
import {
    AVAILABLE_SLIDER_MULTIPLES,
    YOUTUBE_DEFAULT_SLIDER_WIDTH_PX,
} from "./constants";

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

const getInitialSettings = async (): Promise<InitialSettings> => {
    return await new Promise(resolve => {
        document.addEventListener(
            "YouTubeWideVolumeSliderInitialSettingsPassEvent",
            (e: any) => {
                console.log(e.detail);
                resolve(JSON.parse(e.detail));
            },
            { once: true },
        );
    });
};

let prefferedMulIndex: number = 0;
let currentMulIndex: number = -1;

(async () => {
    // wait for muted icon's url and initial width multiple
    const initialSettings = await getInitialSettings();

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
    const wideVolumeSlider = createWideVolumeSliderComponent(
        initialSettings.mutedIconUrl,
    );

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

    // after everything is setup, set slider's width to the value from initial settings
    const setWidthWithEverythingTakenCareOf = (preffIndex: number) => {
        console.log(
            `current: ${currentMulIndex}; preffered: ${prefferedMulIndex}; nextPreff: ${preffIndex}`,
        );
        prefferedMulIndex = preffIndex;
        if (currentMulIndex === -1) {
            currentMulIndex = preffIndex;
            wideVolumeSlider.setWidth(
                AVAILABLE_SLIDER_MULTIPLES[currentMulIndex] *
                    YOUTUBE_DEFAULT_SLIDER_WIDTH_PX,
            );
            setTimeout(() => {
                setWidthWithEverythingTakenCareOf(prefferedMulIndex);
            }, 3000);
            return;
        }
        const volumeAreaParentWidth =
            volumeAreaParent.getBoundingClientRect().width;
        const computedContentWidth = [...volumeAreaParent.children]
            .map(el => el.scrollWidth)
            .reduce((a, b) => a + b);
        const currentSliderWidth =
            AVAILABLE_SLIDER_MULTIPLES[currentMulIndex] *
            YOUTUBE_DEFAULT_SLIDER_WIDTH_PX;
        console.log(
            `vaParentW: ${volumeAreaParentWidth}; compCW: ${computedContentWidth}; currSliderW: ${currentSliderWidth}`,
        );
        let finalWidthIndx = prefferedMulIndex;
        do {
            console.log(
                `testing ${finalWidthIndx}===${AVAILABLE_SLIDER_MULTIPLES[finalWidthIndx]}`,
            );
            let prefferedSliderWidth =
                AVAILABLE_SLIDER_MULTIPLES[finalWidthIndx] *
                YOUTUBE_DEFAULT_SLIDER_WIDTH_PX;
            let computedPrefferedContentWidth =
                computedContentWidth -
                currentSliderWidth +
                prefferedSliderWidth;
            console.log(
                `prefferedSliderWidth: ${prefferedSliderWidth}; computedPrefferedContentWidth: ${computedPrefferedContentWidth}`,
            );
            if (computedPrefferedContentWidth < volumeAreaParentWidth) {
                console.log("Path1")
                currentMulIndex = finalWidthIndx;
                wideVolumeSlider.setWidth(
                    AVAILABLE_SLIDER_MULTIPLES[currentMulIndex] *
                        YOUTUBE_DEFAULT_SLIDER_WIDTH_PX,
                );
                return;
            } else {
                console.log("Path2")
                finalWidthIndx--;
            }
            if (finalWidthIndx < 0) {
                console.log("Path3")
                currentMulIndex = finalWidthIndx;
                wideVolumeSlider.setWidth(
                    AVAILABLE_SLIDER_MULTIPLES[finalWidthIndx] *
                        YOUTUBE_DEFAULT_SLIDER_WIDTH_PX,
                );
                return;
            }
        } while (1);
    };
    setWidthWithEverythingTakenCareOf(initialSettings.initialWidthMultiple);
    // prefferedMulIndex = initialSettings.initialWidthMultiple;
    // currentMulIndex = prefferedMulIndex;
    // wideVolumeSlider.setWidth(
    //     AVAILABLE_SLIDER_MULTIPLES[currentMulIndex] * YOUTUBE_DEFAULT_SLIDER_WIDTH_PX,
    // );
    // and listen for changes of those settings
    document.addEventListener(
        "YouTubeWideVolumeSliderWidthMultipleChangedEvent",
        (e: any) => {
            setWidthWithEverythingTakenCareOf(e.detail);
        },
    );

    new ResizeObserver(_ => {
        setWidthWithEverythingTakenCareOf(prefferedMulIndex);
        return;
        // const volumeAreaParentWidth =
        //     volumeAreaParent.getBoundingClientRect().width;
        // const computedContentWidth = [...volumeAreaParent.children]
        //     .map(el => el.scrollWidth)
        //     .reduce((a, b) => a + b);
        // [...volumeAreaParent.children].forEach(x => {
        //     console.log(JSON.stringify(x.getBoundingClientRect()));
        // });
        // const sliderBoxWidth = wideVolumeSlider
        //     .getElement()
        //     .getBoundingClientRect().width;
        // console.log(
        //     `Resized ${
        //         volumeAreaParent.getBoundingClientRect().width
        //     } ${computedContentWidth} ${sliderBoxWidth}`,
        // );
        // if (computedContentWidth > volumeAreaParentWidth) {
        //     const baseWidth = AVAILABLE_SLIDER_MULTIPLES[currentMulIndex] * YOUTUBE_DEFAULT_SLIDER_WIDTH_PX;
        //     for(let currentIndex = currentMulIndex; currentIndex >= 0; currentIndex--) {
        //         const widthForThatIndex = AVAILABLE_SLIDER_MULTIPLES[currentIndex] * YOUTUBE_DEFAULT_SLIDER_WIDTH_PX;
        //         if(computedContentWidth)
        //     }
        //     while(true) {

        //     }
        //     console.log("Zjadź lepszy size");
        // }
    }).observe(volumeAreaParent);
})();
