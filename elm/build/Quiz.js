(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = createHash

function createHash(elem) {
    var attributes = elem.attributes
    var hash = {}

    if (attributes === null || attributes === undefined) {
        return hash
    }

    for (var i = 0; i < attributes.length; i++) {
        var attr = attributes[i]

        if (attr.name.substr(0,5) !== "data-") {
            continue
        }

        hash[attr.name.substr(5)] = attr.value
    }

    return hash
}

},{}],2:[function(require,module,exports){
var createStore = require("weakmap-shim/create-store")
var Individual = require("individual")

var createHash = require("./create-hash.js")

var hashStore = Individual("__DATA_SET_WEAKMAP@3", createStore())

module.exports = DataSet

function DataSet(elem) {
    var store = hashStore(elem)

    if (!store.hash) {
        store.hash = createHash(elem)
    }

    return store.hash
}

},{"./create-hash.js":1,"individual":3,"weakmap-shim/create-store":4}],3:[function(require,module,exports){
(function (global){
var root = typeof window !== 'undefined' ?
    window : typeof global !== 'undefined' ?
    global : {};

module.exports = Individual

function Individual(key, value) {
    if (root[key]) {
        return root[key]
    }

    Object.defineProperty(root, key, {
        value: value
        , configurable: true
    })

    return value
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
var hiddenStore = require('./hidden-store.js');

module.exports = createStore;

function createStore() {
    var key = {};

    return function (obj) {
        if (typeof obj !== 'object' || obj === null) {
            throw new Error('Weakmap-shim: Key must be object')
        }

        var store = obj.valueOf(key);
        return store && store.identity === key ?
            store : hiddenStore(obj, key);
    };
}

},{"./hidden-store.js":5}],5:[function(require,module,exports){
module.exports = hiddenStore;

function hiddenStore(obj, key) {
    var store = { identity: key };
    var valueOf = obj.valueOf;

    Object.defineProperty(obj, "valueOf", {
        value: function (value) {
            return value !== key ?
                valueOf.apply(this, arguments) : store;
        },
        writable: true
    });

    return store;
}

},{}],6:[function(require,module,exports){
var DataSet = require("data-set")

module.exports = addEvent

function addEvent(target, type, handler) {
    var ds = DataSet(target)
    var events = ds[type]

    if (!events) {
        ds[type] = handler
    } else if (Array.isArray(events)) {
        if (events.indexOf(handler) === -1) {
            events.push(handler)
        }
    } else if (events !== handler) {
        ds[type] = [events, handler]
    }
}

},{"data-set":2}],7:[function(require,module,exports){
var globalDocument = require("global/document")
var DataSet = require("data-set")

var addEvent = require("./add-event.js")
var removeEvent = require("./remove-event.js")
var ProxyEvent = require("./proxy-event.js")

module.exports = DOMDelegator

function DOMDelegator(document) {
    document = document || globalDocument

    this.target = document.documentElement
    this.events = {}
    this.rawEventListeners = {}
    this.globalListeners = {}
}

DOMDelegator.prototype.addEventListener = addEvent
DOMDelegator.prototype.removeEventListener = removeEvent

DOMDelegator.prototype.addGlobalEventListener =
    function addGlobalEventListener(eventName, fn) {
        var listeners = this.globalListeners[eventName]
        if (!listeners) {
            listeners = this.globalListeners[eventName] = []
        }

        if (listeners.indexOf(fn) === -1) {
            listeners.push(fn)
        }
    }

DOMDelegator.prototype.removeGlobalEventListener =
    function removeGlobalEventListener(eventName, fn) {
        var listeners = this.globalListeners[eventName]
        if (!listeners) {
            return
        }

        var index = listeners.indexOf(fn)
        if (index !== -1) {
            listeners.splice(index, 1)
        }
    }

DOMDelegator.prototype.listenTo = function listenTo(eventName) {
    if (this.events[eventName]) {
        return
    }

    this.events[eventName] = true
    listen(this, eventName)
}

DOMDelegator.prototype.unlistenTo = function unlistenTo(eventName) {
    if (!this.events[eventName]) {
        return
    }

    this.events[eventName] = false
    unlisten(this, eventName)
}

function listen(delegator, eventName) {
    var listener = delegator.rawEventListeners[eventName]

    if (!listener) {
        listener = delegator.rawEventListeners[eventName] =
            createHandler(eventName, delegator.globalListeners)
    }

    delegator.target.addEventListener(eventName, listener, true)
}

function unlisten(delegator, eventName) {
    var listener = delegator.rawEventListeners[eventName]

    if (!listener) {
        throw new Error("dom-delegator#unlistenTo: cannot " +
            "unlisten to " + eventName)
    }

    delegator.target.removeEventListener(eventName, listener, true)
}

function createHandler(eventName, globalListeners) {
    return handler

    function handler(ev) {
        var globalHandlers = globalListeners[eventName] || []
        var listener = getListener(ev.target, eventName)

        var handlers = globalHandlers
            .concat(listener ? listener.handlers : [])
        if (handlers.length === 0) {
            return
        }

        var arg = new ProxyEvent(ev, listener)

        handlers.forEach(function (handler) {
            typeof handler === "function" ?
                handler(arg) : handler.handleEvent(arg)
        })
    }
}

function getListener(target, type) {
    // terminate recursion if parent is `null`
    if (target === null) {
        return null
    }

    var ds = DataSet(target)
    // fetch list of handler fns for this event
    var handler = ds[type]
    var allHandler = ds.event

    if (!handler && !allHandler) {
        return getListener(target.parentNode, type)
    }

    var handlers = [].concat(handler || [], allHandler || [])
    return new Listener(target, handlers)
}

function Listener(target, handlers) {
    this.currentTarget = target
    this.handlers = handlers
}

},{"./add-event.js":6,"./proxy-event.js":13,"./remove-event.js":14,"data-set":2,"global/document":10}],8:[function(require,module,exports){
var Individual = require("individual")
var cuid = require("cuid")
var globalDocument = require("global/document")

var DOMDelegator = require("./dom-delegator.js")

var delegatorCache = Individual("__DOM_DELEGATOR_CACHE@9", {
    delegators: {}
})
var commonEvents = [
    "blur", "change", "click",  "contextmenu", "dblclick",
    "error","focus", "focusin", "focusout", "input", "keydown",
    "keypress", "keyup", "load", "mousedown", "mouseup",
    "resize", "scroll", "select", "submit", "unload"
]

/*  Delegator is a thin wrapper around a singleton `DOMDelegator`
        instance.

    Only one DOMDelegator should exist because we do not want
        duplicate event listeners bound to the DOM.

    `Delegator` will also `listenTo()` all events unless 
        every caller opts out of it
*/
module.exports = Delegator

function Delegator(opts) {
    opts = opts || {}
    var document = opts.document || globalDocument

    var cacheKey = document["__DOM_DELEGATOR_CACHE_TOKEN@9"]

    if (!cacheKey) {
        cacheKey =
            document["__DOM_DELEGATOR_CACHE_TOKEN@9"] = cuid()
    }

    var delegator = delegatorCache.delegators[cacheKey]

    if (!delegator) {
        delegator = delegatorCache.delegators[cacheKey] =
            new DOMDelegator(document)
    }

    if (opts.defaultEvents !== false) {
        for (var i = 0; i < commonEvents.length; i++) {
            delegator.listenTo(commonEvents[i])
        }
    }

    return delegator
}



},{"./dom-delegator.js":7,"cuid":9,"global/document":10,"individual":11}],9:[function(require,module,exports){
/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 * 
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

/*global window, navigator, document, require, process, module */
(function (app) {
  'use strict';
  var namespace = 'cuid',
    c = 0,
    blockSize = 4,
    base = 36,
    discreteValues = Math.pow(base, blockSize),

    pad = function pad(num, size) {
      var s = "000000000" + num;
      return s.substr(s.length-size);
    },

    randomBlock = function randomBlock() {
      return pad((Math.random() *
            discreteValues << 0)
            .toString(base), blockSize);
    },

    safeCounter = function () {
      c = (c < discreteValues) ? c : 0;
      c++; // this is not subliminal
      return c - 1;
    },

    api = function cuid() {
      // Starting with a lowercase letter makes
      // it HTML element ID friendly.
      var letter = 'c', // hard-coded allows for sequential access

        // timestamp
        // warning: this exposes the exact date and time
        // that the uid was created.
        timestamp = (new Date().getTime()).toString(base),

        // Prevent same-machine collisions.
        counter,

        // A few chars to generate distinct ids for different
        // clients (so different computers are far less
        // likely to generate the same id)
        fingerprint = api.fingerprint(),

        // Grab some more chars from Math.random()
        random = randomBlock() + randomBlock();

        counter = pad(safeCounter().toString(base), blockSize);

      return  (letter + timestamp + counter + fingerprint + random);
    };

  api.slug = function slug() {
    var date = new Date().getTime().toString(36),
      counter,
      print = api.fingerprint().slice(0,1) +
        api.fingerprint().slice(-1),
      random = randomBlock().slice(-2);

      counter = safeCounter().toString(36).slice(-4);

    return date.slice(-2) + 
      counter + print + random;
  };

  api.globalCount = function globalCount() {
    // We want to cache the results of this
    var cache = (function calc() {
        var i,
          count = 0;

        for (i in window) {
          count++;
        }

        return count;
      }());

    api.globalCount = function () { return cache; };
    return cache;
  };

  api.fingerprint = function browserPrint() {
    return pad((navigator.mimeTypes.length +
      navigator.userAgent.length).toString(36) +
      api.globalCount().toString(36), 4);
  };

  // don't change anything from here down.
  if (app.register) {
    app.register(namespace, api);
  } else if (typeof module !== 'undefined') {
    module.exports = api;
  } else {
    app[namespace] = api;
  }

}(this.applitude || this));

},{}],10:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":41}],11:[function(require,module,exports){
module.exports=require(3)
},{}],12:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],13:[function(require,module,exports){
var inherits = require("inherits")

var ALL_PROPS = [
    "altKey", "bubbles", "cancelable", "ctrlKey",
    "eventPhase", "metaKey", "relatedTarget", "shiftKey",
    "target", "timeStamp", "type", "view", "which"
]
var KEY_PROPS = ["char", "charCode", "key", "keyCode"]
var MOUSE_PROPS = [
    "button", "buttons", "clientX", "clientY", "layerX",
    "layerY", "offsetX", "offsetY", "pageX", "pageY",
    "screenX", "screenY", "toElement"
]

var rkeyEvent = /^key|input/
var rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/

module.exports = ProxyEvent

function ProxyEvent(ev, listener) {
    if (!(this instanceof ProxyEvent)) {
        return new ProxyEvent(ev, listener)
    }

    if (rkeyEvent.test(ev.type)) {
        return new KeyEvent(ev, listener)
    } else if (rmouseEvent.test(ev.type)) {
        return new MouseEvent(ev, listener)
    }

    for (var i = 0; i < ALL_PROPS.length; i++) {
        var propKey = ALL_PROPS[i]
        this[propKey] = ev[propKey]
    }

    this._rawEvent = ev
    this.currentTarget = listener ? listener.currentTarget : null
}

ProxyEvent.prototype.preventDefault = function () {
    this._rawEvent.preventDefault()
}

function MouseEvent(ev, listener) {
    for (var i = 0; i < ALL_PROPS.length; i++) {
        var propKey = ALL_PROPS[i]
        this[propKey] = ev[propKey]
    }

    for (var j = 0; j < MOUSE_PROPS.length; j++) {
        var mousePropKey = MOUSE_PROPS[j]
        this[mousePropKey] = ev[mousePropKey]
    }

    this._rawEvent = ev
    this.currentTarget = listener ? listener.currentTarget : null
}

inherits(MouseEvent, ProxyEvent)

function KeyEvent(ev, listener) {
    for (var i = 0; i < ALL_PROPS.length; i++) {
        var propKey = ALL_PROPS[i]
        this[propKey] = ev[propKey]
    }

    for (var j = 0; j < KEY_PROPS.length; j++) {
        var keyPropKey = KEY_PROPS[j]
        this[keyPropKey] = ev[keyPropKey]
    }

    this._rawEvent = ev
    this.currentTarget = listener ? listener.currentTarget : null
}

inherits(KeyEvent, ProxyEvent)

},{"inherits":12}],14:[function(require,module,exports){
var DataSet = require("data-set")

module.exports = removeEvent

function removeEvent(target, type, handler) {
    var ds = DataSet(target)
    var events = ds[type]

    if (!events) {
        return
    } else if (Array.isArray(events)) {
        var index = events.indexOf(handler)
        if (index !== -1) {
            events.splice(index, 1)
        }
    } else if (events === handler) {
        ds[type] = null
    }
}

},{"data-set":2}],15:[function(require,module,exports){
var createElement = require("./vdom/create-element")

module.exports = createElement

},{"./vdom/create-element":22}],16:[function(require,module,exports){
var diff = require("./vtree/diff")

module.exports = diff

},{"./vtree/diff":27}],17:[function(require,module,exports){
if (typeof document !== "undefined") {
    module.exports = document;
} else {
    module.exports = require("min-document");
}

},{"min-document":41}],18:[function(require,module,exports){
module.exports = isObject

function isObject(x) {
    return typeof x === "object" && x !== null
}

},{}],19:[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],20:[function(require,module,exports){
var patch = require("./vdom/patch")

module.exports = patch

},{"./vdom/patch":25}],21:[function(require,module,exports){
var isObject = require("is-object")

var isHook = require("../vtree/is-vhook")

module.exports = applyProperties

function applyProperties(node, props, previous) {
    for (var propName in props) {
        var propValue = props[propName]

        if (isHook(propValue)) {
            propValue.hook(node,
                propName,
                previous ? previous[propName] : undefined)
        } else {
            if (isObject(propValue)) {
                if (!isObject(node[propName])) {
                    node[propName] = {}
                }

                for (var k in propValue) {
                    node[propName][k] = propValue[k]
                }
            } else if (propValue !== undefined) {
                node[propName] = propValue
            }
        }
    }
}

},{"../vtree/is-vhook":28,"is-object":18}],22:[function(require,module,exports){
var document = require("global/document")

var applyProperties = require("./apply-properties")

var isVNode = require("../vtree/is-vnode")
var isVText = require("../vtree/is-vtext")
var isWidget = require("../vtree/is-widget")

module.exports = createElement

function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document
    var warn = opts ? opts.warn : null

    if (isWidget(vnode)) {
        return vnode.init()
    } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text)
    } else if (!isVNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode)
        }
        return null
    }

    var node = (vnode.namespace === null) ?
        doc.createElement(vnode.tagName) :
        doc.createElementNS(vnode.namespace, vnode.tagName)

    var props = vnode.properties
    applyProperties(node, props)

    var children = vnode.children

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts)
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node
}

},{"../vtree/is-vnode":29,"../vtree/is-vtext":30,"../vtree/is-widget":31,"./apply-properties":21,"global/document":17}],23:[function(require,module,exports){
// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

var noChild = {}

module.exports = domIndex

function domIndex(rootNode, tree, indices, nodes) {
    if (!indices || indices.length === 0) {
        return {}
    } else {
        indices.sort(ascending)
        return recurse(rootNode, tree, indices, nodes, 0)
    }
}

function recurse(rootNode, tree, indices, nodes, rootIndex) {
    nodes = nodes || {}


    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode
        }

        var vChildren = tree.children

        if (vChildren) {

            var childNodes = rootNode.childNodes

            for (var i = 0; i < tree.children.length; i++) {
                rootIndex += 1

                var vChild = vChildren[i] || noChild
                var nextIndex = rootIndex + (vChild.count || 0)

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex)
                }

                rootIndex = nextIndex
            }
        }
    }

    return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false
    }

    var minIndex = 0
    var maxIndex = indices.length - 1
    var currentIndex
    var currentItem

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0
        currentItem = indices[currentIndex]

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right
        } else if (currentItem < left) {
            minIndex = currentIndex + 1
        } else  if (currentItem > right) {
            maxIndex = currentIndex - 1
        } else {
            return true
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1
}

},{}],24:[function(require,module,exports){
var applyProperties = require("./apply-properties")

var isWidget = require("../vtree/is-widget")
var VPatch = require("../vtree/vpatch")

var render = require("./create-element")
var updateWidget = require("./update-widget")

module.exports = applyPatch

function applyPatch(vpatch, domNode, renderOptions) {
    var type = vpatch.type
    var vNode = vpatch.vNode
    var patch = vpatch.patch

    switch (type) {
        case VPatch.REMOVE:
            return removeNode(domNode, vNode)
        case VPatch.INSERT:
            return insertNode(domNode, patch, renderOptions)
        case VPatch.VTEXT:
            return stringPatch(domNode, vNode, patch, renderOptions)
        case VPatch.WIDGET:
            return widgetPatch(domNode, vNode, patch, renderOptions)
        case VPatch.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions)
        case VPatch.ORDER:
            reorderChildren(domNode, patch)
            return domNode
        case VPatch.PROPS:
            applyProperties(domNode, patch, vNode.propeties)
            return domNode
        default:
            return domNode
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode

    if (parentNode) {
        parentNode.removeChild(domNode)
    }

    destroyWidget(domNode, vNode);

    return null
}

function insertNode(parentNode, vNode, renderOptions) {
    var newNode = render(vNode, renderOptions)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function stringPatch(domNode, leftVNode, vText, renderOptions) {
    var newNode

    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, vText.text)
        newNode = domNode
    } else {
        var parentNode = domNode.parentNode
        newNode = render(vText, renderOptions)

        if (parentNode) {
            parentNode.replaceChild(newNode, domNode)
        }
    }

    destroyWidget(domNode, leftVNode)

    return newNode
}

function widgetPatch(domNode, leftVNode, widget, renderOptions) {
    if (updateWidget(leftVNode, widget)) {
        return widget.update(leftVNode, domNode) || domNode
    }

    var parentNode = domNode.parentNode
    var newWidget = render(widget, renderOptions)

    if (parentNode) {
        parentNode.replaceChild(newWidget, domNode)
    }

    destroyWidget(domNode, leftVNode)

    return newWidget
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
    var parentNode = domNode.parentNode
    var newNode = render(vNode, renderOptions)

    if (parentNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    destroyWidget(domNode, leftVNode)

    return newNode
}

function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode)
    }
}

function reorderChildren(domNode, bIndex) {
    var children = []
    var childNodes = domNode.childNodes
    var len = childNodes.length
    var i

    for (i = 0; i < len; i++) {
        children.push(domNode.childNodes[i])
    }

    for (i = 0; i < len; i++) {
        var move = bIndex[i]
        if (move !== undefined) {
            var node = children[move]
            domNode.removeChild(node)
            domNode.insertBefore(node, childNodes[i])
        }
    }
}

},{"../vtree/is-widget":31,"../vtree/vpatch":33,"./apply-properties":21,"./create-element":22,"./update-widget":26}],25:[function(require,module,exports){
var document = require("global/document")
var isArray = require("x-is-array")

var domIndex = require("./dom-index")
var patchOp = require("./patch-op")

module.exports = patch

function patch(rootNode, patches) {
    var indices = patchIndices(patches)

    if (indices.length === 0) {
        return rootNode
    }

    var index = domIndex(rootNode, patches.a, indices)
    var ownerDocument = rootNode.ownerDocument
    var renderOptions

    if (ownerDocument !== document) {
        renderOptions = {
            document: ownerDocument
        }
    }

    for (var i = 0; i < indices.length; i++) {
        var nodeIndex = indices[i]
        rootNode = applyPatch(rootNode,
            index[nodeIndex],
            patches[nodeIndex],
            renderOptions)
    }

    return rootNode
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
    if (!domNode) {
        return rootNode
    }

    var newNode

    if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], domNode, renderOptions)

            if (domNode === rootNode) {
                rootNode = newNode
            }
        }
    } else {
        newNode = patchOp(patchList, domNode, renderOptions)

        if (domNode === rootNode) {
            rootNode = newNode
        }
    }

    return rootNode
}

function patchIndices(patches) {
    var indices = []

    for (var key in patches) {
        if (key !== "a") {
            indices.push(Number(key))
        }
    }

    return indices
}

},{"./dom-index":23,"./patch-op":24,"global/document":17,"x-is-array":19}],26:[function(require,module,exports){
var isWidget = require("../vtree/is-widget")

module.exports = updateWidget

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("type" in a && "type" in b) {
            return a.type === b.type
        } else {
            return a.init === b.init
        }
    }

    return false
}

},{"../vtree/is-widget":31}],27:[function(require,module,exports){
var isArray = require("x-is-array")
var isObject = require("is-object")

var VPatch = require("./vpatch")
var isVNode = require("./is-vnode")
var isVText = require("./is-vtext")
var isWidget = require("./is-widget")

module.exports = diff

function diff(a, b) {
    var patch = { a: a }
    walk(a, b, patch, 0)
    return patch
}

function walk(a, b, patch, index) {
    if (a === b) {
        hooks(b, patch, index)
        return
    }

    var apply = patch[index]

    if (isWidget(b)) {
        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))

        if (!isWidget(a)) {
            destroyWidgets(a, patch, index)
        }
    } else if (isVText(b)) {
        if (!isVText(a)) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
            destroyWidgets(a, patch, index)
        } else if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
        }
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName &&
                a.namespace === b.namespace &&
                a.key === b.key) {
                var propsPatch = diffProps(a.properties, b.properties, b.hooks)
                if (propsPatch) {
                    apply = appendPatch(apply,
                        new VPatch(VPatch.PROPS, a, propsPatch))
                }
            } else {
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
                destroyWidgets(a, patch, index)
            }

            apply = diffChildren(a, b, patch, apply, index)
        } else {
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
            destroyWidgets(a, patch, index)
        }
    } else if (b == null) {
        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
        destroyWidgets(a, patch, index)
    }

    if (apply) {
        patch[index] = apply
    }
}

function diffProps(a, b, hooks) {
    var diff

    for (var aKey in a) {
        if (!(aKey in b)) {
            continue
        }

        var aValue = a[aKey]
        var bValue = b[aKey]

        if (hooks && aKey in hooks) {
            diff = diff || {}
            diff[aKey] = bValue
        } else {
            if (isObject(aValue) && isObject(bValue)) {
                if (getPrototype(bValue) !== getPrototype(aValue)) {
                    diff = diff || {}
                    diff[aKey] = bValue
                } else {
                    var objectDiff = diffProps(aValue, bValue)
                    if (objectDiff) {
                        diff = diff || {}
                        diff[aKey] = objectDiff
                    }
                }
            } else if (aValue !== bValue && bValue !== undefined) {
                diff = diff || {}
                diff[aKey] = bValue
            }
        }
    }

    for (var bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {}
            diff[bKey] = b[bKey]
        }
    }

    return diff
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children
    var bChildren = reorder(aChildren, b.children)

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i]
        var rightNode = bChildren[i]
        index += 1

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply, new VPatch(VPatch.INSERT, null, rightNode))
            }
        } else if (!rightNode) {
            if (leftNode) {
                // Excess nodes in a need to be removed
                patch[index] = new VPatch(VPatch.REMOVE, leftNode, null)
                destroyWidgets(leftNode, patch, index)
            }
        } else {
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    if (bChildren.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(VPatch.ORDER, a, bChildren.moves))
    }

    return apply
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = new VPatch(VPatch.REMOVE, vNode, null)
        }
    } else if (isVNode(vNode) && vNode.hasWidgets) {
        var children = vNode.children
        var len = children.length
        for (var i = 0; i < len; i++) {
            var child = children[i]
            index += 1

            destroyWidgets(child, patch, index)

            if (isVNode(child) && child.count) {
                index += child.count
            }
        }
    }
}

// Execute hooks when two nodes are identical
function hooks(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = new VPatch(VPatch.PROPS, vNode.hooks, vNode.hooks)
        }

        if (vNode.descendantHooks) {
            var children = vNode.children
            var len = children.length
            for (var i = 0; i < len; i++) {
                var child = children[i]
                index += 1

                hooks(child, patch, index)

                if (isVNode(child) && child.count) {
                    index += child.count
                }
            }
        }
    }
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren) {

    var bKeys = keyIndex(bChildren)

    if (!bKeys) {
        return bChildren
    }

    var aKeys = keyIndex(aChildren)

    if (!aKeys) {
        return bChildren
    }

    var bMatch = {}, aMatch = {}

    for (var key in bKeys) {
        bMatch[bKeys[key]] = aKeys[key]
    }

    for (var key in aKeys) {
        aMatch[aKeys[key]] = bKeys[key]
    }

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen
    var shuffle = []
    var freeIndex = 0
    var i = 0
    var moveIndex = 0
    var moves = shuffle.moves = {}

    while (freeIndex < len) {
        var move = aMatch[i]
        if (move !== undefined) {
            shuffle[i] = bChildren[move]
            moves[move] = moveIndex++
        } else if (i in aMatch) {
            shuffle[i] = undefined
        } else {
            while (bMatch[freeIndex] !== undefined) {
                freeIndex++
            }

            if (freeIndex < len) {
                moves[freeIndex] = moveIndex++
                shuffle[i] = bChildren[freeIndex]
                freeIndex++
            }
        }
        i++
    }

    return shuffle
}

function keyIndex(children) {
    var i, keys

    for (i = 0; i < children.length; i++) {
        var child = children[i]

        if (child.key !== undefined) {
            keys = keys || {}
            keys[child.key] = i
        }
    }

    return keys
}

function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.push(patch)
        } else {
            apply = [apply, patch]
        }

        return apply
    } else {
        return patch
    }
}

},{"./is-vnode":29,"./is-vtext":30,"./is-widget":31,"./vpatch":33,"is-object":18,"x-is-array":19}],28:[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook && typeof hook.hook === "function" &&
        !hook.hasOwnProperty("hook")
}

},{}],29:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    if (!x) {
        return false;
    }

    return x.type === "VirtualNode" && x.version === version
}

},{"./version":32}],30:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualText

function isVirtualText(x) {
    if (!x) {
        return false;
    }

    return x.type === "VirtualText" && x.version === version
}

},{"./version":32}],31:[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && typeof w.init === "function" && typeof w.update === "function"
}

},{}],32:[function(require,module,exports){
module.exports = "1"

},{}],33:[function(require,module,exports){
var version = require("./version")

VirtualPatch.NONE = 0
VirtualPatch.VTEXT = 1
VirtualPatch.VNODE = 2
VirtualPatch.WIDGET = 3
VirtualPatch.PROPS = 4
VirtualPatch.ORDER = 5
VirtualPatch.INSERT = 6
VirtualPatch.REMOVE = 7

module.exports = VirtualPatch

function VirtualPatch(type, vNode, patch) {
    this.type = Number(type)
    this.vNode = vNode
    this.patch = patch
}

VirtualPatch.prototype.version = version.split(".")
VirtualPatch.prototype.type = "VirtualPatch"

},{"./version":32}],34:[function(require,module,exports){
module.exports=require(28)
},{}],35:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

},{"./version":37}],36:[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}

},{}],37:[function(require,module,exports){
module.exports=require(32)
},{}],38:[function(require,module,exports){
var version = require("./version")
var isVNode = require("./is-vnode")
var isWidget = require("./is-widget")
var isVHook = require("./is-vhook")

module.exports = VirtualNode

var noProperties = {}
var noChildren = []

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName
    this.properties = properties || noProperties
    this.children = children || noChildren
    this.key = key != null ? String(key) : undefined
    this.namespace = (typeof namespace === "string") ? namespace : null

    var count = (children && children.length) || 0
    var descendants = 0
    var hasWidgets = false
    var descendantHooks = false
    var hooks

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName]
            if (isVHook(property)) {
                if (!hooks) {
                    hooks = {}
                }

                hooks[propName] = property
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isVNode(child)) {
            descendants += child.count || 0

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true
            }
        }
    }

    this.count = count + descendants
    this.hasWidgets = hasWidgets
    this.hooks = hooks
    this.descendantHooks = descendantHooks
}

VirtualNode.prototype.version = version
VirtualNode.prototype.type = "VirtualNode"

},{"./is-vhook":34,"./is-vnode":35,"./is-widget":36,"./version":37}],39:[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":37}],40:[function(require,module,exports){

var VNode = require('vtree/vnode');
var VText = require('vtree/vtext');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var DataSet = require("data-set");
var Delegator = require("dom-delegator");
var isHook = require("vtree/is-vhook");

Elm.Native.Html = {};
Elm.Native.Html.make = function(elm) {
    elm.Native = elm.Native || {};
    elm.Native.Html = elm.Native.Html || {};
    if (elm.Native.Html.values) return elm.Native.Html.values;
    if ('values' in Elm.Native.Html)
        return elm.Native.Html.values = Elm.Native.Html.values;

    // This manages event listeners. Somehow...
    Delegator();

    var RenderUtils = ElmRuntime.use(ElmRuntime.Render.Utils);
    var newElement = Elm.Graphics.Element.make(elm).newElement;
    var Utils = Elm.Native.Utils.make(elm);
    var List = Elm.Native.List.make(elm);
    var Maybe = Elm.Maybe.make(elm);
    var eq = Elm.Native.Utils.make(elm).eq;

    function listToObject(list) {
        var object = {};
        while (list.ctor !== '[]') {
            var entry = list._0;
            object[entry.key] = entry.value;
            list = list._1;
        }
        return object;
    }

    function node(name, attributes, contents) {
        var attrs = listToObject(attributes);

        // ensure that setting text of an input does not move the cursor
        var useSoftSet =
            name === 'input'
            && 'value' in attrs
            && attrs.value !== undefined
            && !isHook(attrs.value);

        if (useSoftSet) {
            attrs.value = SoftSetHook(attrs.value);
        }

        return new VNode(name, attrs, List.toArray(contents));
    }

    function pair(key, value) {
        return {
            key: key,
            value: value
        };
    }

    function style(properties) {
        return pair('style', listToObject(properties));
    }

    function on(name, coerce) {
        function createListener(handle, convert) {
            function eventHandler(event) {
                var value = coerce(event);
                if (value.ctor === 'Just') {
                    elm.notify(handle.id, convert(value._0));
                }
            }
            return pair(name, DataSetHook(eventHandler));
        }
        return F2(createListener);
    }

    function filterMap(f, getter) {
        return function(event) {
            var maybeValue = getter(event);
            return maybeValue.ctor === 'Nothing' ? maybeValue : f(maybeValue._0);
        };
    }
    function getMouseEvent(event) {
        return !('button' in event) ?
            Maybe.Nothing :
            Maybe.Just({
                _: {},
                button: event.button,
                altKey: event.altKey,
                ctrlKey: event.ctrlKey,
                metaKey: event.metaKey,
                shiftKey: event.shiftKey
            });
    }
    function getKeyboardEvent(event) {
        return !('keyCode' in event) ?
            Maybe.Nothing :
            Maybe.Just({
                _: {},
                keyCode: event.keyCode,
                altKey: event.altKey,
                ctrlKey: event.ctrlKey,
                metaKey: event.metaKey,
                shiftKey: event.shiftKey
            });
    }
    function getChecked(event) {
        return 'checked' in event.target ?
            Maybe.Just(event.target.checked) :
            Maybe.Nothing;
    }
    function getValue(event) {
        var node = event.target;
        return 'value' in node ?
            Maybe.Just(event.target.value) :
            Maybe.Nothing;
    }
    function getValueAndSelection(event) {
        var node = event.target;
        return !('selectionStart' in node) ?
            Maybe.Nothing :
            Maybe.Just({
                _: {},
                value: node.value,
                selection: {
                    start: node.selectionStart,
                    end: node.selectionEnd,
                    direction: {
                        ctor: node.selectionDirection === 'forward' ? 'Forward' : 'Backward'
                    }
                }
            });
    }
    function getAnything(event) {
        return Maybe.Just(Utils._Tuple0);
    }

    function DataSetHook(value) {
        if (!(this instanceof DataSetHook)) {
            return new DataSetHook(value);
        }

        this.value = value;
    }

    DataSetHook.prototype.hook = function (node, propertyName) {
        var ds = DataSet(node);
        ds[propertyName] = this.value;
    };


    function SoftSetHook(value) {
      if (!(this instanceof SoftSetHook)) {
        return new SoftSetHook(value);
      }

      this.value = value;
    }

    SoftSetHook.prototype.hook = function (node, propertyName) {
      if (node[propertyName] !== this.value) {
        node[propertyName] = this.value;
      }
    };

    function text(string) {
        return new VText(string);
    }

    function toElement(width, height, html) {
        return A3(newElement, width, height,
                  { ctor: 'Custom'
                  , type: 'evancz/elm-html'
                  , render: render
                  , update: update
                  , model: html
                  });
    }

    function render(model) {
        var element = RenderUtils.newElement('div');
        element.appendChild(createElement(model));
        return element;
    }

    function update(node, oldModel, newModel) {
        var patches = diff(oldModel, newModel);
        var newNode = patch(node.firstChild, patches)
        if (newNode !== node.firstChild) {
            node.replaceChild(newNode, node.firstChild)
        }
    }

    function lazyRef(fn, a) {
        function thunk() {
            return fn(a);
        }
        return new Thunk('ref', fn, [a], thunk, shouldUpdate_refEq);
    }

    function lazyRef2(fn, a, b) {
        function thunk() {
            return A2(fn, a, b);
        }
        return new Thunk('ref', fn, [a,b], thunk, shouldUpdate_refEq);
    }

    function lazyRef3(fn, a, b, c) {
        function thunk() {
            return A3(fn, a, b, c);
        }
        return new Thunk('ref', fn, [a,b,c], thunk, shouldUpdate_refEq);
    }

    function lazyStruct(fn, a) {
        function thunk() {
            return fn(a);
        }
        return new Thunk('struct', fn, [a], thunk, shouldUpdate_structEq);
    }

    function lazyStruct2(fn, a, b) {
        function thunk() {
            return A2(fn, a, b);
        }
        return new Thunk('struct', fn, [a,b], thunk, shouldUpdate_structEq);
    }

    function lazyStruct3(fn, a, b, c) {
        function thunk() {
            return A3(fn, a, b, c);
        }
        return new Thunk('struct', fn, [a,b,c], thunk, shouldUpdate_structEq);
    }

    function Thunk(kind, fn, args, thunk, shouldUpdate) {
        this.fn = fn;
        this.args = args;
        this.vnode = null;
        this.key = undefined;
        this.thunk = thunk;

        this.kind = kind;
        this.shouldUpdate = shouldUpdate;
    }

    Thunk.prototype.type = "immutable-thunk";
    Thunk.prototype.update = updateThunk;
    Thunk.prototype.init = initThunk;

    function shouldUpdate_refEq(current, previous) {
        if (current.kind !== previous.kind || current.fn !== previous.fn) {
            return true;
        }

        // if it's the same function, we know the number of args must match
        var cargs = current.args;
        var pargs = previous.args;

        for (var i = cargs.length; i--; ) {
            if (cargs[i] !== pargs[i]) {
                return true;
            }
        }

        return false;
    }

    function shouldUpdate_structEq(current, previous) {
        if (current.kind !== previous.kind || current.fn !== previous.fn) {
            return true;
        }

        // if it's the same function, we know the number of args must match
        var cargs = current.args;
        var pargs = previous.args;

        for (var i = cargs.length; i--; ) {
            if (eq(cargs[i], pargs[i])) {
                return true;
            }
        }

        return false;
    }

    function updateThunk(previous, domNode) {
        if (!this.shouldUpdate(this, previous)) {
            this.vnode = previous.vnode;
            return;
        }

        if (!this.vnode) {
            this.vnode = this.thunk();
        }

        var patches = diff(previous.vnode, this.vnode);
        patch(domNode, patches);
    }

    function initThunk() {
        this.vnode = this.thunk();
        return createElement(this.vnode);
    }

    return Elm.Native.Html.values = {
        node: F3(node),
        text: text,
        style: style,
        on: F2(on),

        pair: F2(pair),

        getMouseEvent: getMouseEvent,
        getKeyboardEvent: getKeyboardEvent,
        getChecked: getChecked,
        getValue: getValue,
        getValueAndSelection: getValueAndSelection,
        getAnything: getAnything,
        filterMap: F2(filterMap),

        lazyRef : F2(lazyRef ),
        lazyRef2: F3(lazyRef2),
        lazyRef3: F4(lazyRef3),
        lazyStruct : F2(lazyStruct ),
        lazyStruct2: F3(lazyStruct2),
        lazyStruct3: F4(lazyStruct3),
        toElement: F3(toElement)
    };
};

},{"data-set":2,"dom-delegator":8,"virtual-dom/create-element":15,"virtual-dom/diff":16,"virtual-dom/patch":20,"vtree/is-vhook":34,"vtree/vnode":38,"vtree/vtext":39}],41:[function(require,module,exports){

},{}]},{},[40]);
Elm.LanguageQuiz = Elm.LanguageQuiz || {};
Elm.LanguageQuiz.make = function (_elm) {
   "use strict";
   _elm.LanguageQuiz = _elm.LanguageQuiz || {};
   if (_elm.LanguageQuiz.values)
   return _elm.LanguageQuiz.values;
   var _op = {},
   _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "LanguageQuiz",
   $Array = Elm.Array.make(_elm),
   $Basics = Elm.Basics.make(_elm),
   $Debug = Elm.Debug.make(_elm),
   $Graphics$Element = Elm.Graphics.Element.make(_elm),
   $Graphics$Input = Elm.Graphics.Input.make(_elm),
   $Html = Elm.Html.make(_elm),
   $Html$Attributes = Elm.Html.Attributes.make(_elm),
   $Html$Events = Elm.Html.Events.make(_elm),
   $Html$Tags = Elm.Html.Tags.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $String = Elm.String.make(_elm),
   $Window = Elm.Window.make(_elm);
   var moveToPreviousQuestion = function (q) {
      return _U.replace([["currentQuestion"
                         ,q.currentQuestion - 1]],
      q);
   };
   var moveToNextQuestion = function (q) {
      return _U.replace([["currentQuestion"
                         ,q.currentQuestion + 1]],
      q);
   };
   var Answer = function (a) {
      return {ctor: "Answer"
             ,_0: a};
   };
   var Finish = {ctor: "Finish"};
   var ChangeTab = function (a) {
      return {ctor: "ChangeTab"
             ,_0: a};
   };
   var PreviousQuestion = {ctor: "PreviousQuestion"};
   var NextQuestion = {ctor: "NextQuestion"};
   var NoOp = {ctor: "NoOp"};
   var actions = $Graphics$Input.input(NoOp);
   var question = function (q) {
      return function () {
         var box = F2(function (c,g) {
            return A2($Html$Tags.input,
            _L.fromArray([A2($Html.attr,
                         "type",
                         "radio")
                         ,$Html$Attributes.name("answer")
                         ,$Html$Attributes.id(c)
                         ,$Html$Attributes.value(c)
                         ,$Html$Attributes.checked(_U.eq(c,
                         q.qGuess))
                         ,A2($Html$Events.onclick,
                         actions.handle,
                         function (_v0) {
                            return function () {
                               return Answer(c);
                            }();
                         })]),
            _L.fromArray([]));
         });
         var makeTD = F2(function (g,c) {
            return A2($Html$Tags.td,
            _L.fromArray([$Html$Attributes.$class("choice")]),
            _L.fromArray([A2($Html$Tags.label,
            _L.fromArray([$Html$Attributes.id("answer0Label")
                         ,$Html$Attributes.$for(c)]),
            _L.fromArray([$Html.text(c)
                         ,A2($Html$Tags.br,
                         _L.fromArray([]),
                         _L.fromArray([]))
                         ,A2(box,c,g)]))]));
         });
         var tds = $List.map(makeTD(q.qGuess))(q.qChoices);
         return A2($Html$Tags.div,
         _L.fromArray([$Html$Attributes.id("questionText")]),
         _L.fromArray([$Html.text(_L.append("What is the ",
                      _L.append($String.show(q.qLanguage),
                      _L.append(" word for ",
                      _L.append(q.qText,"?")))))
                      ,A2($Html$Tags.table,
                      _L.fromArray([$Html.style(_L.fromArray([A2($Html.prop,
                      "margin-bottom",
                      "5px")]))]),
                      _L.fromArray([A2($Html$Tags.tr,
                      _L.fromArray([]),
                      tds)]))]));
      }();
   };
   var Question = F5(function (a,
   b,
   c,
   d,
   e) {
      return {_: {}
             ,qAnswer: d
             ,qChoices: c
             ,qGuess: e
             ,qLanguage: a
             ,qText: b};
   });
   var Latin = {ctor: "Latin"};
   var Japanese = {ctor: "Japanese"};
   var English = {ctor: "English"};
   var questionsL = _L.fromArray([{_: {}
                                  ,qAnswer: "Nox"
                                  ,qChoices: _L.fromArray(["Iudex"
                                                          ,"Nox"
                                                          ,"Dies"])
                                  ,qGuess: ""
                                  ,qLanguage: Latin
                                  ,qText: "night"}
                                 ,{_: {}
                                  ,qAnswer: "Dies"
                                  ,qChoices: _L.fromArray(["Canis"
                                                          ,"Agricola"
                                                          ,"Dies"])
                                  ,qGuess: ""
                                  ,qLanguage: Latin
                                  ,qText: "day"}
                                 ,{_: {}
                                  ,qAnswer: "Ignis"
                                  ,qChoices: _L.fromArray(["Ignis"
                                                          ,"Puer"
                                                          ,"Puella"])
                                  ,qGuess: ""
                                  ,qLanguage: Latin
                                  ,qText: "fire"}
                                 ,{_: {}
                                  ,qAnswer: "Puer"
                                  ,qChoices: _L.fromArray(["Nox"
                                                          ,"Puer"
                                                          ,"Vir"])
                                  ,qGuess: ""
                                  ,qLanguage: Latin
                                  ,qText: "boy"}
                                 ,{_: {}
                                  ,qAnswer: "Puella"
                                  ,qChoices: _L.fromArray(["Puella"
                                                          ,"Femina"
                                                          ,"Virgis"])
                                  ,qGuess: ""
                                  ,qLanguage: Latin
                                  ,qText: "girl"}
                                 ,{_: {}
                                  ,qAnswer: "Neck"
                                  ,qChoices: _L.fromArray(["Column"
                                                          ,"Neck"
                                                          ,"Colon"])
                                  ,qGuess: ""
                                  ,qLanguage: English
                                  ,qText: "collum"}
                                 ,{_: {}
                                  ,qAnswer: "Trumpet"
                                  ,qChoices: _L.fromArray(["Trumpet"
                                                          ,"Tuba"
                                                          ,"Two"])
                                  ,qGuess: ""
                                  ,qLanguage: English
                                  ,qText: "tuba"}
                                 ,{_: {}
                                  ,qAnswer: "Beware"
                                  ,qChoices: _L.fromArray(["Cave"
                                                          ,"Cavern"
                                                          ,"Beware"])
                                  ,qGuess: ""
                                  ,qLanguage: English
                                  ,qText: "cave"}
                                 ,{_: {}
                                  ,qAnswer: "Art"
                                  ,qChoices: _L.fromArray(["Ass"
                                                          ,"Arc"
                                                          ,"Art"])
                                  ,qGuess: ""
                                  ,qLanguage: English
                                  ,qText: "ars"}
                                 ,{_: {}
                                  ,qAnswer: "Voice"
                                  ,qChoices: _L.fromArray(["Voice"
                                                          ,"Volume"
                                                          ,"Voracious"])
                                  ,qGuess: ""
                                  ,qLanguage: English
                                  ,qText: "vox"}]);
   var latinQuiz = {_: {}
                   ,currentQuestion: 0
                   ,language: Latin
                   ,questions: questionsL};
   var latinTab = {_: {}
                  ,tLanguage: Latin
                  ,tQuiz: latinQuiz
                  ,tResults: false};
   var questionsJ = _L.fromArray([{_: {}
                                  ,qAnswer: "\\u3044\\u3061"
                                  ,qChoices: _L.fromArray(["\\u3044\\u3061"
                                                          ,"\\u306B"
                                                          ,"\\u3055\\u3093"])
                                  ,qGuess: ""
                                  ,qLanguage: Japanese
                                  ,qText: "one"}
                                 ,{_: {}
                                  ,qAnswer: "\\u306B"
                                  ,qChoices: _L.fromArray(["\\u3044\\u3061"
                                                          ,"\\u306B"
                                                          ,"\\u3055\\u3093"])
                                  ,qGuess: ""
                                  ,qLanguage: Japanese
                                  ,qText: "two"}
                                 ,{_: {}
                                  ,qAnswer: "\\u3055\\u3093"
                                  ,qChoices: _L.fromArray(["\\u3044\\u3061"
                                                          ,"\\u306B"
                                                          ,"\\u3055\\u3093"])
                                  ,qGuess: ""
                                  ,qLanguage: Japanese
                                  ,qText: "three"}
                                 ,{_: {}
                                  ,qAnswer: "\\u3057"
                                  ,qChoices: _L.fromArray(["\\u3057"
                                                          ,"\\u3054"
                                                          ,"\\u308D\\u304F"])
                                  ,qGuess: ""
                                  ,qLanguage: Japanese
                                  ,qText: "four"}
                                 ,{_: {}
                                  ,qAnswer: "\\u3054"
                                  ,qChoices: _L.fromArray(["\\u3057"
                                                          ,"\\u3054"
                                                          ,"\\u308D\\u304F"])
                                  ,qGuess: ""
                                  ,qLanguage: Japanese
                                  ,qText: "five"}
                                 ,{_: {}
                                  ,qAnswer: "six"
                                  ,qChoices: _L.fromArray(["four"
                                                          ,"five"
                                                          ,"six"])
                                  ,qGuess: ""
                                  ,qLanguage: English
                                  ,qText: "\\u308D\\u304F"}
                                 ,{_: {}
                                  ,qAnswer: "seven"
                                  ,qChoices: _L.fromArray(["seven"
                                                          ,"eight"
                                                          ,"nine"])
                                  ,qGuess: ""
                                  ,qLanguage: English
                                  ,qText: "\\u3057\\u3061"}
                                 ,{_: {}
                                  ,qAnswer: "eight"
                                  ,qChoices: _L.fromArray(["seven"
                                                          ,"eight"
                                                          ,"nine"])
                                  ,qGuess: ""
                                  ,qLanguage: English
                                  ,qText: "\\u306F\\u3061"}
                                 ,{_: {}
                                  ,qAnswer: "nine"
                                  ,qChoices: _L.fromArray(["seven"
                                                          ,"eight"
                                                          ,"nine"])
                                  ,qGuess: ""
                                  ,qLanguage: English
                                  ,qText: "\\u304F"}
                                 ,{_: {}
                                  ,qAnswer: "ten"
                                  ,qChoices: _L.fromArray(["ten"
                                                          ,"eleven"
                                                          ,"twelve"])
                                  ,qGuess: ""
                                  ,qLanguage: English
                                  ,qText: "\\u3058\\u3085\\u3046"}]);
   var japaneseQuiz = {_: {}
                      ,currentQuestion: 0
                      ,language: Japanese
                      ,questions: questionsJ};
   var japaneseTab = {_: {}
                     ,tLanguage: Japanese
                     ,tQuiz: japaneseQuiz
                     ,tResults: false};
   var englishQuiz = {_: {}
                     ,currentQuestion: 0
                     ,language: English
                     ,questions: _L.fromArray([])};
   var introTab = {_: {}
                  ,tLanguage: English
                  ,tQuiz: englishQuiz
                  ,tResults: false};
   var initialState = {_: {}
                      ,currentTab: introTab};
   var startingState = initialState;
   var Quiz = F3(function (a,b,c) {
      return {_: {}
             ,currentQuestion: a
             ,language: b
             ,questions: c};
   });
   var Tab = F3(function (a,b,c) {
      return {_: {}
             ,tLanguage: a
             ,tQuiz: b
             ,tResults: c};
   });
   var State = function (a) {
      return {_: {},currentTab: a};
   };
   var nth = F2(function (n,xs) {
      return $Array.get(n)($Array.fromList(xs));
   });
   var step = F2(function (action,
   s) {
      return function () {
         var newQuestion = F3(function (n,
         qs,
         answer) {
            return function () {
               var q = function () {
                  var _v2 = A2(nth,n,qs);
                  switch (_v2.ctor)
                  {case "Just": return _v2._0;
                     case "Nothing": return {_: {}
                                            ,qAnswer: ""
                                            ,qChoices: _L.fromArray([])
                                            ,qGuess: ""
                                            ,qLanguage: English
                                            ,qText: ""};}
                  _E.Case($moduleName,
                  "between lines 121 and 124");
               }();
               return _U.replace([["qGuess"
                                  ,answer]],
               q);
            }();
         });
         var setGuess = F3(function (n,
         qs,
         answer) {
            return function () {
               var q = A3(newQuestion,
               n,
               qs,
               answer);
               var qs$ = $Array.fromList(qs);
               return $Array.toList(A3($Array.set,
               n,
               q,
               qs$));
            }();
         });
         var answerQuestion = F2(function (quiz,
         answer) {
            return _U.replace([["questions"
                               ,A3(setGuess,
                               quiz.currentQuestion,
                               quiz.questions,
                               answer)]],
            quiz);
         });
         var saveAnswer = F2(function (t,
         answer) {
            return _U.replace([["tQuiz"
                               ,A2(answerQuestion,
                               t.tQuiz,
                               answer)]],
            t);
         });
         var finishTab = function (t) {
            return _U.replace([["tResults"
                               ,true]],
            t);
         };
         var updateTab = F2(function (f,
         t) {
            return _U.replace([["tQuiz"
                               ,f(t.tQuiz)]],
            t);
         });
         return function () {
            var _v4 = A2($Debug.watch,
            "Current action",
            action);
            switch (_v4.ctor)
            {case "Answer":
               return _U.replace([["currentTab"
                                  ,A2(saveAnswer,
                                  s.currentTab,
                                  _v4._0)]],
                 s);
               case "ChangeTab":
               return _U.replace([["currentTab"
                                  ,_v4._0]],
                 s);
               case "Finish":
               return _U.replace([["currentTab"
                                  ,finishTab(s.currentTab)]],
                 s);
               case "NextQuestion":
               return _U.replace([["currentTab"
                                  ,A2(updateTab,
                                  moveToNextQuestion,
                                  s.currentTab)]],
                 s);
               case "NoOp": return s;
               case "PreviousQuestion":
               return _U.replace([["currentTab"
                                  ,A2(updateTab,
                                  moveToPreviousQuestion,
                                  s.currentTab)]],
                 s);}
            _E.Case($moduleName,
            "between lines 125 and 131");
         }();
      }();
   });
   var state = A3($Signal.foldp,
   step,
   startingState,
   actions.signal);
   var tabs = function (s) {
      return function () {
         var isCorrect = function (q) {
            return _U.eq(q.qGuess,
            q.qAnswer);
         };
         var questionOrResults = function (t) {
            return function () {
               var qs = t.tQuiz.questions;
               var m = $String.show($List.length($List.filter(isCorrect)(qs)));
               var n = $String.show($List.length(qs));
               var txt = $Html.text(_L.append("You answered ",
               _L.append(m,
               _L.append(" out of ",
               _L.append(n,
               _L.append(" ",
               _L.append($String.show(t.tLanguage),
               " questions correctly.")))))));
               return t.tResults ? txt : function () {
                  var qz = t.tQuiz;
                  return function () {
                     var _v7 = A2(nth,
                     qz.currentQuestion,
                     qz.questions);
                     switch (_v7.ctor)
                     {case "Just":
                        return question(_v7._0);
                        case "Nothing": return txt;}
                     _E.Case($moduleName,
                     "between lines 165 and 168");
                  }();
               }();
            }();
         };
         var questionForm = function () {
            var qs = s.currentTab.tQuiz.questions;
            var c = s.currentTab.tQuiz.currentQuestion;
            var disablePrevious = $String.show(_U.cmp(c,
            0) > 0);
            var guess = function () {
               var _v9 = A2(nth,c,qs);
               switch (_v9.ctor)
               {case "Just":
                  return _v9._0.qGuess;
                  case "Nothing": return "";}
               _E.Case($moduleName,
               "between lines 173 and 176");
            }();
            var disableNext = $String.show(_U.cmp(c,
            $List.length(qs)) < 0 && !_U.eq(guess,
            ""));
            return A3($Html.node,
            "form",
            _L.fromArray([$Html$Attributes.id("form")]),
            _L.fromArray([A2($Html$Tags.div,
                         _L.fromArray([$Html$Attributes.id("question")]),
                         _L.fromArray([questionOrResults(s.currentTab)]))
                         ,A2($Html$Tags.input,
                         _L.fromArray([A2($Html.attr,
                                      "type",
                                      "button")
                                      ,$Html$Attributes.id("previous")
                                      ,$Html$Attributes.value("Previous")
                                      ,A2($Html.attr,
                                      "disabled",
                                      disablePrevious)]),
                         _L.fromArray([]))
                         ,A2($Html$Tags.input,
                         _L.fromArray([A2($Html.attr,
                                      "type",
                                      "submit")
                                      ,$Html$Attributes.id("next")
                                      ,$Html$Attributes.value("Next")
                                      ,A2($Html.attr,
                                      "disabled",
                                      disableNext)]),
                         _L.fromArray([]))
                         ,A2($Html$Tags.br,
                         _L.fromArray([]),
                         _L.fromArray([]))
                         ,A2($Html$Tags.progress,
                         _L.fromArray([$Html$Attributes.id("progress")
                                      ,$Html$Attributes.value("0")
                                      ,A2($Html.attr,"max","100")]),
                         _L.fromArray([]))]));
         }();
         var isActive = function (quizLanguage) {
            return _U.eq(s.currentTab.tQuiz.language,
            quizLanguage);
         };
         var tabPane = function (quizLanguage) {
            return _L.append("tab-pane",
            isActive(quizLanguage) ? " active" : "");
         };
         var activeLI = function (quizLanguage) {
            return isActive(quizLanguage) ? "active" : "inactive";
         };
         var makeLI = F4(function (quizLanguage,
         hRef,
         txt,
         t) {
            return A2($Html$Tags.li,
            _L.fromArray([$Html$Attributes.$class(activeLI(quizLanguage))]),
            _L.fromArray([A2($Html$Tags.a,
            _L.fromArray([$Html$Attributes.href(hRef)
                         ,A2($Html.attr,
                         "data-toggle",
                         "tab")
                         ,A2($Html$Events.onclick,
                         actions.handle,
                         function (_v11) {
                            return function () {
                               return ChangeTab(t);
                            }();
                         })]),
            _L.fromArray([$Html.text(txt)]))]));
         });
         return _L.fromArray([A2($Html$Tags.ul,
                             _L.fromArray([$Html$Attributes.$class("nav nav-tabs")
                                          ,$Html$Attributes.id("subjectTabs")]),
                             _L.fromArray([A4(makeLI,
                                          English,
                                          "#intro",
                                          "Introduction",
                                          introTab)
                                          ,A4(makeLI,
                                          Latin,
                                          "#latin",
                                          "Ancient Latin",
                                          latinTab)
                                          ,A4(makeLI,
                                          Japanese,
                                          "#japanese",
                                          "Japanese",
                                          japaneseTab)]))
                             ,A2($Html$Tags.div,
                             _L.fromArray([$Html$Attributes.$class("tab-content")]),
                             _L.fromArray([A2($Html$Tags.div,
                                          _L.fromArray([$Html$Attributes.$class(tabPane(English))
                                                       ,$Html$Attributes.id("intro")]),
                                          _L.fromArray([$Html.text("Here you may take a brief quiz in Ancient Latin vocabulary, or Japanese counting from one to ten.")]))
                                          ,A2($Html$Tags.div,
                                          _L.fromArray([$Html$Attributes.$class(tabPane(Latin))
                                                       ,$Html$Attributes.id("latin")]),
                                          _L.fromArray([questionForm]))
                                          ,A2($Html$Tags.div,
                                          _L.fromArray([$Html$Attributes.$class(tabPane(Japanese))
                                                       ,$Html$Attributes.id("japanese")]),
                                          _L.fromArray([questionForm]))]))]);
      }();
   };
   var view = function (s) {
      return A2($Html$Tags.div,
      _L.fromArray([$Html$Attributes.$class("span10")]),
      _L.fromArray([A2($Html$Tags.section,
      _L.fromArray([$Html$Attributes.id("content")]),
      tabs(s))]));
   };
   var scene = F2(function (s,
   _v13) {
      return function () {
         switch (_v13.ctor)
         {case "_Tuple2":
            return function () {
                 var m = A2($Html$Tags.main$,
                 _L.fromArray([]),
                 _L.fromArray([A2($Html$Tags.header,
                              _L.fromArray([$Html$Attributes.$class("language")]),
                              _L.fromArray([A2($Html$Tags.h1,
                              _L.fromArray([]),
                              _L.fromArray([$Html.text("Subject Quiz")]))]))
                              ,A2($Html$Tags.div,
                              _L.fromArray([$Html$Attributes.$class("container-fluid")]),
                              _L.fromArray([A2($Html$Tags.div,
                              _L.fromArray([$Html$Attributes.$class("row-fluid")]),
                              _L.fromArray([A2($Html$Tags.div,
                                           _L.fromArray([$Html$Attributes.id("left")
                                                        ,$Html$Attributes.$class("span2")]),
                                           _L.fromArray([$Html.text("A brief quiz on Subject vocabulary implemented via HTML 5, CSS 3, and JavaScript via Elm.")]))
                                           ,view(s)]))]))
                              ,A2($Html$Tags.footer,
                              _L.fromArray([]),
                              _L.fromArray([A2($Html$Tags.h6,
                              _L.fromArray([]),
                              _L.fromArray([$Html.text("Programmed by Jeff Maner.")
                                           ,A2($Html$Tags.br,
                                           _L.fromArray([]),
                                           _L.fromArray([]))
                                           ,A2($Html$Tags.time,
                                           _L.fromArray([A2($Html.attr,
                                                        "pubdate",
                                                        "")
                                                        ,A2($Html.attr,
                                                        "datetime",
                                                        "2014-10-10")]),
                                           _L.fromArray([$Html.text("2014 Oct 10")]))]))]))]));
                 return A4($Graphics$Element.container,
                 _v13._0,
                 _v13._1,
                 $Graphics$Element.midTop,
                 A3($Html.toElement,
                 _v13._0,
                 _v13._1,
                 m));
              }();}
         _E.Case($moduleName,
         "between lines 217 and 232");
      }();
   });
   var main = A3($Signal.lift2,
   scene,
   state,
   $Window.dimensions);
   _elm.LanguageQuiz.values = {_op: _op
                              ,nth: nth
                              ,State: State
                              ,Tab: Tab
                              ,Quiz: Quiz
                              ,English: English
                              ,Japanese: Japanese
                              ,Latin: Latin
                              ,Question: Question
                              ,questionsL: questionsL
                              ,questionsJ: questionsJ
                              ,englishQuiz: englishQuiz
                              ,latinQuiz: latinQuiz
                              ,japaneseQuiz: japaneseQuiz
                              ,introTab: introTab
                              ,latinTab: latinTab
                              ,japaneseTab: japaneseTab
                              ,initialState: initialState
                              ,NoOp: NoOp
                              ,NextQuestion: NextQuestion
                              ,PreviousQuestion: PreviousQuestion
                              ,ChangeTab: ChangeTab
                              ,Finish: Finish
                              ,Answer: Answer
                              ,step: step
                              ,moveToNextQuestion: moveToNextQuestion
                              ,moveToPreviousQuestion: moveToPreviousQuestion
                              ,view: view
                              ,tabs: tabs
                              ,question: question
                              ,main: main
                              ,scene: scene
                              ,state: state
                              ,startingState: startingState
                              ,actions: actions};
   return _elm.LanguageQuiz.values;
};Elm.Html = Elm.Html || {};
Elm.Html.Tags = Elm.Html.Tags || {};
Elm.Html.Tags.make = function (_elm) {
   "use strict";
   _elm.Html = _elm.Html || {};
   _elm.Html.Tags = _elm.Html.Tags || {};
   if (_elm.Html.Tags.values)
   return _elm.Html.Tags.values;
   var _op = {},
   _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "Html.Tags",
   $Html = Elm.Html.make(_elm);
   var menu = $Html.node("menu");
   var menuitem = $Html.node("menuitem");
   var summary = $Html.node("summary");
   var details = $Html.node("details");
   var meter = $Html.node("meter");
   var progress = $Html.node("progress");
   var output = $Html.node("output");
   var keygen = $Html.node("keygen");
   var textarea = $Html.node("textarea");
   var option = $Html.node("option");
   var optgroup = $Html.node("optgroup");
   var datalist = $Html.node("datalist");
   var select = $Html.node("select");
   var button = $Html.node("button");
   var input = $Html.node("input");
   var label = $Html.node("label");
   var legend = $Html.node("legend");
   var fieldset = $Html.node("fieldset");
   var form = $Html.node("form");
   var th = $Html.node("th");
   var td = $Html.node("td");
   var tr = $Html.node("tr");
   var tfoot = $Html.node("tfoot");
   var thead = $Html.node("thead");
   var tbody = $Html.node("tbody");
   var col = $Html.node("col");
   var colgroup = $Html.node("colgroup");
   var caption = $Html.node("caption");
   var table = $Html.node("table");
   var math = $Html.node("math");
   var svg = $Html.node("svg");
   var canvas = $Html.node("canvas");
   var track = $Html.node("track");
   var source = $Html.node("source");
   var audio = $Html.node("audio");
   var video = $Html.node("video");
   var param = $Html.node("param");
   var object = $Html.node("object");
   var embed = $Html.node("embed");
   var iframe = $Html.node("iframe");
   var img = $Html.node("img");
   var del = $Html.node("del");
   var ins = $Html.node("ins");
   var wbr = $Html.node("wbr");
   var br = $Html.node("br");
   var span = $Html.node("span");
   var bdo = $Html.node("bdo");
   var bdi = $Html.node("bdi");
   var rp = $Html.node("rp");
   var rt = $Html.node("rt");
   var ruby = $Html.node("ruby");
   var mark = $Html.node("mark");
   var u = $Html.node("u");
   var b = $Html.node("b");
   var i = $Html.node("i");
   var sup = $Html.node("sup");
   var sub = $Html.node("sub");
   var kbd = $Html.node("kbd");
   var samp = $Html.node("samp");
   var $var = $Html.node("var");
   var code = $Html.node("code");
   var time = $Html.node("time");
   var abbr = $Html.node("abbr");
   var dfn = $Html.node("dfn");
   var q = $Html.node("q");
   var cite = $Html.node("cite");
   var s = $Html.node("s");
   var small = $Html.node("small");
   var strong = $Html.node("strong");
   var em = $Html.node("em");
   var a = $Html.node("a");
   var div = $Html.node("div");
   var figcaption = $Html.node("figcaption");
   var figure = $Html.node("figure");
   var dd = $Html.node("dd");
   var dt = $Html.node("dt");
   var dl = $Html.node("dl");
   var li = $Html.node("li");
   var ul = $Html.node("ul");
   var ol = $Html.node("ol");
   var blockquote = $Html.node("blockquote");
   var pre = $Html.node("pre");
   var hr = $Html.node("hr");
   var p = $Html.node("p");
   var main$ = $Html.node("main");
   var address = $Html.node("address");
   var footer = $Html.node("footer");
   var header = $Html.node("header");
   var h6 = $Html.node("h6");
   var h5 = $Html.node("h5");
   var h4 = $Html.node("h4");
   var h3 = $Html.node("h3");
   var h2 = $Html.node("h2");
   var h1 = $Html.node("h1");
   var aside = $Html.node("aside");
   var article = $Html.node("article");
   var nav = $Html.node("nav");
   var section = $Html.node("section");
   var body = $Html.node("body");
   _elm.Html.Tags.values = {_op: _op
                           ,body: body
                           ,section: section
                           ,nav: nav
                           ,article: article
                           ,aside: aside
                           ,h1: h1
                           ,h2: h2
                           ,h3: h3
                           ,h4: h4
                           ,h5: h5
                           ,h6: h6
                           ,header: header
                           ,footer: footer
                           ,address: address
                           ,main$: main$
                           ,p: p
                           ,hr: hr
                           ,pre: pre
                           ,blockquote: blockquote
                           ,ol: ol
                           ,ul: ul
                           ,li: li
                           ,dl: dl
                           ,dt: dt
                           ,dd: dd
                           ,figure: figure
                           ,figcaption: figcaption
                           ,div: div
                           ,a: a
                           ,em: em
                           ,strong: strong
                           ,small: small
                           ,s: s
                           ,cite: cite
                           ,q: q
                           ,dfn: dfn
                           ,abbr: abbr
                           ,time: time
                           ,code: code
                           ,$var: $var
                           ,samp: samp
                           ,kbd: kbd
                           ,sub: sub
                           ,sup: sup
                           ,i: i
                           ,b: b
                           ,u: u
                           ,mark: mark
                           ,ruby: ruby
                           ,rt: rt
                           ,rp: rp
                           ,bdi: bdi
                           ,bdo: bdo
                           ,span: span
                           ,br: br
                           ,wbr: wbr
                           ,ins: ins
                           ,del: del
                           ,img: img
                           ,iframe: iframe
                           ,embed: embed
                           ,object: object
                           ,param: param
                           ,video: video
                           ,audio: audio
                           ,source: source
                           ,track: track
                           ,canvas: canvas
                           ,svg: svg
                           ,math: math
                           ,table: table
                           ,caption: caption
                           ,colgroup: colgroup
                           ,col: col
                           ,tbody: tbody
                           ,thead: thead
                           ,tfoot: tfoot
                           ,tr: tr
                           ,td: td
                           ,th: th
                           ,form: form
                           ,fieldset: fieldset
                           ,legend: legend
                           ,label: label
                           ,input: input
                           ,button: button
                           ,select: select
                           ,datalist: datalist
                           ,optgroup: optgroup
                           ,option: option
                           ,textarea: textarea
                           ,keygen: keygen
                           ,output: output
                           ,progress: progress
                           ,meter: meter
                           ,details: details
                           ,summary: summary
                           ,menuitem: menuitem
                           ,menu: menu};
   return _elm.Html.Tags.values;
};Elm.Html = Elm.Html || {};
Elm.Html.Optimize = Elm.Html.Optimize || {};
Elm.Html.Optimize.RefEq = Elm.Html.Optimize.RefEq || {};
Elm.Html.Optimize.RefEq.make = function (_elm) {
   "use strict";
   _elm.Html = _elm.Html || {};
   _elm.Html.Optimize = _elm.Html.Optimize || {};
   _elm.Html.Optimize.RefEq = _elm.Html.Optimize.RefEq || {};
   if (_elm.Html.Optimize.RefEq.values)
   return _elm.Html.Optimize.RefEq.values;
   var _op = {},
   _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "Html.Optimize.RefEq",
   $Html = Elm.Html.make(_elm),
   $Native$Html = Elm.Native.Html.make(_elm);
   var lazy3 = $Native$Html.lazyRef3;
   var lazy2 = $Native$Html.lazyRef2;
   var lazy = $Native$Html.lazyRef;
   _elm.Html.Optimize.RefEq.values = {_op: _op
                                     ,lazy: lazy
                                     ,lazy2: lazy2
                                     ,lazy3: lazy3};
   return _elm.Html.Optimize.RefEq.values;
};Elm.Html = Elm.Html || {};
Elm.Html.Events = Elm.Html.Events || {};
Elm.Html.Events.make = function (_elm) {
   "use strict";
   _elm.Html = _elm.Html || {};
   _elm.Html.Events = _elm.Html.Events || {};
   if (_elm.Html.Events.values)
   return _elm.Html.Events.values;
   var _op = {},
   _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "Html.Events",
   $Basics = Elm.Basics.make(_elm),
   $Graphics$Input = Elm.Graphics.Input.make(_elm),
   $Html = Elm.Html.make(_elm);
   var onsubmit = F2(function (handle,
   value) {
      return A4($Html.on,
      "submit",
      $Html.getAnything,
      handle,
      $Basics.always(value));
   });
   var onfocus = F2(function (handle,
   value) {
      return A4($Html.on,
      "focus",
      $Html.getAnything,
      handle,
      $Basics.always(value));
   });
   var onblur = F2(function (handle,
   value) {
      return A4($Html.on,
      "blur",
      $Html.getAnything,
      handle,
      $Basics.always(value));
   });
   var onKey = function (name) {
      return A2($Html.on,
      name,
      $Html.getKeyboardEvent);
   };
   var onkeyup = onKey("keyup");
   var onkeydown = onKey("keydown");
   var onkeypress = onKey("keypress");
   var onMouse = function (name) {
      return A2($Html.on,
      name,
      $Html.getMouseEvent);
   };
   var onclick = onMouse("click");
   var ondblclick = onMouse("dblclick");
   var onmousemove = onMouse("mousemove");
   var onmousedown = onMouse("mousedown");
   var onmouseup = onMouse("mouseup");
   var onmouseenter = onMouse("mouseenter");
   var onmouseleave = onMouse("mouseleave");
   var onmouseover = onMouse("mouseover");
   var onmouseout = onMouse("mouseout");
   _elm.Html.Events.values = {_op: _op
                             ,onMouse: onMouse
                             ,onclick: onclick
                             ,ondblclick: ondblclick
                             ,onmousemove: onmousemove
                             ,onmousedown: onmousedown
                             ,onmouseup: onmouseup
                             ,onmouseenter: onmouseenter
                             ,onmouseleave: onmouseleave
                             ,onmouseover: onmouseover
                             ,onmouseout: onmouseout
                             ,onKey: onKey
                             ,onkeyup: onkeyup
                             ,onkeydown: onkeydown
                             ,onkeypress: onkeypress
                             ,onblur: onblur
                             ,onfocus: onfocus
                             ,onsubmit: onsubmit};
   return _elm.Html.Events.values;
};Elm.Html = Elm.Html || {};
Elm.Html.Attributes = Elm.Html.Attributes || {};
Elm.Html.Attributes.make = function (_elm) {
   "use strict";
   _elm.Html = _elm.Html || {};
   _elm.Html.Attributes = _elm.Html.Attributes || {};
   if (_elm.Html.Attributes.values)
   return _elm.Html.Attributes.values;
   var _op = {},
   _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "Html.Attributes",
   $Html = Elm.Html.make(_elm),
   $String = Elm.String.make(_elm);
   var manifest = function (value) {
      return A2($Html.attr,
      "manifest",
      value);
   };
   var scope = function (value) {
      return A2($Html.attr,
      "scope",
      value);
   };
   var rowspan = function (value) {
      return A2($Html.attr,
      "rowspan",
      value);
   };
   var headers = function (value) {
      return A2($Html.attr,
      "headers",
      value);
   };
   var colspan = function (value) {
      return A2($Html.attr,
      "colspan",
      value);
   };
   var start = function (n) {
      return A2($Html.attr,
      "start",
      $String.show(n));
   };
   var reversed = function (bool) {
      return A2($Html.toggle,
      "reversed",
      bool);
   };
   var pubdate = function (value) {
      return A2($Html.attr,
      "pubdate",
      value);
   };
   var datetime = function (value) {
      return A2($Html.attr,
      "datetime",
      value);
   };
   var rel = function (value) {
      return A2($Html.attr,
      "rel",
      value);
   };
   var ping = function (value) {
      return A2($Html.attr,
      "ping",
      value);
   };
   var media = function (value) {
      return A2($Html.attr,
      "media",
      value);
   };
   var hreflang = function (value) {
      return A2($Html.attr,
      "hreflang",
      value);
   };
   var downloadAs = function (value) {
      return A2($Html.attr,
      "download",
      value);
   };
   var download = function (bool) {
      return A2($Html.toggle,
      "download",
      bool);
   };
   var target = function (value) {
      return A2($Html.attr,
      "target",
      value);
   };
   var href = function (value) {
      return A2($Html.attr,
      "href",
      value);
   };
   var cite = function (value) {
      return A2($Html.attr,
      "cite",
      value);
   };
   var align = function (value) {
      return A2($Html.attr,
      "align",
      value);
   };
   var keytype = function (value) {
      return A2($Html.attr,
      "keytype",
      value);
   };
   var challenge = function (value) {
      return A2($Html.attr,
      "challenge",
      value);
   };
   var coords = function (value) {
      return A2($Html.attr,
      "coords",
      value);
   };
   var shape = function (value) {
      return A2($Html.attr,
      "shape",
      value);
   };
   var usemap = function (value) {
      return A2($Html.attr,
      "usemap",
      value);
   };
   var ismap = function (value) {
      return A2($Html.attr,
      "ismap",
      value);
   };
   var wrap = function (value) {
      return A2($Html.attr,
      "wrap",
      value);
   };
   var rows = function (n) {
      return A2($Html.attr,
      "rows",
      $String.show(n));
   };
   var cols = function (n) {
      return A2($Html.attr,
      "cols",
      $String.show(n));
   };
   var step = function (n) {
      return A2($Html.attr,
      "step",
      $String.show(n));
   };
   var min = function (value) {
      return A2($Html.attr,
      "min",
      value);
   };
   var max = function (value) {
      return A2($Html.attr,
      "max",
      value);
   };
   var form = function (value) {
      return A2($Html.attr,
      "form",
      value);
   };
   var $for = function (value) {
      return A2($Html.attr,
      "htmlFor",
      value);
   };
   var size = function (n) {
      return A2($Html.attr,
      "size",
      $String.show(n));
   };
   var required = function (bool) {
      return A2($Html.toggle,
      "required",
      bool);
   };
   var readonly = function (bool) {
      return A2($Html.toggle,
      "readonly",
      bool);
   };
   var pattern = function (value) {
      return A2($Html.attr,
      "pattern",
      value);
   };
   var novalidate = function (bool) {
      return A2($Html.toggle,
      "novalidate",
      bool);
   };
   var name = function (value) {
      return A2($Html.attr,
      "name",
      value);
   };
   var multiple = function (bool) {
      return A2($Html.toggle,
      "multiple",
      bool);
   };
   var method = function (value) {
      return A2($Html.attr,
      "method",
      value);
   };
   var maxlength = function (n) {
      return A2($Html.attr,
      "maxlength",
      $String.show(n));
   };
   var list = function (value) {
      return A2($Html.attr,
      "list",
      value);
   };
   var formaction = function (value) {
      return A2($Html.attr,
      "formaction",
      value);
   };
   var enctype = function (value) {
      return A2($Html.attr,
      "enctype",
      value);
   };
   var disabled = function (bool) {
      return A2($Html.toggle,
      "disabled",
      bool);
   };
   var autosave = function (value) {
      return A2($Html.attr,
      "autosave",
      value);
   };
   var autofocus = function (bool) {
      return A2($Html.toggle,
      "autofocus",
      bool);
   };
   var autocomplete = function (bool) {
      return A2($Html.attr,
      "autocomplete",
      bool ? "on" : "off");
   };
   var action = function (value) {
      return A2($Html.attr,
      "action",
      value);
   };
   var acceptCharset = function (value) {
      return A2($Html.attr,
      "acceptCharset",
      value);
   };
   var accept = function (value) {
      return A2($Html.attr,
      "accept",
      value);
   };
   var selected = function (bool) {
      return A2($Html.toggle,
      "selected",
      bool);
   };
   var placeholder = function (value) {
      return A2($Html.attr,
      "placeholder",
      value);
   };
   var checked = function (bool) {
      return A2($Html.toggle,
      "checked",
      bool);
   };
   var value = function (value) {
      return A2($Html.attr,
      "value",
      value);
   };
   var type$ = function (value) {
      return A2($Html.attr,
      "type",
      value);
   };
   var srcdoc = function (value) {
      return A2($Html.attr,
      "srcdoc",
      value);
   };
   var seamless = function (bool) {
      return A2($Html.toggle,
      "seamless",
      bool);
   };
   var sandbox = function (value) {
      return A2($Html.attr,
      "sandbox",
      value);
   };
   var srclang = function (value) {
      return A2($Html.attr,
      "srclang",
      value);
   };
   var kind = function (value) {
      return A2($Html.attr,
      "kind",
      value);
   };
   var $default = function (bool) {
      return A2($Html.toggle,
      "default",
      bool);
   };
   var poster = function (value) {
      return A2($Html.attr,
      "poster",
      value);
   };
   var preload = function (bool) {
      return A2($Html.toggle,
      "preload",
      bool);
   };
   var loop = function (bool) {
      return A2($Html.toggle,
      "loop",
      bool);
   };
   var controls = function (bool) {
      return A2($Html.toggle,
      "controls",
      bool);
   };
   var autoplay = function (bool) {
      return A2($Html.toggle,
      "autoplay",
      bool);
   };
   var alt = function (value) {
      return A2($Html.attr,
      "alt",
      value);
   };
   var width = function (value) {
      return A2($Html.attr,
      "width",
      value);
   };
   var height = function (value) {
      return A2($Html.attr,
      "height",
      value);
   };
   var src = function (value) {
      return A2($Html.attr,
      "src",
      value);
   };
   var scoped = function (bool) {
      return A2($Html.toggle,
      "scoped",
      bool);
   };
   var language = function (value) {
      return A2($Html.attr,
      "language",
      value);
   };
   var httpEquiv = function (value) {
      return A2($Html.attr,
      "httpEquiv",
      value);
   };
   var defer = function (bool) {
      return A2($Html.toggle,
      "defer",
      bool);
   };
   var content = function (value) {
      return A2($Html.attr,
      "content",
      value);
   };
   var charset = function (value) {
      return A2($Html.attr,
      "charset",
      value);
   };
   var async = function (bool) {
      return A2($Html.toggle,
      "async",
      bool);
   };
   var tabindex = function (n) {
      return A2($Html.attr,
      "tabindex",
      $String.show(n));
   };
   var spellcheck = function (bool) {
      return A2($Html.attr,
      "spellcheck",
      bool ? "true" : "false");
   };
   var lang = function (value) {
      return A2($Html.attr,
      "lang",
      value);
   };
   var itemprop = function (value) {
      return A2($Html.attr,
      "itemprop",
      value);
   };
   var dropzone = function (value) {
      return A2($Html.attr,
      "dropzone",
      value);
   };
   var draggable = function (value) {
      return A2($Html.attr,
      "draggable",
      value);
   };
   var dir = function (value) {
      return A2($Html.attr,
      "dir",
      value);
   };
   var contextmenu = function (value) {
      return A2($Html.attr,
      "contextmenu",
      value);
   };
   var contenteditable = function (bool) {
      return A2($Html.attr,
      "contenteditable",
      bool ? "true" : "false");
   };
   var accesskey = function ($char) {
      return A2($Html.attr,
      "accesskey",
      $String.fromList(_L.fromArray([$char])));
   };
   var title = function (name) {
      return A2($Html.attr,
      "title",
      name);
   };
   var id = function (name) {
      return A2($Html.attr,
      "id",
      name);
   };
   var hidden = function (bool) {
      return A2($Html.toggle,
      "hidden",
      bool);
   };
   var $class = function (name) {
      return A2($Html.attr,
      "className",
      name);
   };
   _elm.Html.Attributes.values = {_op: _op
                                 ,$class: $class
                                 ,hidden: hidden
                                 ,id: id
                                 ,title: title
                                 ,accesskey: accesskey
                                 ,contenteditable: contenteditable
                                 ,contextmenu: contextmenu
                                 ,dir: dir
                                 ,draggable: draggable
                                 ,dropzone: dropzone
                                 ,itemprop: itemprop
                                 ,lang: lang
                                 ,spellcheck: spellcheck
                                 ,tabindex: tabindex
                                 ,async: async
                                 ,charset: charset
                                 ,content: content
                                 ,defer: defer
                                 ,httpEquiv: httpEquiv
                                 ,language: language
                                 ,scoped: scoped
                                 ,src: src
                                 ,height: height
                                 ,width: width
                                 ,alt: alt
                                 ,autoplay: autoplay
                                 ,controls: controls
                                 ,loop: loop
                                 ,preload: preload
                                 ,poster: poster
                                 ,$default: $default
                                 ,kind: kind
                                 ,srclang: srclang
                                 ,sandbox: sandbox
                                 ,seamless: seamless
                                 ,srcdoc: srcdoc
                                 ,type$: type$
                                 ,value: value
                                 ,checked: checked
                                 ,placeholder: placeholder
                                 ,selected: selected
                                 ,accept: accept
                                 ,acceptCharset: acceptCharset
                                 ,action: action
                                 ,autocomplete: autocomplete
                                 ,autofocus: autofocus
                                 ,autosave: autosave
                                 ,disabled: disabled
                                 ,enctype: enctype
                                 ,formaction: formaction
                                 ,list: list
                                 ,maxlength: maxlength
                                 ,method: method
                                 ,multiple: multiple
                                 ,name: name
                                 ,novalidate: novalidate
                                 ,pattern: pattern
                                 ,readonly: readonly
                                 ,required: required
                                 ,size: size
                                 ,$for: $for
                                 ,form: form
                                 ,max: max
                                 ,min: min
                                 ,step: step
                                 ,cols: cols
                                 ,rows: rows
                                 ,wrap: wrap
                                 ,ismap: ismap
                                 ,usemap: usemap
                                 ,shape: shape
                                 ,coords: coords
                                 ,challenge: challenge
                                 ,keytype: keytype
                                 ,align: align
                                 ,cite: cite
                                 ,href: href
                                 ,target: target
                                 ,download: download
                                 ,downloadAs: downloadAs
                                 ,hreflang: hreflang
                                 ,media: media
                                 ,ping: ping
                                 ,rel: rel
                                 ,datetime: datetime
                                 ,pubdate: pubdate
                                 ,reversed: reversed
                                 ,start: start
                                 ,colspan: colspan
                                 ,headers: headers
                                 ,rowspan: rowspan
                                 ,scope: scope
                                 ,manifest: manifest};
   return _elm.Html.Attributes.values;
};Elm.Html = Elm.Html || {};
Elm.Html.make = function (_elm) {
   "use strict";
   _elm.Html = _elm.Html || {};
   if (_elm.Html.values)
   return _elm.Html.values;
   var _op = {},
   _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "Html",
   $Graphics$Element = Elm.Graphics.Element.make(_elm),
   $Graphics$Input = Elm.Graphics.Input.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Native$Html = Elm.Native.Html.make(_elm);
   var getAnything = $Native$Html.getAnything;
   var KeyboardEvent = F5(function (a,
   b,
   c,
   d,
   e) {
      return {_: {}
             ,altKey: b
             ,ctrlKey: c
             ,keyCode: a
             ,metaKey: d
             ,shiftKey: e};
   });
   var getKeyboardEvent = $Native$Html.getKeyboardEvent;
   var MouseEvent = F5(function (a,
   b,
   c,
   d,
   e) {
      return {_: {}
             ,altKey: b
             ,button: a
             ,ctrlKey: c
             ,metaKey: d
             ,shiftKey: e};
   });
   var getMouseEvent = $Native$Html.getMouseEvent;
   var getValueAndSelection = $Native$Html.getValueAndSelection;
   var Backward = {ctor: "Backward"};
   var Forward = {ctor: "Forward"};
   var getValue = $Native$Html.getValue;
   var getChecked = $Native$Html.getChecked;
   var filterMap = $Native$Html.filterMap;
   var when = F2(function (pred,
   getter) {
      return A2($Native$Html.filterMap,
      function (v) {
         return pred(v) ? $Maybe.Just(v) : $Maybe.Nothing;
      },
      getter);
   });
   var on = $Native$Html.on;
   var Get = {ctor: "Get"};
   var prop = $Native$Html.pair;
   var style = $Native$Html.style;
   var CssProperty = {ctor: "CssProperty"};
   var toggle = $Native$Html.pair;
   var attr = $Native$Html.pair;
   var Attribute = {ctor: "Attribute"};
   var toElement = $Native$Html.toElement;
   var text = $Native$Html.text;
   var node = $Native$Html.node;
   var Html = {ctor: "Html"};
   _elm.Html.values = {_op: _op
                      ,Html: Html
                      ,node: node
                      ,text: text
                      ,toElement: toElement
                      ,Attribute: Attribute
                      ,attr: attr
                      ,toggle: toggle
                      ,CssProperty: CssProperty
                      ,style: style
                      ,prop: prop
                      ,Get: Get
                      ,on: on
                      ,when: when
                      ,filterMap: filterMap
                      ,getChecked: getChecked
                      ,getValue: getValue
                      ,Forward: Forward
                      ,Backward: Backward
                      ,getValueAndSelection: getValueAndSelection
                      ,getMouseEvent: getMouseEvent
                      ,MouseEvent: MouseEvent
                      ,getKeyboardEvent: getKeyboardEvent
                      ,KeyboardEvent: KeyboardEvent
                      ,getAnything: getAnything};
   return _elm.Html.values;
};