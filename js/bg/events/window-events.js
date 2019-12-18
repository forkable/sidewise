/* Copyright (c) 2012 Joel Thornton <sidewise@joelpt.net> See LICENSE.txt for license details. */

var WINDOW_UPDATE_CHECK_INTERVAL_SLOW_MS = 300,
    WINDOW_UPDATE_CHECK_INTERVAL_FAST_MS = 150,
    WINDOW_UPDATE_CHECK_INTERVAL_RATE_RESET_MS = 5E3,
    WINDOW_REMOVE_SAVE_TREE_DELAY_MS = 1E4,
    windowUpdateCheckInterval = null;

function registerWindowEvents() {
    chrome.windows.onCreated.addListener(onWindowCreated);
    chrome.windows.onRemoved.addListener(onWindowRemoved);
    chrome.windows.onFocusChanged.addListener(onWindowFocusChanged);
    setSlowWindowUpdateCheckRate()
}

function onWindowCreated(a) {
    browserIsClosed ? (log("about to reload background page"), document.location.reload()) : "popup" == a.type && sidebarHandler.creatingSidebar || monitorInfo.isDetecting() || "panel" == a.type || "detached-panel" == a.type || (log(a), a = new WindowNode(a), tree.addNode(a))
}

function onWindowRemoved(a) {
    log(a);
    if (a == sidebarHandler.windowId) sidebarHandler.removeInProgress ? log("sidebar removeInProgress") : (log("removing sidebar window"), sidebarHandler.removeInProgress = !0, sidebarHandler.onRemoved());
    else if (a != monitorInfo.lastDetectionWindowId) {
        focusTracker.remove(a);
        disallowSavingTreeForDuration(WINDOW_REMOVE_SAVE_TREE_DELAY_MS);
        tree.onModifiedDelayedWaitMs = config.TREE_ONMODIFIED_SAVE_AFTER_WINDOW_CLOSE_MS;
        var b = tree.getNode(["chromeId", a]);
        b && (0 < b.children.length ? tree.updateNode(b, {
            hibernated: !0,
            restorable: !1,
            title: getMessage("text_hibernatedWindow"),
            chromeId: null
        }) : tree.removeNode(b));
        sidebarHandler.sidebarExists() && ("undocked" != sidebarHandler.dockState && sidebarHandler.dockWindowId == a) && (sidebarHandler.dockWindowId = null, focusTracker.getTopFocusableWindow(function (a) {
            a && sidebarHandler.redock(a.id)
        }));
        chrome.windows.getAll(null, function (a) {
            for (var c in a)
                if (a[c].type == "normal") {
                    focusCurrentTabInPageTree();
                    return
                } log("chrome is shutting down");
            shutdownSidewise()
        })
    }
}

function onWindowFocusChanged(a) {
    if (!monitorInfo.isDetecting())
        if (-1 == a) focusTracker.chromeHasFocus = !1;
        else {
            var b = focusTracker.chromeHasFocus;
            focusTracker.chromeHasFocus = !0;
            focusTracker.setFocused(a);
            sidebarHandler.matchSidebarDockMinimizedStates(function (f) {
                f || (!b && sidebarHandler.sidebarExists() && settings.get("keepSidebarOnTop") ? a == sidebarHandler.windowId ? (f = "undocked" == sidebarHandler.dockState ? focusTracker.getFocused() : sidebarHandler.dockWindowId, chrome.windows.update(f, {
                    focused: !0
                }, function () {
                    chrome.windows.update(sidebarHandler.windowId, {
                        focused: !0
                    })
                })) : chrome.tabs.query({
                    windowId: a,
                    active: !0
                }, function (c) {
                    c = c[0];
                    isScriptableUrl(c.url) ? getIsFullScreen(c) : (chrome.windows.update(sidebarHandler.windowId, {
                        focused: !0
                    }, function () {
                        chrome.windows.update(a, {
                            focused: !0
                        })
                    }), focusCurrentTabInPageTree())
                }) : a == sidebarHandler.windowId || sidebarHandler.creatingSidebar || focusCurrentTabInPageTree())
            })
        }
}

function onWindowUpdateCheckInterval() {
    !sidebarHandler.resizingDockWindow && !sidebarHandler.matchingMinimizedStates && !sidebarHandler.removeInProgress && sidebarHandler.sidebarExists() && ("undocked" == sidebarHandler.dockState ? chrome.windows.get(sidebarHandler.windowId, function (a) {
        if (a && "minimized" != a.state && (a.left != settings.get("undockedLeft") && (sidebarHandler.currentSidebarMetrics.left = a.left, settings.set("undockedLeft", a.left)), a.top != settings.get("undockedTop") && (sidebarHandler.currentSidebarMetrics.top =
                a.top, settings.set("undockedTop", a.top)), a.width != settings.get("sidebarTargetWidth") && (sidebarHandler.currentSidebarMetrics.width = a.width, settings.set("sidebarTargetWidth", a.width), sidebarHandler.targetWidth = a.width), a.height != settings.get("undockedHeight"))) sidebarHandler.currentSidebarMetrics.height = a.height, settings.set("undockedHeight", a.height)
    }) : sidebarHandler.dockWindowId && chrome.windows.get(sidebarHandler.dockWindowId, function (a) {
        if (a) {
            if (!sidebarHandler.resizingDockWindow) {
                var b = sidebarHandler.currentDockWindowMetrics,
                    f = "Mac" == PLATFORM ? !1 : settings.get("allowAutoUnmaximize");
                chrome.windows.get(sidebarHandler.windowId, function (b) {
                    if (b && "maximized" == b.state && "Mac" != PLATFORM) {
                        var d = {
                                left: b.left + c,
                                top: b.top + c,
                                width: b.width - 2 * c,
                                height: b.height - 2 * c
                            },
                            e = clone(sidebarHandler.lastDockWindowMetrics);
                        sidebarHandler.lastDockWindowMetrics = {};
                        positionWindow(b.id, {
                            state: "normal"
                        }, function () {
                            positionWindow(a.id, d, function () {
                                sidebarHandler.redock(a.id, function () {
                                    sidebarHandler.lastDockWindowMetrics = e
                                })
                            })
                        })
                    }
                });
                var c = monitorInfo.maximizedOffset;
                if ("maximized" == a.state && f && "Mac" != PLATFORM) {
                    var j = {
                            left: a.left + c,
                            top: a.top + c,
                            width: a.width - 2 * c,
                            height: a.height - 2 * c
                        },
                        k = clone(sidebarHandler.lastDockWindowMetrics);
                    sidebarHandler.lastDockWindowMetrics = {};
                    positionWindow(a.id, {
                        state: "normal"
                    }, function () {
                        positionWindow(a.id, j, function () {
                            sidebarHandler.redock(a.id, function () {
                                sidebarHandler.lastDockWindowMetrics = k
                            })
                        })
                    })
                } else {
                    var f = a.width - b.width,
                        h = a.left - b.left,
                        l = a.top - b.top,
                        m = a.height - b.height,
                        e = sidebarHandler.currentSidebarMetrics,
                        d = {},
                        g = !1;
                    if ("maximized" ==
                        a.state && "Mac" != PLATFORM) e.left != a.left + a.width - c && (d.left = a.left + a.width - c, d.top = a.top + c, d.height = a.height - 2 * c, chrome.windows.update(sidebarHandler.windowId, {
                        focused: !0
                    }, function () {
                        chrome.windows.update(a.id, {
                            focused: !0
                        })
                    }), g = !0);
                    else {
                        if (0 != m || 0 != h || 0 != f) d.height = a.height, g = !0;
                        if (0 != l || 0 != h || 0 != f) d.top = a.top, g = !0;
                        0 != f ? "right" == sidebarHandler.dockState && 0 == h ? (d.left = a.left + a.width, g = !0) : "left" == sidebarHandler.dockState && 0 != h && (d.left = a.left - e.width, g = !0) : 0 != h ? (d.left = "right" == sidebarHandler.dockState ?
                            a.left + a.width : a.left - e.width, g = !0) : "right" == sidebarHandler.dockState ? e.left != a.left + a.width && (d.left = a.left + a.width, g = !0) : "left" == sidebarHandler.dockState && e.left != a.left - e.width && (d.left = a.left - e.width, g = !0)
                    }
                    b.width = a.width;
                    b.left = a.left;
                    b.top = a.top;
                    b.height = a.height;
                    b.state = a.state;
                    if (g) {
                        sidebarHandler.lastDockWindowMetrics = {};
                        setFastWindowUpdateCheckRate();
                        for (var i in d) e[i] = d[i];
                        sidebarHandler.targetWidth = e.width;
                        settings.set("sidebarTargetWidth", e.width);
                        log("updating sidebar to new dimensions",
                            d, sidebarHandler.resizingSidebar);
                        sidebarHandler.resizingSidebar = !0;
                        positionWindow(sidebarHandler.windowId, d, function () {
                            TimeoutManager.reset("resetResizingSidebar", onResetResizingSidebar, 500)
                        })
                    }
                }
            }
        } else log("Dock window has been destroyed; choose new dock window"), focusTracker.remove(sidebarHandler.dockWindowId), sidebarHandler.redock(focusTracker.getFocused())
    }))
}

function onResetResizingSidebar() {
    sidebarHandler.resizingSidebar = !1
}

function setSlowWindowUpdateCheckRate() {
    log("switching to slow window update check rate");
    clearInterval(windowUpdateCheckInterval);
    windowUpdateCheckInterval = setInterval(onWindowUpdateCheckInterval, WINDOW_UPDATE_CHECK_INTERVAL_SLOW_MS)
}

function setFastWindowUpdateCheckRate() {
    onWindowUpdateCheckInterval && (log("switching to fast window update check rate"), TimeoutManager.reset("resetWindowUpdateCheckRate", resetWindowUpdateCheckRate, WINDOW_UPDATE_CHECK_INTERVAL_RATE_RESET_MS), clearInterval(windowUpdateCheckInterval), windowUpdateCheckInterval = setInterval(onWindowUpdateCheckInterval, WINDOW_UPDATE_CHECK_INTERVAL_FAST_MS))
}

function resetWindowUpdateCheckRate() {
    onWindowUpdateCheckInterval && setSlowWindowUpdateCheckRate()
};
