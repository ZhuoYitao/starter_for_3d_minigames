import { __awaiter, __generator } from "tslib";
import { Observable } from "./observable.js";
import { GetDOMTextContent, IsNavigatorAvailable, IsWindowObjectExist } from "./domManagement.js";
import { Logger } from "./logger.js";
import { DeepCopier } from "./deepCopier.js";
import { PrecisionDate } from "./precisionDate.js";
import { _WarnImport } from "./devTools.js";
import { WebRequest } from "./webRequest.js";
import { EngineStore } from "../Engines/engineStore.js";
import { FileToolsOptions, DecodeBase64UrlToBinary, IsBase64DataUrl, LoadFile as FileToolsLoadFile, LoadImage as FileToolLoadImage, ReadFile as FileToolsReadFile, SetCorsBehavior, } from "./fileTools.js";
import { PromisePolyfill } from "./promise.js";
import { TimingTools } from "./timingTools.js";
import { InstantiationTools } from "./instantiationTools.js";
import { RandomGUID } from "./guid.js";
import { SliceTools } from "./sliceTools.js";
/**
 * Class containing a set of static utilities functions
 */
var Tools = /** @class */ (function () {
    function Tools() {
    }
    Object.defineProperty(Tools, "BaseUrl", {
        /**
         * Gets or sets the base URL to use to load assets
         */
        get: function () {
            return FileToolsOptions.BaseUrl;
        },
        set: function (value) {
            FileToolsOptions.BaseUrl = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tools, "DefaultRetryStrategy", {
        /**
         * Gets or sets the retry strategy to apply when an error happens while loading an asset
         */
        get: function () {
            return FileToolsOptions.DefaultRetryStrategy;
        },
        set: function (strategy) {
            FileToolsOptions.DefaultRetryStrategy = strategy;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tools, "CorsBehavior", {
        /**
         * Default behaviour for cors in the application.
         * It can be a string if the expected behavior is identical in the entire app.
         * Or a callback to be able to set it per url or on a group of them (in case of Video source for instance)
         */
        get: function () {
            return FileToolsOptions.CorsBehavior;
        },
        set: function (value) {
            FileToolsOptions.CorsBehavior = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tools, "UseFallbackTexture", {
        /**
         * Gets or sets a global variable indicating if fallback texture must be used when a texture cannot be loaded
         * @ignorenaming
         */
        get: function () {
            return EngineStore.UseFallbackTexture;
        },
        set: function (value) {
            EngineStore.UseFallbackTexture = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tools, "RegisteredExternalClasses", {
        /**
         * Use this object to register external classes like custom textures or material
         * to allow the loaders to instantiate them
         */
        get: function () {
            return InstantiationTools.RegisteredExternalClasses;
        },
        set: function (classes) {
            InstantiationTools.RegisteredExternalClasses = classes;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tools, "fallbackTexture", {
        /**
         * Texture content used if a texture cannot loaded
         * @ignorenaming
         */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        get: function () {
            return EngineStore.FallbackTexture;
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        set: function (value) {
            EngineStore.FallbackTexture = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Read the content of a byte array at a specified coordinates (taking in account wrapping)
     * @param u defines the coordinate on X axis
     * @param v defines the coordinate on Y axis
     * @param width defines the width of the source data
     * @param height defines the height of the source data
     * @param pixels defines the source byte array
     * @param color defines the output color
     */
    Tools.FetchToRef = function (u, v, width, height, pixels, color) {
        var wrappedU = (Math.abs(u) * width) % width | 0;
        var wrappedV = (Math.abs(v) * height) % height | 0;
        var position = (wrappedU + wrappedV * width) * 4;
        color.r = pixels[position] / 255;
        color.g = pixels[position + 1] / 255;
        color.b = pixels[position + 2] / 255;
        color.a = pixels[position + 3] / 255;
    };
    /**
     * Interpolates between a and b via alpha
     * @param a The lower value (returned when alpha = 0)
     * @param b The upper value (returned when alpha = 1)
     * @param alpha The interpolation-factor
     * @return The mixed value
     */
    Tools.Mix = function (a, b, alpha) {
        return a * (1 - alpha) + b * alpha;
    };
    /**
     * Tries to instantiate a new object from a given class name
     * @param className defines the class name to instantiate
     * @returns the new object or null if the system was not able to do the instantiation
     */
    Tools.Instantiate = function (className) {
        return InstantiationTools.Instantiate(className);
    };
    /**
     * Provides a slice function that will work even on IE
     * @param data defines the array to slice
     * @param start defines the start of the data (optional)
     * @param end defines the end of the data (optional)
     * @returns the new sliced array
     */
    Tools.Slice = function (data, start, end) {
        return SliceTools.Slice(data, start, end);
    };
    /**
     * Provides a slice function that will work even on IE
     * The difference between this and Slice is that this will force-convert to array
     * @param data defines the array to slice
     * @param start defines the start of the data (optional)
     * @param end defines the end of the data (optional)
     * @returns the new sliced array
     */
    Tools.SliceToArray = function (data, start, end) {
        return SliceTools.SliceToArray(data, start, end);
    };
    /**
     * Polyfill for setImmediate
     * @param action defines the action to execute after the current execution block
     */
    Tools.SetImmediate = function (action) {
        TimingTools.SetImmediate(action);
    };
    /**
     * Function indicating if a number is an exponent of 2
     * @param value defines the value to test
     * @returns true if the value is an exponent of 2
     */
    Tools.IsExponentOfTwo = function (value) {
        var count = 1;
        do {
            count *= 2;
        } while (count < value);
        return count === value;
    };
    /**
     * Returns the nearest 32-bit single precision float representation of a Number
     * @param value A Number.  If the parameter is of a different type, it will get converted
     * to a number or to NaN if it cannot be converted
     * @returns number
     */
    Tools.FloatRound = function (value) {
        if (Math.fround) {
            return Math.fround(value);
        }
        return (Tools._TmpFloatArray[0] = value), Tools._TmpFloatArray[0];
    };
    /**
     * Extracts the filename from a path
     * @param path defines the path to use
     * @returns the filename
     */
    Tools.GetFilename = function (path) {
        var index = path.lastIndexOf("/");
        if (index < 0) {
            return path;
        }
        return path.substring(index + 1);
    };
    /**
     * Extracts the "folder" part of a path (everything before the filename).
     * @param uri The URI to extract the info from
     * @param returnUnchangedIfNoSlash Do not touch the URI if no slashes are present
     * @returns The "folder" part of the path
     */
    Tools.GetFolderPath = function (uri, returnUnchangedIfNoSlash) {
        if (returnUnchangedIfNoSlash === void 0) { returnUnchangedIfNoSlash = false; }
        var index = uri.lastIndexOf("/");
        if (index < 0) {
            if (returnUnchangedIfNoSlash) {
                return uri;
            }
            return "";
        }
        return uri.substring(0, index + 1);
    };
    /**
     * Convert an angle in radians to degrees
     * @param angle defines the angle to convert
     * @returns the angle in degrees
     */
    Tools.ToDegrees = function (angle) {
        return (angle * 180) / Math.PI;
    };
    /**
     * Convert an angle in degrees to radians
     * @param angle defines the angle to convert
     * @returns the angle in radians
     */
    Tools.ToRadians = function (angle) {
        return (angle * Math.PI) / 180;
    };
    /**
     * Returns an array if obj is not an array
     * @param obj defines the object to evaluate as an array
     * @param allowsNullUndefined defines a boolean indicating if obj is allowed to be null or undefined
     * @returns either obj directly if obj is an array or a new array containing obj
     */
    Tools.MakeArray = function (obj, allowsNullUndefined) {
        if (allowsNullUndefined !== true && (obj === undefined || obj == null)) {
            return null;
        }
        return Array.isArray(obj) ? obj : [obj];
    };
    /**
     * Gets the pointer prefix to use
     * @param engine defines the engine we are finding the prefix for
     * @returns "pointer" if touch is enabled. Else returns "mouse"
     */
    Tools.GetPointerPrefix = function (engine) {
        var eventPrefix = "pointer";
        // Check if pointer events are supported
        if (IsWindowObjectExist() && !window.PointerEvent) {
            eventPrefix = "mouse";
        }
        // Special Fallback MacOS Safari...
        if (engine._badDesktopOS &&
            !engine._badOS &&
            // And not ipad pros who claim to be macs...
            !(document && "ontouchend" in document)) {
            eventPrefix = "mouse";
        }
        return eventPrefix;
    };
    /**
     * Sets the cors behavior on a dom element. This will add the required Tools.CorsBehavior to the element.
     * @param url define the url we are trying
     * @param element define the dom element where to configure the cors policy
     * @param element.crossOrigin
     */
    Tools.SetCorsBehavior = function (url, element) {
        SetCorsBehavior(url, element);
    };
    // External files
    /**
     * Removes unwanted characters from an url
     * @param url defines the url to clean
     * @returns the cleaned url
     */
    Tools.CleanUrl = function (url) {
        url = url.replace(/#/gm, "%23");
        return url;
    };
    Object.defineProperty(Tools, "PreprocessUrl", {
        /**
         * Gets or sets a function used to pre-process url before using them to load assets
         */
        get: function () {
            return FileToolsOptions.PreprocessUrl;
        },
        set: function (processor) {
            FileToolsOptions.PreprocessUrl = processor;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Loads an image as an HTMLImageElement.
     * @param input url string, ArrayBuffer, or Blob to load
     * @param onLoad callback called when the image successfully loads
     * @param onError callback called when the image fails to load
     * @param offlineProvider offline provider for caching
     * @param mimeType optional mime type
     * @param imageBitmapOptions optional the options to use when creating an ImageBitmap
     * @returns the HTMLImageElement of the loaded image
     */
    Tools.LoadImage = function (input, onLoad, onError, offlineProvider, mimeType, imageBitmapOptions) {
        return FileToolLoadImage(input, onLoad, onError, offlineProvider, mimeType, imageBitmapOptions);
    };
    /**
     * Loads a file from a url
     * @param url url string, ArrayBuffer, or Blob to load
     * @param onSuccess callback called when the file successfully loads
     * @param onProgress callback called while file is loading (if the server supports this mode)
     * @param offlineProvider defines the offline provider for caching
     * @param useArrayBuffer defines a boolean indicating that date must be returned as ArrayBuffer
     * @param onError callback called when the file fails to load
     * @returns a file request object
     */
    Tools.LoadFile = function (url, onSuccess, onProgress, offlineProvider, useArrayBuffer, onError) {
        return FileToolsLoadFile(url, onSuccess, onProgress, offlineProvider, useArrayBuffer, onError);
    };
    /**
     * Loads a file from a url
     * @param url the file url to load
     * @param useArrayBuffer defines a boolean indicating that date must be returned as ArrayBuffer
     * @returns a promise containing an ArrayBuffer corresponding to the loaded file
     */
    Tools.LoadFileAsync = function (url, useArrayBuffer) {
        if (useArrayBuffer === void 0) { useArrayBuffer = true; }
        return new Promise(function (resolve, reject) {
            FileToolsLoadFile(url, function (data) {
                resolve(data);
            }, undefined, undefined, useArrayBuffer, function (request, exception) {
                reject(exception);
            });
        });
    };
    /**
     * Load a script (identified by an url). When the url returns, the
     * content of this file is added into a new script element, attached to the DOM (body element)
     * @param scriptUrl defines the url of the script to laod
     * @param onSuccess defines the callback called when the script is loaded
     * @param onError defines the callback to call if an error occurs
     * @param scriptId defines the id of the script element
     */
    Tools.LoadScript = function (scriptUrl, onSuccess, onError, scriptId) {
        if (!IsWindowObjectExist()) {
            return;
        }
        var head = document.getElementsByTagName("head")[0];
        var script = document.createElement("script");
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", scriptUrl);
        if (scriptId) {
            script.id = scriptId;
        }
        script.onload = function () {
            if (onSuccess) {
                onSuccess();
            }
        };
        script.onerror = function (e) {
            if (onError) {
                onError("Unable to load script '".concat(scriptUrl, "'"), e);
            }
        };
        head.appendChild(script);
    };
    /**
     * Load an asynchronous script (identified by an url). When the url returns, the
     * content of this file is added into a new script element, attached to the DOM (body element)
     * @param scriptUrl defines the url of the script to laod
     * @returns a promise request object
     */
    Tools.LoadScriptAsync = function (scriptUrl) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.LoadScript(scriptUrl, function () {
                resolve();
            }, function (message, exception) {
                reject(exception);
            });
        });
    };
    /**
     * Loads a file from a blob
     * @param fileToLoad defines the blob to use
     * @param callback defines the callback to call when data is loaded
     * @param progressCallback defines the callback to call during loading process
     * @returns a file request object
     */
    Tools.ReadFileAsDataURL = function (fileToLoad, callback, progressCallback) {
        var reader = new FileReader();
        var request = {
            onCompleteObservable: new Observable(),
            abort: function () { return reader.abort(); },
        };
        reader.onloadend = function () {
            request.onCompleteObservable.notifyObservers(request);
        };
        reader.onload = function (e) {
            //target doesn't have result from ts 1.3
            callback(e.target["result"]);
        };
        reader.onprogress = progressCallback;
        reader.readAsDataURL(fileToLoad);
        return request;
    };
    /**
     * Reads a file from a File object
     * @param file defines the file to load
     * @param onSuccess defines the callback to call when data is loaded
     * @param onProgress defines the callback to call during loading process
     * @param useArrayBuffer defines a boolean indicating that data must be returned as an ArrayBuffer
     * @param onError defines the callback to call when an error occurs
     * @returns a file request object
     */
    Tools.ReadFile = function (file, onSuccess, onProgress, useArrayBuffer, onError) {
        return FileToolsReadFile(file, onSuccess, onProgress, useArrayBuffer, onError);
    };
    /**
     * Creates a data url from a given string content
     * @param content defines the content to convert
     * @returns the new data url link
     */
    Tools.FileAsURL = function (content) {
        var fileBlob = new Blob([content]);
        var url = window.URL || window.webkitURL;
        var link = url.createObjectURL(fileBlob);
        return link;
    };
    /**
     * Format the given number to a specific decimal format
     * @param value defines the number to format
     * @param decimals defines the number of decimals to use
     * @returns the formatted string
     */
    Tools.Format = function (value, decimals) {
        if (decimals === void 0) { decimals = 2; }
        return value.toFixed(decimals);
    };
    /**
     * Tries to copy an object by duplicating every property
     * @param source defines the source object
     * @param destination defines the target object
     * @param doNotCopyList defines a list of properties to avoid
     * @param mustCopyList defines a list of properties to copy (even if they start with _)
     */
    Tools.DeepCopy = function (source, destination, doNotCopyList, mustCopyList) {
        DeepCopier.DeepCopy(source, destination, doNotCopyList, mustCopyList);
    };
    /**
     * Gets a boolean indicating if the given object has no own property
     * @param obj defines the object to test
     * @returns true if object has no own property
     */
    Tools.IsEmpty = function (obj) {
        for (var i in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, i)) {
                return false;
            }
        }
        return true;
    };
    /**
     * Function used to register events at window level
     * @param windowElement defines the Window object to use
     * @param events defines the events to register
     */
    Tools.RegisterTopRootEvents = function (windowElement, events) {
        for (var index = 0; index < events.length; index++) {
            var event_1 = events[index];
            windowElement.addEventListener(event_1.name, event_1.handler, false);
            try {
                if (window.parent) {
                    window.parent.addEventListener(event_1.name, event_1.handler, false);
                }
            }
            catch (e) {
                // Silently fails...
            }
        }
    };
    /**
     * Function used to unregister events from window level
     * @param windowElement defines the Window object to use
     * @param events defines the events to unregister
     */
    Tools.UnregisterTopRootEvents = function (windowElement, events) {
        for (var index = 0; index < events.length; index++) {
            var event_2 = events[index];
            windowElement.removeEventListener(event_2.name, event_2.handler);
            try {
                if (windowElement.parent) {
                    windowElement.parent.removeEventListener(event_2.name, event_2.handler);
                }
            }
            catch (e) {
                // Silently fails...
            }
        }
    };
    /**
     * Dumps the current bound framebuffer
     * @param width defines the rendering width
     * @param height defines the rendering height
     * @param engine defines the hosting engine
     * @param successCallback defines the callback triggered once the data are available
     * @param mimeType defines the mime type of the result
     * @param fileName defines the filename to download. If present, the result will automatically be downloaded
     * @return a void promise
     */
    Tools.DumpFramebuffer = function (width, height, engine, successCallback, mimeType, fileName) {
        if (mimeType === void 0) { mimeType = "image/png"; }
        return __awaiter(this, void 0, void 0, function () {
            var bufferView, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, engine.readPixels(0, 0, width, height)];
                    case 1:
                        bufferView = _a.sent();
                        data = new Uint8Array(bufferView.buffer);
                        Tools.DumpData(width, height, data, successCallback, mimeType, fileName, true);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Dumps an array buffer
     * @param width defines the rendering width
     * @param height defines the rendering height
     * @param data the data array
     * @param successCallback defines the callback triggered once the data are available
     * @param mimeType defines the mime type of the result
     * @param fileName defines the filename to download. If present, the result will automatically be downloaded
     * @param invertY true to invert the picture in the Y dimension
     * @param toArrayBuffer true to convert the data to an ArrayBuffer (encoded as `mimeType`) instead of a base64 string
     * @param quality defines the quality of the result
     */
    Tools.DumpData = function (width, height, data, successCallback, mimeType, fileName, invertY, toArrayBuffer, quality) {
        if (mimeType === void 0) { mimeType = "image/png"; }
        if (invertY === void 0) { invertY = false; }
        if (toArrayBuffer === void 0) { toArrayBuffer = false; }
        // Create a 2D canvas to store the result
        if (!Tools._ScreenshotCanvas) {
            Tools._ScreenshotCanvas = document.createElement("canvas");
        }
        Tools._ScreenshotCanvas.width = width;
        Tools._ScreenshotCanvas.height = height;
        var context = Tools._ScreenshotCanvas.getContext("2d");
        if (context) {
            // Convert if data are float32
            if (data instanceof Float32Array) {
                var data2 = new Uint8Array(data.length);
                var n = data.length;
                while (n--) {
                    var v = data[n];
                    data2[n] = v < 0 ? 0 : v > 1 ? 1 : Math.round(v * 255);
                }
                data = data2;
            }
            // Copy the pixels to a 2D canvas
            var imageData = context.createImageData(width, height);
            var castData = imageData.data;
            castData.set(data);
            context.putImageData(imageData, 0, 0);
            var canvas = Tools._ScreenshotCanvas;
            if (invertY) {
                var canvas2 = document.createElement("canvas");
                canvas2.width = width;
                canvas2.height = height;
                var ctx2 = canvas2.getContext("2d");
                if (!ctx2) {
                    return;
                }
                ctx2.translate(0, height);
                ctx2.scale(1, -1);
                ctx2.drawImage(Tools._ScreenshotCanvas, 0, 0);
                canvas = canvas2;
            }
            if (toArrayBuffer) {
                Tools.ToBlob(canvas, function (blob) {
                    var fileReader = new FileReader();
                    fileReader.onload = function (event) {
                        var arrayBuffer = event.target.result;
                        if (successCallback) {
                            successCallback(arrayBuffer);
                        }
                    };
                    fileReader.readAsArrayBuffer(blob);
                }, mimeType, quality);
            }
            else {
                Tools.EncodeScreenshotCanvasData(successCallback, mimeType, fileName, canvas, quality);
            }
        }
    };
    /**
     * Dumps an array buffer
     * @param width defines the rendering width
     * @param height defines the rendering height
     * @param data the data array
     * @param mimeType defines the mime type of the result
     * @param fileName defines the filename to download. If present, the result will automatically be downloaded
     * @param invertY true to invert the picture in the Y dimension
     * @param toArrayBuffer true to convert the data to an ArrayBuffer (encoded as `mimeType`) instead of a base64 string
     * @param quality defines the quality of the result
     * @return a promise that resolve to the final data
     */
    Tools.DumpDataAsync = function (width, height, data, mimeType, fileName, invertY, toArrayBuffer, quality) {
        if (mimeType === void 0) { mimeType = "image/png"; }
        if (invertY === void 0) { invertY = false; }
        if (toArrayBuffer === void 0) { toArrayBuffer = false; }
        return new Promise(function (resolve) {
            Tools.DumpData(width, height, data, function (result) { return resolve(result); }, mimeType, fileName, invertY, toArrayBuffer, quality);
        });
    };
    /**
     * Converts the canvas data to blob.
     * This acts as a polyfill for browsers not supporting the to blob function.
     * @param canvas Defines the canvas to extract the data from
     * @param successCallback Defines the callback triggered once the data are available
     * @param mimeType Defines the mime type of the result
     * @param quality defines the quality of the result
     */
    Tools.ToBlob = function (canvas, successCallback, mimeType, quality) {
        if (mimeType === void 0) { mimeType = "image/png"; }
        // We need HTMLCanvasElement.toBlob for HD screenshots
        if (!canvas.toBlob) {
            //  low performance polyfill based on toDataURL (https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)
            canvas.toBlob = function (callback, type, quality) {
                var _this = this;
                setTimeout(function () {
                    var binStr = atob(_this.toDataURL(type, quality).split(",")[1]), len = binStr.length, arr = new Uint8Array(len);
                    for (var i = 0; i < len; i++) {
                        arr[i] = binStr.charCodeAt(i);
                    }
                    callback(new Blob([arr]));
                });
            };
        }
        canvas.toBlob(function (blob) {
            successCallback(blob);
        }, mimeType, quality);
    };
    /**
     * Encodes the canvas data to base 64 or automatically download the result if filename is defined
     * @param successCallback defines the callback triggered once the data are available
     * @param mimeType defines the mime type of the result
     * @param fileName defines he filename to download. If present, the result will automatically be downloaded
     * @param canvas canvas to get the data from. If not provided, use the default screenshot canvas
     * @param quality defines the quality of the result
     */
    Tools.EncodeScreenshotCanvasData = function (successCallback, mimeType, fileName, canvas, quality) {
        if (mimeType === void 0) { mimeType = "image/png"; }
        if (successCallback) {
            var base64Image = (canvas !== null && canvas !== void 0 ? canvas : Tools._ScreenshotCanvas).toDataURL(mimeType, quality);
            successCallback(base64Image);
        }
        else {
            this.ToBlob(canvas !== null && canvas !== void 0 ? canvas : Tools._ScreenshotCanvas, function (blob) {
                //Creating a link if the browser have the download attribute on the a tag, to automatically start download generated image.
                if ("download" in document.createElement("a")) {
                    if (!fileName) {
                        var date = new Date();
                        var stringDate = (date.getFullYear() + "-" + (date.getMonth() + 1)).slice(2) +
                            "-" +
                            date.getDate() +
                            "_" +
                            date.getHours() +
                            "-" +
                            ("0" + date.getMinutes()).slice(-2);
                        fileName = "screenshot_" + stringDate + ".png";
                    }
                    Tools.Download(blob, fileName);
                }
                else {
                    if (blob) {
                        var url_1 = URL.createObjectURL(blob);
                        var newWindow = window.open("");
                        if (!newWindow) {
                            return;
                        }
                        var img = newWindow.document.createElement("img");
                        img.onload = function () {
                            // no longer need to read the blob so it's revoked
                            URL.revokeObjectURL(url_1);
                        };
                        img.src = url_1;
                        newWindow.document.body.appendChild(img);
                    }
                }
            }, mimeType, quality);
        }
    };
    /**
     * Downloads a blob in the browser
     * @param blob defines the blob to download
     * @param fileName defines the name of the downloaded file
     */
    Tools.Download = function (blob, fileName) {
        if (navigator && navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, fileName);
            return;
        }
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        a.href = url;
        a.download = fileName;
        a.addEventListener("click", function () {
            if (a.parentElement) {
                a.parentElement.removeChild(a);
            }
        });
        a.click();
        window.URL.revokeObjectURL(url);
    };
    /**
     * Will return the right value of the noPreventDefault variable
     * Needed to keep backwards compatibility to the old API.
     *
     * @param args arguments passed to the attachControl function
     * @returns the correct value for noPreventDefault
     */
    Tools.BackCompatCameraNoPreventDefault = function (args) {
        // is it used correctly?
        if (typeof args[0] === "boolean") {
            return args[0];
        }
        else if (typeof args[1] === "boolean") {
            return args[1];
        }
        return false;
    };
    /**
     * Captures a screenshot of the current rendering
     * @see https://doc.babylonjs.com/how_to/render_scene_on_a_png
     * @param engine defines the rendering engine
     * @param camera defines the source camera
     * @param size This parameter can be set to a single number or to an object with the
     * following (optional) properties: precision, width, height. If a single number is passed,
     * it will be used for both width and height. If an object is passed, the screenshot size
     * will be derived from the parameters. The precision property is a multiplier allowing
     * rendering at a higher or lower resolution
     * @param successCallback defines the callback receives a single parameter which contains the
     * screenshot as a string of base64-encoded characters. This string can be assigned to the
     * src parameter of an <img> to display it
     * @param mimeType defines the MIME type of the screenshot image (default: image/png).
     * Check your browser for supported MIME types
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Tools.CreateScreenshot = function (engine, camera, size, successCallback, mimeType) {
        if (mimeType === void 0) { mimeType = "image/png"; }
        throw _WarnImport("ScreenshotTools");
    };
    /**
     * Captures a screenshot of the current rendering
     * @see https://doc.babylonjs.com/how_to/render_scene_on_a_png
     * @param engine defines the rendering engine
     * @param camera defines the source camera
     * @param size This parameter can be set to a single number or to an object with the
     * following (optional) properties: precision, width, height. If a single number is passed,
     * it will be used for both width and height. If an object is passed, the screenshot size
     * will be derived from the parameters. The precision property is a multiplier allowing
     * rendering at a higher or lower resolution
     * @param mimeType defines the MIME type of the screenshot image (default: image/png).
     * Check your browser for supported MIME types
     * @returns screenshot as a string of base64-encoded characters. This string can be assigned
     * to the src parameter of an <img> to display it
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Tools.CreateScreenshotAsync = function (engine, camera, size, mimeType) {
        if (mimeType === void 0) { mimeType = "image/png"; }
        throw _WarnImport("ScreenshotTools");
    };
    /**
     * Generates an image screenshot from the specified camera.
     * @see https://doc.babylonjs.com/how_to/render_scene_on_a_png
     * @param engine The engine to use for rendering
     * @param camera The camera to use for rendering
     * @param size This parameter can be set to a single number or to an object with the
     * following (optional) properties: precision, width, height. If a single number is passed,
     * it will be used for both width and height. If an object is passed, the screenshot size
     * will be derived from the parameters. The precision property is a multiplier allowing
     * rendering at a higher or lower resolution
     * @param successCallback The callback receives a single parameter which contains the
     * screenshot as a string of base64-encoded characters. This string can be assigned to the
     * src parameter of an <img> to display it
     * @param mimeType The MIME type of the screenshot image (default: image/png).
     * Check your browser for supported MIME types
     * @param samples Texture samples (default: 1)
     * @param antialiasing Whether antialiasing should be turned on or not (default: false)
     * @param fileName A name for for the downloaded file.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Tools.CreateScreenshotUsingRenderTarget = function (engine, camera, size, successCallback, mimeType, samples, antialiasing, fileName) {
        if (mimeType === void 0) { mimeType = "image/png"; }
        if (samples === void 0) { samples = 1; }
        if (antialiasing === void 0) { antialiasing = false; }
        throw _WarnImport("ScreenshotTools");
    };
    /**
     * Generates an image screenshot from the specified camera.
     * @see https://doc.babylonjs.com/how_to/render_scene_on_a_png
     * @param engine The engine to use for rendering
     * @param camera The camera to use for rendering
     * @param size This parameter can be set to a single number or to an object with the
     * following (optional) properties: precision, width, height. If a single number is passed,
     * it will be used for both width and height. If an object is passed, the screenshot size
     * will be derived from the parameters. The precision property is a multiplier allowing
     * rendering at a higher or lower resolution
     * @param mimeType The MIME type of the screenshot image (default: image/png).
     * Check your browser for supported MIME types
     * @param samples Texture samples (default: 1)
     * @param antialiasing Whether antialiasing should be turned on or not (default: false)
     * @param fileName A name for for the downloaded file.
     * @returns screenshot as a string of base64-encoded characters. This string can be assigned
     * to the src parameter of an <img> to display it
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Tools.CreateScreenshotUsingRenderTargetAsync = function (engine, camera, size, mimeType, samples, antialiasing, fileName) {
        if (mimeType === void 0) { mimeType = "image/png"; }
        if (samples === void 0) { samples = 1; }
        if (antialiasing === void 0) { antialiasing = false; }
        throw _WarnImport("ScreenshotTools");
    };
    /**
     * Implementation from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#answer-2117523
     * Be aware Math.random() could cause collisions, but:
     * "All but 6 of the 128 bits of the ID are randomly generated, which means that for any two ids, there's a 1 in 2^^122 (or 5.3x10^^36) chance they'll collide"
     * @returns a pseudo random id
     */
    Tools.RandomId = function () {
        return RandomGUID();
    };
    /**
     * Test if the given uri is a base64 string
     * @deprecated Please use FileTools.IsBase64DataUrl instead.
     * @param uri The uri to test
     * @return True if the uri is a base64 string or false otherwise
     */
    Tools.IsBase64 = function (uri) {
        return IsBase64DataUrl(uri);
    };
    /**
     * Decode the given base64 uri.
     * @deprecated Please use FileTools.DecodeBase64UrlToBinary instead.
     * @param uri The uri to decode
     * @return The decoded base64 data.
     */
    Tools.DecodeBase64 = function (uri) {
        return DecodeBase64UrlToBinary(uri);
    };
    Object.defineProperty(Tools, "errorsCount", {
        /**
         * Gets a value indicating the number of loading errors
         * @ignorenaming
         */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        get: function () {
            return Logger.errorsCount;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Log a message to the console
     * @param message defines the message to log
     */
    Tools.Log = function (message) {
        Logger.Log(message);
    };
    /**
     * Write a warning message to the console
     * @param message defines the message to log
     */
    Tools.Warn = function (message) {
        Logger.Warn(message);
    };
    /**
     * Write an error message to the console
     * @param message defines the message to log
     */
    Tools.Error = function (message) {
        Logger.Error(message);
    };
    Object.defineProperty(Tools, "LogCache", {
        /**
         * Gets current log cache (list of logs)
         */
        get: function () {
            return Logger.LogCache;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Clears the log cache
     */
    Tools.ClearLogCache = function () {
        Logger.ClearLogCache();
    };
    Object.defineProperty(Tools, "LogLevels", {
        /**
         * Sets the current log level (MessageLogLevel / WarningLogLevel / ErrorLogLevel)
         */
        set: function (level) {
            Logger.LogLevels = level;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tools, "PerformanceLogLevel", {
        /**
         * Sets the current performance log level
         */
        set: function (level) {
            if ((level & Tools.PerformanceUserMarkLogLevel) === Tools.PerformanceUserMarkLogLevel) {
                Tools.StartPerformanceCounter = Tools._StartUserMark;
                Tools.EndPerformanceCounter = Tools._EndUserMark;
                return;
            }
            if ((level & Tools.PerformanceConsoleLogLevel) === Tools.PerformanceConsoleLogLevel) {
                Tools.StartPerformanceCounter = Tools._StartPerformanceConsole;
                Tools.EndPerformanceCounter = Tools._EndPerformanceConsole;
                return;
            }
            Tools.StartPerformanceCounter = Tools._StartPerformanceCounterDisabled;
            Tools.EndPerformanceCounter = Tools._EndPerformanceCounterDisabled;
        },
        enumerable: false,
        configurable: true
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Tools._StartPerformanceCounterDisabled = function (counterName, condition) { };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Tools._EndPerformanceCounterDisabled = function (counterName, condition) { };
    Tools._StartUserMark = function (counterName, condition) {
        if (condition === void 0) { condition = true; }
        if (!Tools._Performance) {
            if (!IsWindowObjectExist()) {
                return;
            }
            Tools._Performance = window.performance;
        }
        if (!condition || !Tools._Performance.mark) {
            return;
        }
        Tools._Performance.mark(counterName + "-Begin");
    };
    Tools._EndUserMark = function (counterName, condition) {
        if (condition === void 0) { condition = true; }
        if (!condition || !Tools._Performance.mark) {
            return;
        }
        Tools._Performance.mark(counterName + "-End");
        Tools._Performance.measure(counterName, counterName + "-Begin", counterName + "-End");
    };
    Tools._StartPerformanceConsole = function (counterName, condition) {
        if (condition === void 0) { condition = true; }
        if (!condition) {
            return;
        }
        Tools._StartUserMark(counterName, condition);
        if (console.time) {
            console.time(counterName);
        }
    };
    Tools._EndPerformanceConsole = function (counterName, condition) {
        if (condition === void 0) { condition = true; }
        if (!condition) {
            return;
        }
        Tools._EndUserMark(counterName, condition);
        console.timeEnd(counterName);
    };
    Object.defineProperty(Tools, "Now", {
        /**
         * Gets either window.performance.now() if supported or Date.now() else
         */
        get: function () {
            return PrecisionDate.Now;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * This method will return the name of the class used to create the instance of the given object.
     * It will works only on Javascript basic data types (number, string, ...) and instance of class declared with the @className decorator.
     * @param object the object to get the class name from
     * @param isType defines if the object is actually a type
     * @returns the name of the class, will be "object" for a custom data type not using the @className decorator
     */
    Tools.GetClassName = function (object, isType) {
        if (isType === void 0) { isType = false; }
        var name = null;
        if (!isType && object.getClassName) {
            name = object.getClassName();
        }
        else {
            if (object instanceof Object) {
                var classObj = isType ? object : Object.getPrototypeOf(object);
                name = classObj.constructor["__bjsclassName__"];
            }
            if (!name) {
                name = typeof object;
            }
        }
        return name;
    };
    /**
     * Gets the first element of an array satisfying a given predicate
     * @param array defines the array to browse
     * @param predicate defines the predicate to use
     * @returns null if not found or the element
     */
    Tools.First = function (array, predicate) {
        for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
            var el = array_1[_i];
            if (predicate(el)) {
                return el;
            }
        }
        return null;
    };
    /**
     * This method will return the name of the full name of the class, including its owning module (if any).
     * It will works only on Javascript basic data types (number, string, ...) and instance of class declared with the @className decorator or implementing a method getClassName():string (in which case the module won't be specified).
     * @param object the object to get the class name from
     * @param isType defines if the object is actually a type
     * @return a string that can have two forms: "moduleName.className" if module was specified when the class' Name was registered or "className" if there was not module specified.
     * @ignorenaming
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Tools.getFullClassName = function (object, isType) {
        if (isType === void 0) { isType = false; }
        var className = null;
        var moduleName = null;
        if (!isType && object.getClassName) {
            className = object.getClassName();
        }
        else {
            if (object instanceof Object) {
                var classObj = isType ? object : Object.getPrototypeOf(object);
                className = classObj.constructor["__bjsclassName__"];
                moduleName = classObj.constructor["__bjsmoduleName__"];
            }
            if (!className) {
                className = typeof object;
            }
        }
        if (!className) {
            return null;
        }
        return (moduleName != null ? moduleName + "." : "") + className;
    };
    /**
     * Returns a promise that resolves after the given amount of time.
     * @param delay Number of milliseconds to delay
     * @returns Promise that resolves after the given amount of time
     */
    Tools.DelayAsync = function (delay) {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve();
            }, delay);
        });
    };
    /**
     * Utility function to detect if the current user agent is Safari
     * @returns whether or not the current user agent is safari
     */
    Tools.IsSafari = function () {
        if (!IsNavigatorAvailable()) {
            return false;
        }
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    };
    /**
     * Enable/Disable Custom HTTP Request Headers globally.
     * default = false
     * @see CustomRequestHeaders
     */
    Tools.UseCustomRequestHeaders = false;
    /**
     * Custom HTTP Request Headers to be sent with XMLHttpRequests
     * i.e. when loading files, where the server/service expects an Authorization header
     */
    Tools.CustomRequestHeaders = WebRequest.CustomRequestHeaders;
    Tools._TmpFloatArray = new Float32Array(1);
    /**
     * Extracts text content from a DOM element hierarchy
     * Back Compat only, please use GetDOMTextContent instead.
     */
    Tools.GetDOMTextContent = GetDOMTextContent;
    Tools.GetAbsoluteUrl = typeof document === "object"
        ? function (url) {
            var a = document.createElement("a");
            a.href = url;
            return a.href;
        }
        : typeof URL === "function" && typeof location === "object"
            ? function (url) { return new URL(url, location.origin).href; }
            : function () {
                throw new Error("Unable to get absolute URL. Override BABYLON.Tools.GetAbsoluteUrl to a custom implementation for the current context.");
            };
    // Logs
    /**
     * No log
     */
    Tools.NoneLogLevel = Logger.NoneLogLevel;
    /**
     * Only message logs
     */
    Tools.MessageLogLevel = Logger.MessageLogLevel;
    /**
     * Only warning logs
     */
    Tools.WarningLogLevel = Logger.WarningLogLevel;
    /**
     * Only error logs
     */
    Tools.ErrorLogLevel = Logger.ErrorLogLevel;
    /**
     * All logs
     */
    Tools.AllLogLevel = Logger.AllLogLevel;
    /**
     * Checks if the window object exists
     * Back Compat only, please use IsWindowObjectExist instead.
     */
    Tools.IsWindowObjectExist = IsWindowObjectExist;
    // Performances
    /**
     * No performance log
     */
    Tools.PerformanceNoneLogLevel = 0;
    /**
     * Use user marks to log performance
     */
    Tools.PerformanceUserMarkLogLevel = 1;
    /**
     * Log performance to the console
     */
    Tools.PerformanceConsoleLogLevel = 2;
    /**
     * Starts a performance counter
     */
    Tools.StartPerformanceCounter = Tools._StartPerformanceCounterDisabled;
    /**
     * Ends a specific performance counter
     */
    Tools.EndPerformanceCounter = Tools._EndPerformanceCounterDisabled;
    return Tools;
}());
export { Tools };
/**
 * Use this className as a decorator on a given class definition to add it a name and optionally its module.
 * You can then use the Tools.getClassName(obj) on an instance to retrieve its class name.
 * This method is the only way to get it done in all cases, even if the .js file declaring the class is minified
 * @param name The name of the class, case should be preserved
 * @param module The name of the Module hosting the class, optional, but strongly recommended to specify if possible. Case should be preserved.
 */
export function className(name, module) {
    return function (target) {
        target["__bjsclassName__"] = name;
        target["__bjsmoduleName__"] = module != null ? module : null;
    };
}
/**
 * An implementation of a loop for asynchronous functions.
 */
var AsyncLoop = /** @class */ (function () {
    /**
     * Constructor.
     * @param iterations the number of iterations.
     * @param func the function to run each iteration
     * @param successCallback the callback that will be called upon successful execution
     * @param offset starting offset.
     */
    function AsyncLoop(
    /**
     * Defines the number of iterations for the loop
     */
    iterations, func, successCallback, offset) {
        if (offset === void 0) { offset = 0; }
        this.iterations = iterations;
        this.index = offset - 1;
        this._done = false;
        this._fn = func;
        this._successCallback = successCallback;
    }
    /**
     * Execute the next iteration. Must be called after the last iteration was finished.
     */
    AsyncLoop.prototype.executeNext = function () {
        if (!this._done) {
            if (this.index + 1 < this.iterations) {
                ++this.index;
                this._fn(this);
            }
            else {
                this.breakLoop();
            }
        }
    };
    /**
     * Break the loop and run the success callback.
     */
    AsyncLoop.prototype.breakLoop = function () {
        this._done = true;
        this._successCallback();
    };
    /**
     * Create and run an async loop.
     * @param iterations the number of iterations.
     * @param fn the function to run each iteration
     * @param successCallback the callback that will be called upon successful execution
     * @param offset starting offset.
     * @returns the created async loop object
     */
    AsyncLoop.Run = function (iterations, fn, successCallback, offset) {
        if (offset === void 0) { offset = 0; }
        var loop = new AsyncLoop(iterations, fn, successCallback, offset);
        loop.executeNext();
        return loop;
    };
    /**
     * A for-loop that will run a given number of iterations synchronous and the rest async.
     * @param iterations total number of iterations
     * @param syncedIterations number of synchronous iterations in each async iteration.
     * @param fn the function to call each iteration.
     * @param callback a success call back that will be called when iterating stops.
     * @param breakFunction a break condition (optional)
     * @param timeout timeout settings for the setTimeout function. default - 0.
     * @returns the created async loop object
     */
    AsyncLoop.SyncAsyncForLoop = function (iterations, syncedIterations, fn, callback, breakFunction, timeout) {
        if (timeout === void 0) { timeout = 0; }
        return AsyncLoop.Run(Math.ceil(iterations / syncedIterations), function (loop) {
            if (breakFunction && breakFunction()) {
                loop.breakLoop();
            }
            else {
                setTimeout(function () {
                    for (var i = 0; i < syncedIterations; ++i) {
                        var iteration = loop.index * syncedIterations + i;
                        if (iteration >= iterations) {
                            break;
                        }
                        fn(iteration);
                        if (breakFunction && breakFunction()) {
                            loop.breakLoop();
                            break;
                        }
                    }
                    loop.executeNext();
                }, timeout);
            }
        }, callback);
    };
    return AsyncLoop;
}());
export { AsyncLoop };
// Will only be define if Tools is imported freeing up some space when only engine is required
EngineStore.FallbackTexture =
    "data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBmRXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAAExAAIAAAAQAAAATgAAAAAAAABgAAAAAQAAAGAAAAABcGFpbnQubmV0IDQuMC41AP/bAEMABAIDAwMCBAMDAwQEBAQFCQYFBQUFCwgIBgkNCw0NDQsMDA4QFBEODxMPDAwSGBITFRYXFxcOERkbGRYaFBYXFv/bAEMBBAQEBQUFCgYGChYPDA8WFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFv/AABEIAQABAAMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/APH6KKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FCiiigD6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++gooooA+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gUKKKKAPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76CiiigD5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BQooooA+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/voKKKKAPl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FCiiigD6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++gooooA+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gUKKKKAPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76CiiigD5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BQooooA+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/voKKKKAPl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FCiiigD6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++gooooA+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gUKKKKAPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76P//Z";
// Register promise fallback for IE
PromisePolyfill.Apply();
//# sourceMappingURL=tools.js.map