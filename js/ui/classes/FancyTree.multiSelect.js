/* Copyright (c) 2012 Joel Thornton <sidewise@joelpt.net> See LICENSE.txt for license details. */

FancyTree.prototype.toggleMultiSelectionSingle = function (a, c) {
    var b = this.multiSelection.is(a);
    b && !c ? (this.multiSelection = this.multiSelection.not(a), this.removeSelectionEffect(a), 0 == this.multiSelection.length && this.clearMultiSelection()) : b || (this.multiSelection = this.multiSelection.add(a), this.addSelectionEffect(a), this.root.addClass("ftMultiselecting"))
};
FancyTree.prototype.removeMultiSelectionSingle = function (a) {
    if (!this.multiSelection.is(a)) return !1;
    this.multiSelection = this.multiSelection.not(a);
    this.removeSelectionEffect(a);
    0 == this.multiSelection.length && this.clearMultiSelection();
    return !0
};
FancyTree.prototype.addMultiSelectionBetween = function (a, c) {
    if (a.is(c)) this.toggleMultiSelectionSingle(a);
    else {
        var b;
        b = this.filtering ? this.root.find(".ftFilteredIn") : this.root.find(".ftRowNode");
        b = b.not(function () {
            return 0 < $(this).parents(".ftCollapsed").length
        });
        var d = this;
        b = b.filter(function (a, b) {
            return 0 <= d.multiSelectableRowTypes.indexOf(b.attributes.rowtype.value)
        });
        var e = b.map(function (a, b) {
                return b.id
            }).toArray(),
            f = e.indexOf(a.attr("id")),
            g = e.indexOf(c.attr("id"));
        if (-1 == f || -1 == g) throw Error("Could not find both start and end rows",
            a, c);
        if (f > g) var h = f,
            f = g,
            g = h;
        e = e.slice(f, g + 1);
        0 != e.length && (d = this, e.forEach(function (a) {
            a = b.filter("#" + a);
            d.multiSelection.is(a) || (d.multiSelection = d.multiSelection.add(a), d.addSelectionEffect(a))
        }), this.root.addClass("ftMultiselecting"))
    }
};
FancyTree.prototype.clearMultiSelection = function () {
    var a = this;
    this.multiSelection.each(function (c, b) {
        var d = $(b);
        a.removeSelectionEffect(d)
    });
    this.root.removeClass("ftMultiselecting");
    this.multiSelection = $();
    this.lastMultiSelectedToId = this.lastMultiSelectedFromId = null
};
FancyTree.prototype.setMultiSelectedChildrenUnderRow = function (a, c, b) {
    var d = a.find(this.multiSelection),
        a = d.not(c),
        c = c.not(d);
    b && (a = a.filter(b));
    var e = this;
    a.each(function (a, b) {
        e.removeMultiSelectionSingle($(b))
    });
    1 == c.length && 0 == this.multiSelection.length || c.each(function (a, b) {
        e.toggleMultiSelectionSingle($(b), !0)
    })
};
FancyTree.prototype.sortMultiSelection = function () {
    if (0 != this.multiSelection.length) {
        var a = this.multiSelection.map(function (a, b) {
            return b.id
        }).toArray();
        this.multiSelection = $("#" + a.join(",#"))
    }
};
FancyTree.prototype.addSelectionEffect = function (a) {
    var c = this.getRowTypeParams(a);
    c ? c.multiselectable && a.addClass("ftSelected") : console.error("Could not add selection effect due to missing row type params for", a)
};
FancyTree.prototype.removeSelectionEffect = function (a) {
    a.removeClass("ftSelected")
};
