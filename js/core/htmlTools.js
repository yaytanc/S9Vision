/**
 * Created by Muratd on 11/10/2016.
 */
"use strict";

var allowedHTMLTags = 'DIV IMG VIDEO IFRAME OBJECT SPAN';

NodeList.prototype.forEach = HTMLCollection.prototype.forEach = Array.prototype.forEach;

/**
 *
 * @param element_OR_id
 * @returns {*}
 */
function getHTMLElementBy(element_OR_id) {
    return (typeof element_OR_id == 'string' ? document.getElementById(element_OR_id) : element_OR_id);
}

/**
 *
 * @param el
 * @param selector
 * @returns {*}
 */
function selectorMatches(el, selector) {
    var p = Element.prototype;
    var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function (s) {
            return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
        };
    return f.call(el, selector);
}


/**
 *
 * @param element_OR_id
 * @returns {string}
 */
function attrHTMLElement(element_OR_id) {
    var Ele = getHTMLElementBy(element_OR_id);
    if (Ele != null) {
        if (arguments.length == 2 && typeof arguments[1] == 'object') {
            for (var prop in arguments[1])
                if (arguments[1].hasOwnProperty(prop))
                    Ele.setAttribute(prop, arguments[1][prop]);
            return Ele;
        } else if (arguments.length == 2 && typeof arguments[1] == 'string') {
            var r = Ele.getAttribute(arguments[1]);
            r = (typeof r == 'string' ? r : '');
            return r;
        } else if (Ele.hasAttribute && arguments.length == 3 && typeof arguments[1] == 'string') {
            Ele.setAttribute(arguments[1], arguments[2]);
            return Ele;
        } else {
            return Ele;
        }
    } else {
        return null;
    }
}

/**
 *
 * @param parent
 * @param htmlTag
 * @param attributes
 * @returns {*}
 */
function addHTMLElement(parent, htmlTag, attributes) {
    var p = getHTMLElementBy(parent);
    if (typeof p != 'object' || allowedHTMLTags.indexOf(htmlTag.toUpperCase()) == -1) return null;
    return p.appendChild(attrHTMLElement(document.createElement(htmlTag), attributes));
}

/**
 *
 * @param Ele
 * @returns {boolean}
 */
function isHTMLObject(Ele) {
    return Ele != null && (typeof Ele == 'object' || typeof Ele == 'function');
}

/**
 *
 * @param id
 * @returns {*}
 */
function elementExistsInBody(id) {
    return document.body.contains(getHTMLElementBy(id));
}

/**
 *
 * @param element_OR_id
 */
function removeHTMLElement(element_OR_id) {
    // element_OR_id'yi ve varsa çocuklarını remove eder!
    var Ele = getHTMLElementBy(element_OR_id);
    if (isHTMLObject(Ele)) {
        if (Ele.hasChildNodes()) removeHTMLElementsChildren(Ele);
        if (Ele.tagName == 'VIDEO') Ele.pause();
        if (Ele.hasAttribute) {
            if (Ele.hasAttribute('src')) attrHTMLElement(Ele, 'src', '');
            if (Ele.hasAttribute('value')) attrHTMLElement(Ele, 'value', '');
            if (Ele.hasAttribute('data')) attrHTMLElement(Ele, 'data', '');
        }
        Ele.remove(true);
    }
    Ele = null;
}

/**
 *
 * @param element_OR_id
 */
function removeHTMLElementsChildren(element_OR_id) {
    // element_OR_id'nin çocuklarını (varsa) remove eder;
    // element_OR_id'yi REMOVE ETMEZ!
    // ayrıca "element_OR_id" bir widget ise, recursive _destroy yapar.
    var Ele = getHTMLElementBy(element_OR_id);
    if (isHTMLObject(Ele)) {
        var l = Ele.childNodes.length;
        while (l--) {
            if (Ele.childNodes[l].hasAttribute && Ele.childNodes[l].hasAttribute('widgetType')) {
                wlog('removeHTMLElementsChildren: Widget will destroy > ' + Ele.childNodes[l].id + ' - ' + Ele.childNodes[l].getAttribute('widgetType'));
                var widget = eval(Ele.childNodes[l].getAttribute('widgetType').toLowerCase());
                widget._destroy(Ele.childNodes[l].id);
                widget = null;
            } else {
                removeHTMLElement(Ele.childNodes[l]);
            }
        }
    }
    Ele = null;
}

/**
 *
 * @param element_OR_id
 */
function hideHTMLElement(element_OR_id) {
    var Ele = getHTMLElementBy(element_OR_id);
    if (isHTMLObject(Ele)) {
        Ele.style.display = 'none';
    }
    return Ele;
}

/**
 *
 * @param element_OR_id
 */
function showHTMLElement(element_OR_id) {
    var Ele = getHTMLElementBy(element_OR_id);
    if (isHTMLObject(Ele)) {
        Ele.style.display = 'block';
        Ele.style.opacity = '1';
    }
    return Ele;
}

/**
 *
 */
var _H5;
/**
 *
 * @param element_OR_id
 * @returns {{e: *, hide: Function, show: Function, attr: Function, removeChildren: Function, empty: Function, remove: Function, existsInBody: Function, append: Function, fadeTo: Function, fadeOut: Function, fadeIn: Function, html: Function, text: Function}}
 * @private
 */
_H5 = function (element_OR_id) {
    return {
        e: getHTMLElementBy(element_OR_id),
        hide: function () {
            return _H5(hideHTMLElement(this.e));
        },
        show: function () {
            return _H5(showHTMLElement(this.e));
        },
        attr: function () {
            Array.prototype.unshift.call(arguments, this.e);
            var r = attrHTMLElement.apply(this, arguments);
            if (typeof r == 'string' || r == null)
                return r;
            else
                return _H5(r);
        },
        style: function (name, value) {
            if (this.e && !value) {
                return this.e.style[name]
            } else if (this.e && value) {
                this.e.style[name] = value;
                return _H5(this.e);
            } else
                return !value ? '' : _H5(null);
        },
        removeChildren: function () {
            removeHTMLElementsChildren(this.e);
            return _H5(this.e);
        },
        empty: function () {
            return this.removeChildren(this.e);
        },
        remove: function () {
            removeHTMLElement(this.e);
        },
        existsInBody: function () {
            return elementExistsInBody(this.e);
        },
        hasClass: function (cl) {
            return (this.e && typeof this.e.className == 'string' && this.e.className.indexOf(cl) > -1 ? true : false);
        },
        removeClass: function (cl) {
            if (this.e && this.e.className) this.e.className = this.e.className.replace(new RegExp(cl, 'g'), '');
            return _H5(this.e);
        },
        addClass: function (cl) {
            if (this.e) {
                this.removeClass(cl);
                if (this.e.className) {
                    this.e.className = (this.e.className + " " + cl).trim();
                } else {
                    this.e.className = cl;
                }
            }
            return _H5(this.e);
        },
        append: function (htmlTag, attributes) {
            return _H5(addHTMLElement(this.e, htmlTag, attributes));
        },
        fadeTo: function (delay, finalOpacity, cb) {
            var opacity = finalOpacity == 0 ? 1 : 0;
            var frameRate = (_platform.isSmartTV ? 26 : 13);
            var step = 1 / (delay / frameRate);
            (function (e, opacity, step, finalOpacity, cb) {
                var t = ___workerTimer.setInterval(function () {
                    if (finalOpacity == 1) opacity += step; else opacity -= step;
                    if (opacity <= 0 || opacity >= 1) {
                        _H5(e).style("opacity", String(finalOpacity));
                        ___workerTimer.clearInterval(t);
                        if (cb) cb();
                    } else {
                        _H5(e).style("opacity", opacity);
                    }
                }, frameRate);
            })(this.e, opacity, step, finalOpacity, cb);
            return _H5(this.e);
        },
        fadeOut: function (delay) {
            var d = delay ? delay : 500;
            this.fadeTo(d, 0);
            return this;
        },
        fadeIn: function (delay) {
            var d = delay ? delay : 500;
            this.fadeTo(d, 1);
            return this;
        },
        html: function (h) {
            if (isHTMLObject(this.e)) {
                this.removeChildren();
                this.e.innerHTML = h;
            }
            return _H5(this.e);
        },
        text: function (t) {
            if (isHTMLObject(this.e)) this.e.innerText = t;
            return _H5(this.e);
        },
        closest: function (selector) {
            var p = this.e ? this.e.parentElement : null;
            while (p && !selectorMatches(p, selector)) p = p.parentElement;
            return p;
        },
        find: function (selector) {
            return _H5(this.e ? this.e.querySelector(selector) : null);
        },
        findAll: function (selector) {
            return (this.e ? this.e.querySelectorAll(selector) : []);
        }
    };
};