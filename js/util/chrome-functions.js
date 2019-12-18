/* Copyright (c) 2012 Joel Thornton <sidewise@joelpt.net> See LICENSE.txt for license details. */

function getVersion() {
    return chrome.app.getDetails().version
}

function positionWindow(a, b, c) {
    c ? chrome.windows.update(a, b, c) : chrome.windows.update(a, b)
}

function focusCurrentTabInPageTree(a) {
    var b = focusTracker.getFocused();
    b && chrome.tabs.query({
        active: !0,
        windowId: b
    }, function (c) {
        0 != c.length && (c = c[0], (c.id != tree.focusedTabId || a) && tree.focusPage(c.id))
    })
}

function refreshPageStatus(a) {
    a.isTab() && setTimeout(function () {
        var b = a.id;
        (a = tree.getNode(b)) ? a.chromeId ? chrome.tabs.get(a.chromeId, function (c) {
            if (c) {
                var b = c.id;
                (a = tree.getNode(["chromeId", b])) ? tree.updateNode(a, {
                    status: c.status
                }): log("Aborting page status refresh because tab no longer exists in tree by chromeId", b)
            } else log("Aborting page status refresh because tab no longer exists in Chrome", b)
        }) : log("Aborting page status refresh because page node no longer has a chromeId", a): log("Aborting page status refresh because page node no longer exists in tree",
            b)
    }, 100)
}

function fixAllPinnedUnpinnedTabOrder() {
    tree.filter(function (a) {
        return a instanceof PageNode && !a.hibernated && a.pinned
    }).forEach(function (a) {
        fixPinnedUnpinnedTabOrder(a)
    });
    tree.filter(function (a) {
        return a instanceof PageNode && !a.hibernated && !a.pinned
    }).reverse().forEach(function (a) {
        fixPinnedUnpinnedTabOrder(a)
    })
}

function fixPinnedUnpinnedTabOrder(a) {
    if (!a.pinned && a.following(function (a) {
            return a.isTab() && a.pinned
        }, a.topParent())) {
        var b = last(a.followingNodes(a.topParent()), function (a) {
            return a.isTab() && a.pinned
        })[1];
        if (!b) throw Error("Could not find lastPinned but should have been able to");
        log("Moving non-pinned tab to be below last pinned tab", a.id, "after", b.id);
        return tree.moveNodeRel(a, 0 == b.children.length ? "after" : "prepend", b)
    }
    if (a.pinned && a.preceding(function (a) {
            return a.isTab() && !a.pinned
        }, a.topParent())) {
        b =
            first(a.precedingNodes(a.topParent()), function (a) {
                return a.isTab && !a.pinned
            })[1];
        if (!b) throw Error("Could not find topUnpinned but should have been able to");
        log("Moving pinned tab to be before first pinned tab", a.id, "before", b.id);
        return tree.moveNodeRel(a, "before", b)
    }
};
