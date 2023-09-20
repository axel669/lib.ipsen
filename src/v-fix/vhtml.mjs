var emptyTags = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

var esc = function esc(str) {
    return String(str).replace(/[&<>"']/g, function (s) {
        return '&' + map[s] + ';';
    });
};
var map = { '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": 'apos' };
var setInnerHTMLAttr = 'dangerouslySetInnerHTML';
var DOMAttributeNames = {
    className: 'class',
    htmlFor: 'for'
};

var sanitized = {};

function h(name, attrs) {
    var stack = [],
        s = '';
    attrs = attrs || {};
    for (var i = arguments.length; i-- > 2;) {
        stack.push(arguments[i]);
    }

    if (typeof name === 'function') {
        attrs.children = stack.reverse();
        return name(attrs);
    }

    if (name) {
        s += '<' + name;
        if (attrs) for (var _i in attrs) {
            if (attrs[_i] !== false && attrs[_i] != null && _i !== setInnerHTMLAttr) {
                s += ' ' + (DOMAttributeNames[_i] ? DOMAttributeNames[_i] : esc(_i)) + '="' + esc(attrs[_i]) + '"';
            }
        }
        s += '>';
    }

    if (emptyTags.indexOf(name) === -1) {
        if (attrs[setInnerHTMLAttr]) {
            s += attrs[setInnerHTMLAttr].__html;
        } else while (stack.length) {
            var child = stack.pop();
            if (child) {
                if (child.pop) {
                    for (var _i2 = child.length; _i2--;) {
                        stack.push(child[_i2]);
                    }
                } else {
                    s += sanitized[child] === true ? child : esc(child);
                }
            }
        }

        s += name ? '</' + name + '>' : '';
    }
    else {
        s = s.slice(0, -1) + "/>"
    }

    sanitized[s] = true;
    return s;
}

export default h
