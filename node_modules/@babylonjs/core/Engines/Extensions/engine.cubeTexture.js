import { __assign } from "tslib";
import { ThinEngine } from "../../Engines/thinEngine.js";
import { InternalTexture, InternalTextureSource } from "../../Materials/Textures/internalTexture.js";
import { Logger } from "../../Misc/logger.js";
import { LoadImage } from "../../Misc/fileTools.js";
import { RandomGUID } from "../../Misc/guid.js";

ThinEngine.prototype._createDepthStencilCubeTexture = function (size, options, rtWrapper) {
    var internalTexture = new InternalTexture(this, InternalTextureSource.DepthStencil);
    internalTexture.isCube = true;
    if (this.webGLVersion === 1) {
        Logger.Error("Depth cube texture is not supported by WebGL 1.");
        return internalTexture;
    }
    var internalOptions = __assign({ bilinearFiltering: false, comparisonFunction: 0, generateStencil: false }, options);
    var gl = this._gl;
    this._bindTextureDirectly(gl.TEXTURE_CUBE_MAP, internalTexture, true);
    this._setupDepthStencilTexture(internalTexture, size, internalOptions.generateStencil, internalOptions.bilinearFiltering, internalOptions.comparisonFunction);
    rtWrapper._depthStencilTexture = internalTexture;
    rtWrapper._depthStencilTextureWithStencil = internalOptions.generateStencil;
    // Create the depth/stencil buffer
    for (var face = 0; face < 6; face++) {
        if (internalOptions.generateStencil) {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + face, 0, gl.DEPTH24_STENCIL8, size, size, 0, gl.DEPTH_STENCIL, gl.UNSIGNED_INT_24_8, null);
        }
        else {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + face, 0, gl.DEPTH_COMPONENT24, size, size, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
        }
    }
    this._bindTextureDirectly(gl.TEXTURE_CUBE_MAP, null);
    this._internalTexturesCache.push(internalTexture);
    return internalTexture;
};
ThinEngine.prototype._partialLoadFile = function (url, index, loadedFiles, onfinish, onErrorCallBack) {
    if (onErrorCallBack === void 0) { onErrorCallBack = null; }
    var onload = function (data) {
        loadedFiles[index] = data;
        loadedFiles._internalCount++;
        if (loadedFiles._internalCount === 6) {
            onfinish(loadedFiles);
        }
    };
    var onerror = function (request, exception) {
        if (onErrorCallBack && request) {
            onErrorCallBack(request.status + " " + request.statusText, exception);
        }
    };
    this._loadFile(url, onload, undefined, undefined, true, onerror);
};
ThinEngine.prototype._cascadeLoadFiles = function (scene, onfinish, files, onError) {
    if (onError === void 0) { onError = null; }
    var loadedFiles = [];
    loadedFiles._internalCount = 0;
    for (var index = 0; index < 6; index++) {
        this._partialLoadFile(files[index], index, loadedFiles, onfinish, onError);
    }
};
ThinEngine.prototype._cascadeLoadImgs = function (scene, texture, onfinish, files, onError, mimeType) {
    if (onError === void 0) { onError = null; }
    var loadedImages = [];
    loadedImages._internalCount = 0;
    for (var index = 0; index < 6; index++) {
        this._partialLoadImg(files[index], index, loadedImages, scene, texture, onfinish, onError, mimeType);
    }
};
ThinEngine.prototype._partialLoadImg = function (url, index, loadedImages, scene, texture, onfinish, onErrorCallBack, mimeType) {
    if (onErrorCallBack === void 0) { onErrorCallBack = null; }
    var tokenPendingData = RandomGUID();
    var onload = function (img) {
        loadedImages[index] = img;
        loadedImages._internalCount++;
        if (scene) {
            scene._removePendingData(tokenPendingData);
        }
        if (loadedImages._internalCount === 6 && onfinish) {
            onfinish(texture, loadedImages);
        }
    };
    var onerror = function (message, exception) {
        if (scene) {
            scene._removePendingData(tokenPendingData);
        }
        if (onErrorCallBack) {
            onErrorCallBack(message, exception);
        }
    };
    LoadImage(url, onload, onerror, scene ? scene.offlineProvider : null, mimeType);
    if (scene) {
        scene._addPendingData(tokenPendingData);
    }
};
ThinEngine.prototype._setCubeMapTextureParams = function (texture, loadMipmap, maxLevel) {
    var gl = this._gl;
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, loadMipmap ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    texture.samplingMode = loadMipmap ? 3 : 2;
    if (loadMipmap && this.getCaps().textureMaxLevel && maxLevel !== undefined && maxLevel > 0) {
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAX_LEVEL, maxLevel);
        texture._maxLodLevel = maxLevel;
    }
    this._bindTextureDirectly(gl.TEXTURE_CUBE_MAP, null);
};
ThinEngine.prototype.createCubeTextureBase = function (rootUrl, scene, files, noMipmap, onLoad, onError, format, forcedExtension, createPolynomials, lodScale, lodOffset, fallback, beforeLoadCubeDataCallback, imageHandler, useSRGBBuffer) {
    var _this = this;
    if (onLoad === void 0) { onLoad = null; }
    if (onError === void 0) { onError = null; }
    if (forcedExtension === void 0) { forcedExtension = null; }
    if (createPolynomials === void 0) { createPolynomials = false; }
    if (lodScale === void 0) { lodScale = 0; }
    if (lodOffset === void 0) { lodOffset = 0; }
    if (fallback === void 0) { fallback = null; }
    if (beforeLoadCubeDataCallback === void 0) { beforeLoadCubeDataCallback = null; }
    if (imageHandler === void 0) { imageHandler = null; }
    if (useSRGBBuffer === void 0) { useSRGBBuffer = false; }
    var texture = fallback ? fallback : new InternalTexture(this, InternalTextureSource.Cube);
    texture.isCube = true;
    texture.url = rootUrl;
    texture.generateMipMaps = !noMipmap;
    texture._lodGenerationScale = lodScale;
    texture._lodGenerationOffset = lodOffset;
    texture._useSRGBBuffer = !!useSRGBBuffer && this._caps.supportSRGBBuffers && (this.webGLVersion > 1 || this.isWebGPU || !!noMipmap);
    if (!this._doNotHandleContextLost) {
        texture._extension = forcedExtension;
        texture._files = files;
    }
    var originalRootUrl = rootUrl;
    if (this._transformTextureUrl && !fallback) {
        rootUrl = this._transformTextureUrl(rootUrl);
    }
    var lastDot = rootUrl.lastIndexOf(".");
    var extension = forcedExtension ? forcedExtension : lastDot > -1 ? rootUrl.substring(lastDot).toLowerCase() : "";
    var loader = null;
    for (var _i = 0, _a = ThinEngine._TextureLoaders; _i < _a.length; _i++) {
        var availableLoader = _a[_i];
        if (availableLoader.canLoad(extension)) {
            loader = availableLoader;
            break;
        }
    }
    var onInternalError = function (request, exception) {
        if (rootUrl === originalRootUrl) {
            if (onError && request) {
                onError(request.status + " " + request.statusText, exception);
            }
        }
        else {
            // fall back to the original url if the transformed url fails to load
            Logger.Warn("Failed to load ".concat(rootUrl, ", falling back to the ").concat(originalRootUrl));
            _this.createCubeTextureBase(originalRootUrl, scene, files, !!noMipmap, onLoad, onError, format, forcedExtension, createPolynomials, lodScale, lodOffset, texture, beforeLoadCubeDataCallback, imageHandler, useSRGBBuffer);
        }
    };
    if (loader) {
        var onloaddata_1 = function (data) {
            if (beforeLoadCubeDataCallback) {
                beforeLoadCubeDataCallback(texture, data);
            }
            loader.loadCubeData(data, texture, createPolynomials, onLoad, onError);
        };
        if (files && files.length === 6) {
            if (loader.supportCascades) {
                this._cascadeLoadFiles(scene, function (images) { return onloaddata_1(images.map(function (image) { return new Uint8Array(image); })); }, files, onError);
            }
            else {
                if (onError) {
                    onError("Textures type does not support cascades.");
                }
                else {
                    Logger.Warn("Texture loader does not support cascades.");
                }
            }
        }
        else {
            this._loadFile(rootUrl, function (data) { return onloaddata_1(new Uint8Array(data)); }, undefined, undefined, true, onInternalError);
        }
    }
    else {
        if (!files) {
            throw new Error("Cannot load cubemap because files were not defined");
        }
        this._cascadeLoadImgs(scene, texture, function (texture, imgs) {
            if (imageHandler) {
                imageHandler(texture, imgs);
            }
        }, files, onError);
    }
    this._internalTexturesCache.push(texture);
    return texture;
};
ThinEngine.prototype.createCubeTexture = function (rootUrl, scene, files, noMipmap, onLoad, onError, format, forcedExtension, createPolynomials, lodScale, lodOffset, fallback, loaderOptions, useSRGBBuffer) {
    var _this = this;
    if (onLoad === void 0) { onLoad = null; }
    if (onError === void 0) { onError = null; }
    if (forcedExtension === void 0) { forcedExtension = null; }
    if (createPolynomials === void 0) { createPolynomials = false; }
    if (lodScale === void 0) { lodScale = 0; }
    if (lodOffset === void 0) { lodOffset = 0; }
    if (fallback === void 0) { fallback = null; }
    if (useSRGBBuffer === void 0) { useSRGBBuffer = false; }
    var gl = this._gl;
    return this.createCubeTextureBase(rootUrl, scene, files, !!noMipmap, onLoad, onError, format, forcedExtension, createPolynomials, lodScale, lodOffset, fallback, function (texture) { return _this._bindTextureDirectly(gl.TEXTURE_CUBE_MAP, texture, true); }, function (texture, imgs) {
        var width = _this.needPOTTextures ? ThinEngine.GetExponentOfTwo(imgs[0].width, _this._caps.maxCubemapTextureSize) : imgs[0].width;
        var height = width;
        var faces = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        ];
        _this._bindTextureDirectly(gl.TEXTURE_CUBE_MAP, texture, true);
        _this._unpackFlipY(false);
        var internalFormat = format ? _this._getInternalFormat(format, texture._useSRGBBuffer) : texture._useSRGBBuffer ? gl.SRGB8_ALPHA8 : gl.RGBA;
        var texelFormat = format ? _this._getInternalFormat(format) : gl.RGBA;
        if (texture._useSRGBBuffer && _this.webGLVersion === 1) {
            texelFormat = internalFormat;
        }
        for (var index = 0; index < faces.length; index++) {
            if (imgs[index].width !== width || imgs[index].height !== height) {
                _this._prepareWorkingCanvas();
                if (!_this._workingCanvas || !_this._workingContext) {
                    Logger.Warn("Cannot create canvas to resize texture.");
                    return;
                }
                _this._workingCanvas.width = width;
                _this._workingCanvas.height = height;
                _this._workingContext.drawImage(imgs[index], 0, 0, imgs[index].width, imgs[index].height, 0, 0, width, height);
                gl.texImage2D(faces[index], 0, internalFormat, texelFormat, gl.UNSIGNED_BYTE, _this._workingCanvas);
            }
            else {
                gl.texImage2D(faces[index], 0, internalFormat, texelFormat, gl.UNSIGNED_BYTE, imgs[index]);
            }
        }
        if (!noMipmap) {
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        }
        _this._setCubeMapTextureParams(texture, !noMipmap);
        texture.width = width;
        texture.height = height;
        texture.isReady = true;
        if (format) {
            texture.format = format;
        }
        texture.onLoadedObservable.notifyObservers(texture);
        texture.onLoadedObservable.clear();
        if (onLoad) {
            onLoad();
        }
    }, !!useSRGBBuffer);
};
//# sourceMappingURL=engine.cubeTexture.js.map