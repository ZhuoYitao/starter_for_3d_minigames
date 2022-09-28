import { __assign, __extends } from "tslib";
/* eslint-disable @typescript-eslint/naming-convention */
import { WebRequest } from "./webRequest.js";
import { IsWindowObjectExist } from "./domManagement.js";
import { Observable } from "./observable.js";
import { FilesInputStore } from "./filesInputStore.js";
import { RetryStrategy } from "./retryStrategy.js";
import { BaseError, ErrorCodes, RuntimeError } from "./error.js";
import { DecodeBase64ToBinary, DecodeBase64ToString, EncodeArrayBufferToBase64 } from "./stringTools.js";
import { ShaderProcessor } from "../Engines/Processors/shaderProcessor.js";
import { ThinEngine } from "../Engines/thinEngine.js";
import { EngineStore } from "../Engines/engineStore.js";
import { Logger } from "./logger.js";
import { TimingTools } from "./timingTools.js";
var Base64DataUrlRegEx = new RegExp(/^data:([^,]+\/[^,]+)?;base64,/i);
/** @ignore */
var LoadFileError = /** @class */ (function (_super) {
    __extends(LoadFileError, _super);
    /**
     * Creates a new LoadFileError
     * @param message defines the message of the error
     * @param object defines the optional web request
     */
    function LoadFileError(message, object) {
        var _this = _super.call(this, message, ErrorCodes.LoadFileError) || this;
        _this.name = "LoadFileError";
        BaseError._setPrototypeOf(_this, LoadFileError.prototype);
        if (object instanceof WebRequest) {
            _this.request = object;
        }
        else {
            _this.file = object;
        }
        return _this;
    }
    return LoadFileError;
}(RuntimeError));
export { LoadFileError };
/** @ignore */
var RequestFileError = /** @class */ (function (_super) {
    __extends(RequestFileError, _super);
    /**
     * Creates a new LoadFileError
     * @param message defines the message of the error
     * @param request defines the optional web request
     */
    function RequestFileError(message, request) {
        var _this = _super.call(this, message, ErrorCodes.RequestFileError) || this;
        _this.request = request;
        _this.name = "RequestFileError";
        BaseError._setPrototypeOf(_this, RequestFileError.prototype);
        return _this;
    }
    return RequestFileError;
}(RuntimeError));
export { RequestFileError };
/** @ignore */
var ReadFileError = /** @class */ (function (_super) {
    __extends(ReadFileError, _super);
    /**
     * Creates a new ReadFileError
     * @param message defines the message of the error
     * @param file defines the optional file
     */
    function ReadFileError(message, file) {
        var _this = _super.call(this, message, ErrorCodes.ReadFileError) || this;
        _this.file = file;
        _this.name = "ReadFileError";
        BaseError._setPrototypeOf(_this, ReadFileError.prototype);
        return _this;
    }
    return ReadFileError;
}(RuntimeError));
export { ReadFileError };
/**
 * @hidden
 */
export var FileToolsOptions = {
    /**
     * Gets or sets the retry strategy to apply when an error happens while loading an asset.
     * When defining this function, return the wait time before trying again or return -1 to
     * stop retrying and error out.
     */
    DefaultRetryStrategy: RetryStrategy.ExponentialBackoff(),
    /**
     * Gets or sets the base URL to use to load assets
     */
    BaseUrl: "",
    /**
     * Default behaviour for cors in the application.
     * It can be a string if the expected behavior is identical in the entire app.
     * Or a callback to be able to set it per url or on a group of them (in case of Video source for instance)
     */
    CorsBehavior: "anonymous",
    /**
     * Gets or sets a function used to pre-process url before using them to load assets
     * @param url
     */
    PreprocessUrl: function (url) {
        return url;
    }
};
/**
 * Removes unwanted characters from an url
 * @param url defines the url to clean
 * @returns the cleaned url
 */
var _CleanUrl = function (url) {
    url = url.replace(/#/gm, "%23");
    return url;
};
/**
 * Sets the cors behavior on a dom element. This will add the required Tools.CorsBehavior to the element.
 * @param url define the url we are trying
 * @param element define the dom element where to configure the cors policy
 * @param element.crossOrigin
 * @hidden
 */
export var SetCorsBehavior = function (url, element) {
    if (url && url.indexOf("data:") === 0) {
        return;
    }
    if (FileToolsOptions.CorsBehavior) {
        if (typeof FileToolsOptions.CorsBehavior === "string" || FileToolsOptions.CorsBehavior instanceof String) {
            element.crossOrigin = FileToolsOptions.CorsBehavior;
        }
        else {
            var result = FileToolsOptions.CorsBehavior(url);
            if (result) {
                element.crossOrigin = result;
            }
        }
    }
};
/**
 * Loads an image as an HTMLImageElement.
 * @param input url string, ArrayBuffer, or Blob to load
 * @param onLoad callback called when the image successfully loads
 * @param onError callback called when the image fails to load
 * @param offlineProvider offline provider for caching
 * @param mimeType optional mime type
 * @param imageBitmapOptions
 * @returns the HTMLImageElement of the loaded image
 * @hidden
 */
export var LoadImage = function (input, onLoad, onError, offlineProvider, mimeType, imageBitmapOptions) {
    var _a;
    if (mimeType === void 0) { mimeType = ""; }
    var url;
    var usingObjectURL = false;
    if (input instanceof ArrayBuffer || ArrayBuffer.isView(input)) {
        if (typeof Blob !== "undefined") {
            url = URL.createObjectURL(new Blob([input], { type: mimeType }));
            usingObjectURL = true;
        }
        else {
            url = "data:".concat(mimeType, ";base64,") + EncodeArrayBufferToBase64(input);
        }
    }
    else if (input instanceof Blob) {
        url = URL.createObjectURL(input);
        usingObjectURL = true;
    }
    else {
        url = _CleanUrl(input);
        url = FileToolsOptions.PreprocessUrl(input);
    }
    var engine = EngineStore.LastCreatedEngine;
    var onErrorHandler = function (exception) {
        if (onError) {
            var inputText = url || input.toString();
            onError("Error while trying to load image: ".concat(inputText.indexOf("http") === 0 || inputText.length <= 128 ? inputText : inputText.slice(0, 128) + "..."), exception);
        }
    };
    if (typeof Image === "undefined" || ((_a = engine === null || engine === void 0 ? void 0 : engine._features.forceBitmapOverHTMLImageElement) !== null && _a !== void 0 ? _a : false)) {
        LoadFile(url, function (data) {
            engine
                .createImageBitmap(new Blob([data], { type: mimeType }), __assign({ premultiplyAlpha: "none" }, imageBitmapOptions))
                .then(function (imgBmp) {
                onLoad(imgBmp);
                if (usingObjectURL) {
                    URL.revokeObjectURL(url);
                }
            })
                .catch(function (reason) {
                if (onError) {
                    onError("Error while trying to load image: " + input, reason);
                }
            });
        }, undefined, offlineProvider || undefined, true, function (request, exception) {
            onErrorHandler(exception);
        });
        return null;
    }
    var img = new Image();
    SetCorsBehavior(url, img);
    var loadHandler = function () {
        img.removeEventListener("load", loadHandler);
        img.removeEventListener("error", errorHandler);
        onLoad(img);
        // Must revoke the URL after calling onLoad to avoid security exceptions in
        // certain scenarios (e.g. when hosted in vscode).
        if (usingObjectURL && img.src) {
            URL.revokeObjectURL(img.src);
        }
    };
    var errorHandler = function (err) {
        img.removeEventListener("load", loadHandler);
        img.removeEventListener("error", errorHandler);
        onErrorHandler(err);
        if (usingObjectURL && img.src) {
            URL.revokeObjectURL(img.src);
        }
    };
    img.addEventListener("load", loadHandler);
    img.addEventListener("error", errorHandler);
    var noOfflineSupport = function () {
        img.src = url;
    };
    var loadFromOfflineSupport = function () {
        if (offlineProvider) {
            offlineProvider.loadImage(url, img);
        }
    };
    if (url.substr(0, 5) !== "blob:" && url.substr(0, 5) !== "data:" && offlineProvider && offlineProvider.enableTexturesOffline) {
        offlineProvider.open(loadFromOfflineSupport, noOfflineSupport);
    }
    else {
        if (url.indexOf("file:") !== -1) {
            var textureName = decodeURIComponent(url.substring(5).toLowerCase());
            if (FilesInputStore.FilesToLoad[textureName]) {
                try {
                    var blobURL = void 0;
                    try {
                        blobURL = URL.createObjectURL(FilesInputStore.FilesToLoad[textureName]);
                    }
                    catch (ex) {
                        // Chrome doesn't support oneTimeOnly parameter
                        blobURL = URL.createObjectURL(FilesInputStore.FilesToLoad[textureName]);
                    }
                    img.src = blobURL;
                    usingObjectURL = true;
                }
                catch (e) {
                    img.src = "";
                }
                return img;
            }
        }
        noOfflineSupport();
    }
    return img;
};
/**
 * Reads a file from a File object
 * @param file defines the file to load
 * @param onSuccess defines the callback to call when data is loaded
 * @param onProgress defines the callback to call during loading process
 * @param useArrayBuffer defines a boolean indicating that data must be returned as an ArrayBuffer
 * @param onError defines the callback to call when an error occurs
 * @returns a file request object
 * @hidden
 */
export var ReadFile = function (file, onSuccess, onProgress, useArrayBuffer, onError) {
    var reader = new FileReader();
    var fileRequest = {
        onCompleteObservable: new Observable(),
        abort: function () { return reader.abort(); }
    };
    reader.onloadend = function () { return fileRequest.onCompleteObservable.notifyObservers(fileRequest); };
    if (onError) {
        reader.onerror = function () {
            onError(new ReadFileError("Unable to read ".concat(file.name), file));
        };
    }
    reader.onload = function (e) {
        //target doesn't have result from ts 1.3
        onSuccess(e.target["result"]);
    };
    if (onProgress) {
        reader.onprogress = onProgress;
    }
    if (!useArrayBuffer) {
        // Asynchronous read
        reader.readAsText(file);
    }
    else {
        reader.readAsArrayBuffer(file);
    }
    return fileRequest;
};
/**
 * Loads a file from a url, a data url, or a file url
 * @param fileOrUrl file, url, data url, or file url to load
 * @param onSuccess callback called when the file successfully loads
 * @param onProgress callback called while file is loading (if the server supports this mode)
 * @param offlineProvider defines the offline provider for caching
 * @param useArrayBuffer defines a boolean indicating that date must be returned as ArrayBuffer
 * @param onError callback called when the file fails to load
 * @param onOpened
 * @returns a file request object
 * @hidden
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export var LoadFile = function (fileOrUrl, onSuccess, onProgress, offlineProvider, useArrayBuffer, onError, onOpened) {
    if (fileOrUrl.name) {
        return ReadFile(fileOrUrl, onSuccess, onProgress, useArrayBuffer, onError
            ? function (error) {
                onError(undefined, error);
            }
            : undefined);
    }
    var url = fileOrUrl;
    // If file and file input are set
    if (url.indexOf("file:") !== -1) {
        var fileName = decodeURIComponent(url.substring(5).toLowerCase());
        if (fileName.indexOf("./") === 0) {
            fileName = fileName.substring(2);
        }
        var file = FilesInputStore.FilesToLoad[fileName];
        if (file) {
            return ReadFile(file, onSuccess, onProgress, useArrayBuffer, onError ? function (error) { return onError(undefined, new LoadFileError(error.message, error.file)); } : undefined);
        }
    }
    // For a Base64 Data URL
    if (IsBase64DataUrl(url)) {
        var fileRequest_1 = {
            onCompleteObservable: new Observable(),
            abort: function () { return function () { }; }
        };
        try {
            onSuccess(useArrayBuffer ? DecodeBase64UrlToBinary(url) : DecodeBase64UrlToString(url));
        }
        catch (error) {
            if (onError) {
                onError(undefined, error);
            }
            else {
                Logger.Error(error.message || "Failed to parse the Data URL");
            }
        }
        TimingTools.SetImmediate(function () {
            fileRequest_1.onCompleteObservable.notifyObservers(fileRequest_1);
        });
        return fileRequest_1;
    }
    return RequestFile(url, function (data, request) {
        onSuccess(data, request ? request.responseURL : undefined);
    }, onProgress, offlineProvider, useArrayBuffer, onError
        ? function (error) {
            onError(error.request, new LoadFileError(error.message, error.request));
        }
        : undefined, onOpened);
};
/**
 * Loads a file from a url
 * @param url url to load
 * @param onSuccess callback called when the file successfully loads
 * @param onProgress callback called while file is loading (if the server supports this mode)
 * @param offlineProvider defines the offline provider for caching
 * @param useArrayBuffer defines a boolean indicating that date must be returned as ArrayBuffer
 * @param onError callback called when the file fails to load
 * @param onOpened callback called when the web request is opened
 * @returns a file request object
 * @hidden
 */
export var RequestFile = function (url, onSuccess, onProgress, offlineProvider, useArrayBuffer, onError, onOpened) {
    url = _CleanUrl(url);
    url = FileToolsOptions.PreprocessUrl(url);
    var loadUrl = FileToolsOptions.BaseUrl + url;
    var aborted = false;
    var fileRequest = {
        onCompleteObservable: new Observable(),
        abort: function () { return (aborted = true); }
    };
    var requestFile = function () {
        var request = new WebRequest();
        var retryHandle = null;
        var onReadyStateChange;
        var unbindEvents = function () {
            if (!request) {
                return;
            }
            if (onProgress) {
                request.removeEventListener("progress", onProgress);
            }
            if (onReadyStateChange) {
                request.removeEventListener("readystatechange", onReadyStateChange);
            }
            request.removeEventListener("loadend", onLoadEnd);
        };
        var onLoadEnd = function () {
            unbindEvents();
            fileRequest.onCompleteObservable.notifyObservers(fileRequest);
            fileRequest.onCompleteObservable.clear();
            onProgress = undefined;
            onReadyStateChange = null;
            onLoadEnd = null;
            onError = undefined;
            onOpened = undefined;
            onSuccess = undefined;
        };
        fileRequest.abort = function () {
            aborted = true;
            if (onLoadEnd) {
                onLoadEnd();
            }
            if (request && request.readyState !== (XMLHttpRequest.DONE || 4)) {
                request.abort();
            }
            if (retryHandle !== null) {
                clearTimeout(retryHandle);
                retryHandle = null;
            }
            request = null;
        };
        var handleError = function (error) {
            var message = error.message || "Unknown error";
            if (onError && request) {
                onError(new RequestFileError(message, request));
            }
            else {
                Logger.Error(message);
            }
        };
        var retryLoop = function (retryIndex) {
            if (!request) {
                return;
            }
            request.open("GET", loadUrl);
            if (onOpened) {
                try {
                    onOpened(request);
                }
                catch (e) {
                    handleError(e);
                    return;
                }
            }
            if (useArrayBuffer) {
                request.responseType = "arraybuffer";
            }
            if (onProgress) {
                request.addEventListener("progress", onProgress);
            }
            if (onLoadEnd) {
                request.addEventListener("loadend", onLoadEnd);
            }
            onReadyStateChange = function () {
                if (aborted || !request) {
                    return;
                }
                // In case of undefined state in some browsers.
                if (request.readyState === (XMLHttpRequest.DONE || 4)) {
                    // Some browsers have issues where onreadystatechange can be called multiple times with the same value.
                    if (onReadyStateChange) {
                        request.removeEventListener("readystatechange", onReadyStateChange);
                    }
                    if ((request.status >= 200 && request.status < 300) || (request.status === 0 && (!IsWindowObjectExist() || IsFileURL()))) {
                        try {
                            if (onSuccess) {
                                onSuccess(useArrayBuffer ? request.response : request.responseText, request);
                            }
                        }
                        catch (e) {
                            handleError(e);
                        }
                        return;
                    }
                    var retryStrategy = FileToolsOptions.DefaultRetryStrategy;
                    if (retryStrategy) {
                        var waitTime = retryStrategy(loadUrl, request, retryIndex);
                        if (waitTime !== -1) {
                            // Prevent the request from completing for retry.
                            unbindEvents();
                            request = new WebRequest();
                            retryHandle = setTimeout(function () { return retryLoop(retryIndex + 1); }, waitTime);
                            return;
                        }
                    }
                    var error = new RequestFileError("Error status: " + request.status + " " + request.statusText + " - Unable to load " + loadUrl, request);
                    if (onError) {
                        onError(error);
                    }
                }
            };
            request.addEventListener("readystatechange", onReadyStateChange);
            request.send();
        };
        retryLoop(0);
    };
    // Caching all files
    if (offlineProvider && offlineProvider.enableSceneOffline) {
        var noOfflineSupport_1 = function (request) {
            if (request && request.status > 400) {
                if (onError) {
                    onError(request);
                }
            }
            else {
                requestFile();
            }
        };
        var loadFromOfflineSupport = function () {
            // TODO: database needs to support aborting and should return a IFileRequest
            if (offlineProvider) {
                offlineProvider.loadFile(FileToolsOptions.BaseUrl + url, function (data) {
                    if (!aborted && onSuccess) {
                        onSuccess(data);
                    }
                    fileRequest.onCompleteObservable.notifyObservers(fileRequest);
                }, onProgress
                    ? function (event) {
                        if (!aborted && onProgress) {
                            onProgress(event);
                        }
                    }
                    : undefined, noOfflineSupport_1, useArrayBuffer);
            }
        };
        offlineProvider.open(loadFromOfflineSupport, noOfflineSupport_1);
    }
    else {
        requestFile();
    }
    return fileRequest;
};
/**
 * Checks if the loaded document was accessed via `file:`-Protocol.
 * @returns boolean
 * @hidden
 */
export var IsFileURL = function () {
    return typeof location !== "undefined" && location.protocol === "file:";
};
/**
 * Test if the given uri is a valid base64 data url
 * @param uri The uri to test
 * @return True if the uri is a base64 data url or false otherwise
 * @hidden
 */
export var IsBase64DataUrl = function (uri) {
    return Base64DataUrlRegEx.test(uri);
};
/**
 * Decode the given base64 uri.
 * @param uri The uri to decode
 * @return The decoded base64 data.
 * @hidden
 */
export function DecodeBase64UrlToBinary(uri) {
    return DecodeBase64ToBinary(uri.split(",")[1]);
}
/**
 * Decode the given base64 uri into a UTF-8 encoded string.
 * @param uri The uri to decode
 * @return The decoded base64 data.
 * @hidden
 */
export var DecodeBase64UrlToString = function (uri) {
    return DecodeBase64ToString(uri.split(",")[1]);
};
/**
 * This will be executed automatically for UMD and es5.
 * If esm dev wants the side effects to execute they will have to run it manually
 * Once we build native modules those need to be exported.
 * @hidden
 */
var initSideEffects = function () {
    ThinEngine._FileToolsLoadImage = LoadImage;
    ThinEngine._FileToolsLoadFile = LoadFile;
    ShaderProcessor._FileToolsLoadFile = LoadFile;
};
initSideEffects();
/**
* FileTools defined as any.
* This should not be imported or used in future releases or in any module in the framework
* @hidden
* @deprecated import the needed function from fileTools.ts
*/
export var FileTools;
/**
 * @param DecodeBase64UrlToBinary
 * @param DecodeBase64UrlToString
 * @param FileToolsOptions
 * @param FileToolsOptions.DefaultRetryStrategy
 * @param FileToolsOptions.BaseUrl
 * @param FileToolsOptions.CorsBehavior
 * @param FileToolsOptions.PreprocessUrl
 * @param IsBase64DataUrl
 * @param IsFileURL
 * @param LoadFile
 * @param LoadImage
 * @param ReadFile
 * @param RequestFile
 * @param SetCorsBehavior
 * @hidden
 */
export var _injectLTSFileTools = function (DecodeBase64UrlToBinary, DecodeBase64UrlToString, FileToolsOptions, IsBase64DataUrl, IsFileURL, LoadFile, LoadImage, ReadFile, RequestFile, SetCorsBehavior) {
    /**
     * Backwards compatibility.
     * @hidden
     * @deprecated
     */
    FileTools = {
        DecodeBase64UrlToBinary: DecodeBase64UrlToBinary,
        DecodeBase64UrlToString: DecodeBase64UrlToString,
        DefaultRetryStrategy: FileToolsOptions.DefaultRetryStrategy,
        BaseUrl: FileToolsOptions.BaseUrl,
        CorsBehavior: FileToolsOptions.CorsBehavior,
        PreprocessUrl: FileToolsOptions.PreprocessUrl,
        IsBase64DataUrl: IsBase64DataUrl,
        IsFileURL: IsFileURL,
        LoadFile: LoadFile,
        LoadImage: LoadImage,
        ReadFile: ReadFile,
        RequestFile: RequestFile,
        SetCorsBehavior: SetCorsBehavior
    };
    Object.defineProperty(FileTools, "DefaultRetryStrategy", {
        get: function () {
            return FileToolsOptions.DefaultRetryStrategy;
        },
        set: function (value) {
            FileToolsOptions.DefaultRetryStrategy = value;
        }
    });
    Object.defineProperty(FileTools, "BaseUrl", {
        get: function () {
            return FileToolsOptions.BaseUrl;
        },
        set: function (value) {
            FileToolsOptions.BaseUrl = value;
        }
    });
    Object.defineProperty(FileTools, "PreprocessUrl", {
        get: function () {
            return FileToolsOptions.PreprocessUrl;
        },
        set: function (value) {
            FileToolsOptions.PreprocessUrl = value;
        }
    });
    Object.defineProperty(FileTools, "CorsBehavior", {
        get: function () {
            return FileToolsOptions.CorsBehavior;
        },
        set: function (value) {
            FileToolsOptions.CorsBehavior = value;
        }
    });
};
_injectLTSFileTools(DecodeBase64UrlToBinary, DecodeBase64UrlToString, FileToolsOptions, IsBase64DataUrl, IsFileURL, LoadFile, LoadImage, ReadFile, RequestFile, SetCorsBehavior);
//# sourceMappingURL=fileTools.js.map