/**
 * 辅助变量和方法
 */
const _requestHeader = new WeakMap()
const _responseHeader = new WeakMap()
const _requestTask = new WeakMap()
function _triggerEvent(type, event = {}) {
    event.target = event.target || this

    if (typeof this[`on${type}`] === 'function') {
        this[`on${type}`].call(this, event)
    }
}
function _changeReadyState(readyState, event = {}) {
    this.readyState = readyState

    event.readyState = readyState;

    _triggerEvent.call(this, 'readystatechange', event)
}
function _isRelativePath(url) {
    return !(/^(http|https|ftp|wxfile):\/\/.*/i.test(url));
}
function parentNode(obj, level) {
    if (!('parentNode' in obj)) {
        let _parent;

        if (level === 0) {
            _parent = function() {
                // return document
                return null
            }
        } else if (level === 1) {
            _parent = function() {
                return document.documentElement
            }
        } else {
            _parent = function() {
                return document.body
            }
        }

        Object.defineProperty(obj, 'parentNode', {
            enumerable: true,
            get: _parent
        })
    }

    if (!('parentElement' in obj)) {
        let _parent;

        if (level === 0) {
            _parent = function() {
                return null
            }
        } else if (level === 1) {
            _parent = function() {
                return document.documentElement
            }
        } else {
            _parent = function() {
                return document.body
            }
        }

        Object.defineProperty(obj, 'parentElement', {
            enumerable: true,
            get: _parent
        })
    }
}
function style(obj) {
    obj.style = obj.style || {}

    Object.assign(obj.style, {
        top: '0px',
        left: '0px',
        width: innerWidth + 'px',
        height: innerHeight + 'px',
        margin: '0px',
        padding: '0px',
    })
}
function clientRegion(obj) {
    if (!('clientLeft' in obj)) {
        obj.clientLeft = 0
        obj.clientTop = 0
    }
    if (!('clientWidth' in obj)) {
        obj.clientWidth = innerWidth
        obj.clientHeight = innerHeight
    }

    if (!('getBoundingClientRect' in obj)) {
        obj.getBoundingClientRect = function() {
            const ret = {
                x: 0,
                y: 0,
                top: 0,
                left: 0,
                width: this.clientWidth,
                height: this.clientHeight
            }
            ret.right = ret.width
            ret.bottom = ret.height

            return ret
        }
    }
}
function offsetRegion(obj) {
    if (!('offsetLeft' in obj)) {
        obj.offsetLeft = 0
        obj.offsetTop = 0
    }
    if (!('offsetWidth' in obj)) {
        obj.offsetWidth = innerWidth
        obj.offsetHeight = innerHeight
    }
}
function classList(obj) {
    const noop = function() {}
    obj.classList = []
    obj.classList.add = noop
    obj.classList.remove = noop
    obj.classList.contains = noop
    obj.classList.toggle = noop
}

/**
 * matchMedia
 */
window.matchMedia = function(param) {
  return {
    matches: true,
    media: param,
    onchange: null
  };
}

/**
 * screen
 */
const { screenWidth, screenHeight, devicePixelRatio } = window.wxhelper.GetSystemInfo()
window.innerWidth = screenWidth
window.innerHeight = screenHeight
window.devicePixelRatio = devicePixelRatio;
window.screen = {
    width: screenWidth,
    height: screenHeight,
    availWidth: innerWidth,
    availHeight: innerHeight,
    availLeft: 0,
    availTop: 0,
}
window.scrollX = 0
window.scrollY = 0

/**
 * Blob
 */
window.Blob = class Blob{};

/**
 * XMLDocument
 */
window.XMLDocument = class XMLDocument{};

/**
 * Video
 */
window.HTMLVideoElement = class HTMLVideoElement {};

/**
 * XMLHttpRequest
 */
class XMLHttpRequest {

    constructor() {
        // super();

        /*
         * TODO 这一批事件应该是在 XMLHttpRequestEventTarget.prototype 上面的
         */
        this.onabort = null
        this.onerror = null
        this.onload = null
        this.onloadstart = null
        this.onprogress = null
        this.ontimeout = null
        this.onloadend = null

        this.onreadystatechange = null
        this.readyState = 0
        this.response = null
        this.responseText = null
        this.responseType = 'text'
        this.dataType = 'string'
        this.responseXML = null
        this.status = 0
        this.statusText = ''
        this.upload = {}
        this.withCredentials = false

        _requestHeader.set(this, {
            'content-type': 'application/x-www-form-urlencoded'
        })
        _responseHeader.set(this, {})
    }

    abort() {
        const myRequestTask = _requestTask.get(this)

        if (myRequestTask) {
            myRequestTask.abort()
        }
    }

    getAllResponseHeaders() {
        const responseHeader = _responseHeader.get(this)

        return Object.keys(responseHeader).map((header) => {
            return `${header}: ${responseHeader[header]}`
        }).join('\n')
    }

    getResponseHeader(header) {
        return _responseHeader.get(this)[header]
    }

    open(method, url /* async, user, password 这几个参数在小程序内不支持*/ ) {
        this._method = method
        this._url = url
        _changeReadyState.call(this, XMLHttpRequest.OPENED)
    }

    overrideMimeType() {}

    send(data = '') {
        if (this.readyState !== XMLHttpRequest.OPENED) {
            throw new Error("Failed to execute 'send' on 'XMLHttpRequest': The object's state must be OPENED.")
        } else {
            const url = this._url
            const header = _requestHeader.get(this)
            const responseType = this.responseType
            const dataType = this.dataType

            const relative = _isRelativePath(url)
            let encoding;

            if (responseType === 'arraybuffer') {
                // encoding = 'binary'
            } else {
                encoding = 'utf8'
            }

            delete this.response;
            this.response = null;

            const onSuccess = ({ data, statusCode, header }) => {
                statusCode = statusCode === undefined ? 200 : statusCode;
                if (typeof data !== 'string' && !(data instanceof ArrayBuffer)) {
                    try {
                        data = JSON.stringify(data)
                    } catch (e) {
                        data = data
                    }
                }

                this.status = statusCode
                if (header) {
                    _responseHeader.set(this, header)
                }
                _triggerEvent.call(this, 'loadstart')
                _changeReadyState.call(this, XMLHttpRequest.HEADERS_RECEIVED)
                _changeReadyState.call(this, XMLHttpRequest.LOADING)

                this.response = data

                if (data instanceof ArrayBuffer) {
                    Object.defineProperty(this, 'responseText', {
                        enumerable: true,
                        configurable: true,
                        get: function() {
                            throw "InvalidStateError : responseType is " + this.responseType;
                        }
                    });
                } else {
                    this.responseText = data
                }
                _changeReadyState.call(this, XMLHttpRequest.DONE)
                _triggerEvent.call(this, 'load')
                _triggerEvent.call(this, 'loadend')
            }

            const onFail = ({ errMsg }) => {
                // TODO 规范错误

                if (errMsg.indexOf('abort') !== -1) {
                    _triggerEvent.call(this, 'abort')
                } else {
                    _triggerEvent.call(this, 'error', {
                        message: errMsg
                    })
                }
                _triggerEvent.call(this, 'loadend')

                if (relative) {
                    // 用户即使没监听error事件, 也给出相应的警告
                    console.warn(errMsg)
                }
            }

            wx.request({
                data,
                url: url,
                method: this._method,
                header: header,
                dataType: dataType,
                responseType: responseType,
                success: onSuccess,
                fail: onFail
            })
        }
    }

    setRequestHeader(header, value) {
        const myHeader = _requestHeader.get(this)

        myHeader[header] = value
        _requestHeader.set(this, myHeader)
    }

    addEventListener(type, listener) {
        if (typeof listener !== 'function') {
            return;
        }

        this['on' + type] = (event = {}) => {
            event.target = event.target || this
            listener.call(this, event)
        }
    }

    removeEventListener(type, listener) {
        if (this['on' + type] === listener) {
            this['on' + type] = null;
        }
    }
}
XMLHttpRequest.UNSEND = 0
XMLHttpRequest.OPENED = 1
XMLHttpRequest.HEADERS_RECEIVED = 2
XMLHttpRequest.LOADING = 3
XMLHttpRequest.DONE = 4
window.XMLHttpRequest = XMLHttpRequest;

/**
 * Canvas
 */
function Canvas() {
    const canvas = window.wxhelper.GetMainCanvas()

    if (!('tagName' in canvas)) {
        canvas.tagName = 'CANVAS'
    }

    canvas.type = 'canvas'

    parentNode(canvas);
    style(canvas);
    classList(canvas);
    clientRegion(canvas);
    offsetRegion(canvas);

    canvas.focus = function() {};
    canvas.blur = function() {};

    canvas.addEventListener = function(type, listener, options = {}) {
        document.addEventListener(type, listener, options);
    }

    canvas.removeEventListener = function(type, listener) {
        // document.removeEventListener(type, listener);
    }

    canvas.dispatchEvent = function(event = {}) {
        console.log('canvas.dispatchEvent', event.type, event);
    }

    return canvas
}
// 暴露全局的 canvas
GameGlobal.screencanvas = GameGlobal.screencanvas || new Canvas();
window.canvas = GameGlobal.screencanvas;
window.HTMLCanvasElement = window.canvas.constructor;

/**
 * Image
 */
function Image() {
    const image = window.wxhelper.CreateImage();
    
    if (!('tagName' in image)) {
        image.tagName = 'IMG'
    }

    parentNode(image);
    classList(image);

    return image;
};
window.HTMLImageElement = wx.createImage().constructor;
window.Image = Image;