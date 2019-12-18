/* Copyright (c) 2012 Joel Thornton <sidewise@joelpt.net> See LICENSE.txt for license details. */

var SidebarPaneCatalog = function () {
    this.$base(config.AVAILABLE_PANES)
};
SidebarPaneCatalog.prototype = {
    getPane: function (a) {
        return this.getItem(a)
    },
    getPaneIds: function () {
        return this.getIds()
    },
    loadState: function () {
        var a = settings.get("sidebarPanesState", []);
        this.items = [];
        for (var e = [], c = clone(config.AVAILABLE_PANES), g = c.map(function (a) {
                return a.id
            }), h = -1, d = 0; d < a.length; d++) {
            var f = a[d];
            e.push(f.id);
            var b = g.indexOf(f.id); - 1 == b ? log("State data found for pane that is not in available panes", f, c) : (b = c[b], b.enabled = f.enabled, b.enabled && h++, this.items.push(b))
        }
        for (d = 0; d < c.length; d++) b =
            c[d], -1 < e.indexOf(b.id) || this.items.push(b)
    },
    saveState: function () {
        return this.$super("saveState")("sidebarPanesState")
    },
    addPane: function (a, e, c, g, h) {
        return this.appendItem({
            id: a,
            enabled: e,
            url: c,
            label: g,
            icon: h
        })
    },
    removePane: function (a) {
        return this.removeItem(a)
    },
    reorderPane: function (a, e) {
        return this.reorderItem(a, e)
    }
};
extendClass(SidebarPaneCatalog, Catalog, SidebarPaneCatalog.prototype);
