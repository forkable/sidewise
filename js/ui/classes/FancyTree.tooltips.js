/* Copyright (c) 2012 Joel Thornton <sidewise@joelpt.net> See LICENSE.txt for license details. */

FancyTree.prototype.startTooltipTimer = function (a, e, d) {
    if (!this.permitTooltipHandler || this.permitTooltipHandler()) {
        this.tooltipShowTimer && clearTimeout(this.tooltipShowTimer);
        var b = this;
        this.tooltipShowTimer = setTimeout(function () {
            b.showTooltip.call(b, a, document.body.clientWidth, e);
            b.usingFastTooltip = !0
        }, d ? d : this.usingFastTooltip ? ROW_TOOLTIP_SHOW_DELAY_FAST_MS : ROW_TOOLTIP_SHOW_DELAY_MS)
    }
};
FancyTree.prototype.handleHideTooltipEvent = function (a) {
    a = a.data.treeObj;
    a.hideTooltip.call(a)
};
FancyTree.prototype.hideTooltip = function (a) {
    a || $("#ftSimpleTip").hide();
    this.tooltip && (this.tooltip.remove(), this.tooltip = null);
    this.tooltipShowTimer && (clearTimeout(this.tooltipShowTimer), this.tooltipShowTimer = null)
};
FancyTree.prototype.showTooltip = function (a, e, d) {
    if ((!this.permitTooltipHandler || this.permitTooltipHandler()) && !this.contextMenuShown && !this.dragging && !this.dropping) {
        var b = a.attr("rowtype"),
            c = this.rowTypes[b],
            h = c.onFormatTooltip,
            i = c.onResizeTooltip,
            g = this.getItemRowContent(a),
            f = g.offset();
        $("#ftTooltip").remove();
        this.tooltip = b = $('<div id="ftTooltip"/>').attr("rowtype", b).hide();
        $("body").append(b);
        void 0 === d && (d = {});
        d.data = {
            tooltip: b,
            row: a,
            content: g,
            label: a.attr("label"),
            text: a.attr("text"),
            icon: a.attr("icon"),
            treeObj: this,
            rowTypeParams: c
        };
        h && b.append(h(d));
        a = Math.min(c.tooltipMaxWidthFixed || 9999, Math.floor(c.tooltipMaxWidthPercent * window.innerWidth) || 9999);
        c = b.width();
        c > a && (b.width(a), c = d.data.width = a, i && i(d));
        b.show();
        e = {
            left: 0 >= -(e - f.left - c - 5) ? f.left : Math.max(0, e - c - 6),
            top: f.top + g.height() + this.tooltipTopOffset
        };
        b.offset(e);
        b.offset().top + b.height() + this.tooltipTopOffset > $(document).height() && (e.top = f.top - this.tooltipTopOffset - b.height(), b.offset(e))
    }
};
