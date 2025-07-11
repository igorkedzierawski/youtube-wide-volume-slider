const querySelectorLocate = (
    parent: Element,
    selectors: string,
    locateOnce: boolean,
    callback: (elem: Element) => void,
): MutationObserver | null => {
    const element = parent.querySelector(selectors);
    if (element) {
        callback(element);
        if (locateOnce) {
            return null;
        }
    }

    const observer = new MutationObserver((mutations, observer) => {
        for (const mutation of mutations) {
            const nodes = mutation.addedNodes;
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (!(node instanceof Element)) {
                    continue;
                }
                if (!node.matches(selectors)) {
                    continue;
                }
                callback(node);
                if (locateOnce) {
                    observer.disconnect();
                    return;
                }
            }
        }
    });

    observer.observe(parent, { subtree: true, childList: true });

    return observer;
};

export const querySelectorLocateOnce = (
    parent: Element,
    selectors: string,
): Promise<Element> => {
    return new Promise<Element>(resolve => {
        querySelectorLocate(parent, selectors, true, elem => resolve(elem));
    });
};

export const querySelectorLocateAndObserve = (
    parent: Element,
    selectors: string,
    callback: (elem: Element) => void,
): MutationObserver | null => {
    return querySelectorLocate(parent, selectors, false, callback);
};
