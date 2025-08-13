import {
    INIT_PARAMS_PASSED_EVENT,
    InitParamsPassedEvent,
    SETTINGS_CHANGED_EVENT,
    SettingsChangedEvent,
} from "./common/communication";
import {
    AVAILABLE_WIDTH_MULTIPLIERS,
    YT_DEFAULT_SLIDER_WIDTH_PX,
} from "./common/slider-width";
import {
    YtVolumeController,
    YtVolumeSettings,
    type YtMoviePlayer,
} from "./utils/yt-types";
import {
    querySelectorLocateAndObserve,
    querySelectorLocateOnce,
} from "./utils/query-selector-locate";
import {
    readVolumeSettingsFromLocalStorage,
    YtLocalStorageUpdateScheduler,
} from "./utils/yt-local-storage";
import { createVolumeSliderComponent } from "./volume_slider/volume-slider";

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

const getInitParams = async (): Promise<InitParamsPassedEvent> => {
    return await new Promise(resolve => {
        document.addEventListener(
            INIT_PARAMS_PASSED_EVENT,
            (e: any) => resolve(JSON.parse(e.detail)),
            { once: true },
        );
    });
};

(async () => {
    // wait for muted icon's url and initial width multiple
    const initParams = await getInitParams();

    // locate key elements within DOM
    const moviePlayerElement =
        (await locateMoviePlayerElement()) as YtMoviePlayer;
    const volumeArea = await locateVolumeArea(moviePlayerElement);

    const volumeAreaParent = volumeArea.parentElement;
    if (!volumeAreaParent) {
        throw new Error("Could not find volume area parent");
    }

    const volumeController: YtVolumeController = moviePlayerElement;

    // create volume slider component and a hook to youtube's localstorage
    const wideVolumeSlider = createVolumeSliderComponent(
        initParams.mutedIconUrl,
    );

    const ytLocalstorageUpdator = new YtLocalStorageUpdateScheduler();

    // handler function that gets called every time user interacts with the
    // slider created by this extension. with passed volume settings we update
    // the state of the movie player and also youtube's localstorage.
    const volumeSettingsChangeHandler = (settings: YtVolumeSettings) => {
        if (settings.muted) volumeController.mute();
        else volumeController.unMute();
        volumeController.setVolume(settings.volume);
        ytLocalstorageUpdator.schedulePlayerVolumeUpdate(
            settings.volume,
            settings.muted,
        );
    };
    wideVolumeSlider.onSettingsChange(volumeSettingsChangeHandler);

    // whenever movie player volume settings are externally updated, we
    // also update the state of the volume slider created by this extension
    monitorInternalVolume(moviePlayerElement, () => {
        wideVolumeSlider.updateSettings({
            volume: volumeController.getVolume(),
            muted: volumeController.isMuted(),
        });
    });

    // replace volume slider
    volumeAreaParent.insertBefore(
        wideVolumeSlider.getRootElement(),
        volumeArea,
    );
    volumeAreaParent.removeChild(volumeArea);

    // synchronize volume settings with youtube's localstorage (or default)
    const initialVolumeSettings: YtVolumeSettings =
        readVolumeSettingsFromLocalStorage() || {
            volume: 10,
            muted: false,
        };
    wideVolumeSlider.updateSettings(initialVolumeSettings);
    volumeSettingsChangeHandler(initialVolumeSettings);

    // after everything is setup, set slider's width to the value from initial settings
    let prefferedMultiplier =
        AVAILABLE_WIDTH_MULTIPLIERS[initParams.widthMultipleIndex];
    let currentMultiplier = -1;
    let responsiveWidth = initParams.responsiveWidth;

    const setCurrentMultiplier = (multiplier: number) => {
        currentMultiplier = multiplier;
        wideVolumeSlider.setSliderWidth(
            multiplier * YT_DEFAULT_SLIDER_WIDTH_PX,
        );
    };

    // ahh, who doesnt love layout calculations?
    // anyway, this thing is detecting whether some other element, that
    // is inside the `VolumeAreaParentElement`, is resizing together with it
    // (i.e. is filling the remaining space inside `VolumeAreaParentElement`)
    // when we detect that this is happening, we hint our layout calculations
    // that there actually is some extra space that we can use, so our
    // `VolumeSliderComponent` so it can grow when the player grows
    let volumeAreaParentWidthAtLastResize: number | undefined = undefined;
    let remainingForSliderWidthAtLastRecalc: number | undefined = undefined;
    const epsilon = 1e-1;

    const recalculateSliderWidth = () => {
        if (currentMultiplier === -1) {
            setCurrentMultiplier(prefferedMultiplier);
            setTimeout(() => recalculateSliderWidth(), 1000);
            return;
        }

        if (!responsiveWidth) {
            setCurrentMultiplier(prefferedMultiplier);
            return;
        }

        const volumeAreaParentWidth =
            volumeAreaParent.getBoundingClientRect().width;
        if (volumeAreaParentWidthAtLastResize === undefined) {
            volumeAreaParentWidthAtLastResize = volumeAreaParentWidth;
        }
        const computedContentWidth = [...volumeAreaParent.children]
            .map(el => el.scrollWidth)
            .reduce((a, b) => a + b);
        const currentSliderWidth =
            currentMultiplier * YT_DEFAULT_SLIDER_WIDTH_PX;
        const nonSliderOccupiedWidth =
            computedContentWidth - currentSliderWidth;
        let remainingForSliderWidth =
            volumeAreaParentWidth - nonSliderOccupiedWidth;
        remainingForSliderWidthAtLastRecalc = remainingForSliderWidth;
        if (
            volumeAreaParentWidthAtLastResize < volumeAreaParentWidth &&
            Math.abs(
                remainingForSliderWidth - remainingForSliderWidthAtLastRecalc,
            ) < epsilon
        ) {
            remainingForSliderWidth +=
                volumeAreaParentWidth - volumeAreaParentWidthAtLastResize;
        }
        const maximumAllowedMultiplier =
            remainingForSliderWidth / YT_DEFAULT_SLIDER_WIDTH_PX;
        const maximumAllowedOrPrefferedMultiplier = Math.min(
            maximumAllowedMultiplier,
            prefferedMultiplier,
        );
        const bestAvailableMultiplier = AVAILABLE_WIDTH_MULTIPLIERS.reduce(
            (lastBestFit, biggerMultiplier) => {
                return biggerMultiplier <= maximumAllowedOrPrefferedMultiplier
                    ? biggerMultiplier
                    : lastBestFit;
            },
            AVAILABLE_WIDTH_MULTIPLIERS[0],
        );

        const multiplerBeforeChange = currentMultiplier;
        setCurrentMultiplier(bestAvailableMultiplier);
        if (multiplerBeforeChange !== currentMultiplier) {
            volumeAreaParentWidthAtLastResize = volumeAreaParentWidth;
        }
        remainingForSliderWidthAtLastRecalc = remainingForSliderWidth;
    };

    recalculateSliderWidth();

    document.addEventListener(SETTINGS_CHANGED_EVENT, (e: any) => {
        const settings: SettingsChangedEvent = JSON.parse(e.detail);
        prefferedMultiplier =
            AVAILABLE_WIDTH_MULTIPLIERS[settings.widthMultipleIndex];
        responsiveWidth = settings.responsiveWidth;
        recalculateSliderWidth();
    });

    new ResizeObserver(_ => {
        if (responsiveWidth) {
            recalculateSliderWidth();
        }
    }).observe(volumeAreaParent);
})();
