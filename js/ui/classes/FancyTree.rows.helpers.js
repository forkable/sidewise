/* Copyright (c) 2012 Joel Thornton <sidewise@joelpt.net> See LICENSE.txt for license details. */

var TITLE_FORMAT_START_DELAY_MS = 20;
FancyTree.prototype.setRowButtonTooltips = function (a) {
    a.attr("rowtype");
    var b = this;
    this.getButtons(a).each(function (a, e) {
        var c = $(e);
        c.data("tooltip") || (c.attr("title", c.attr("tooltip")), c.tooltip(b.rowButtonTooltipParams))
    })
};
FancyTree.prototype.updateRowExpander = function (a) {
    var b = a.find(".ftChildren").children().length,
        d = a.children(".ftItemRow").children(".ftTreeControl");
    0 == b ? (d.removeClass("ftExpander").addClass("ftNode"), a.removeClass("ftCollapsed")) : d.removeClass("ftNode").addClass("ftExpander")
};
FancyTree.prototype.formatRowTitle = function (a) {
    var b = this;
    a.each(function (a, e) {
        var c = $(e),
            f = c.attr("id");
        f && (b.formatTitleQueue[f] = c)
    });
    this.formatTitleTimer || (this.formatTitleTimer = setTimeout(function () {
        b.processTitleFormatQueue.call(b)
    }, TITLE_FORMAT_START_DELAY_MS))
};
FancyTree.prototype.processTitleFormatQueue = function () {
    clearTimeout(this.formatTitleTimer);
    this.formatTitleTimer = null;
    for (var a in this.formatTitleQueue) {
        var b = this.formatTitleQueue[a],
            d = this.getRowTypeParams(b);
        if (d && d.onFormatTitle) d.onFormatTitle(b)
    }
    this.formatTitleQueue = {}
};
FancyTree.prototype.formatLineageTitles = function (a) {
    this.formatRowTitle(a.parents(".ftRowNode").add(a))
};
FancyTree.prototype.formatAllRowTitles = function (a) {
    var b = this.root.find(".ftRowNode");
    a && (b = b.filter(a));
    this.formatRowTitle(b)
};
