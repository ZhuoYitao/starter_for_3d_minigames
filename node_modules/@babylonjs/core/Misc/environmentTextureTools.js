import { __assign, __awaiter, __generator } from "tslib";
import { Tools } from "./tools.js";
import { Vector3 } from "../Maths/math.vector.js";
import { Scalar } from "../Maths/math.scalar.js";
import { SphericalPolynomial } from "../Maths/sphericalPolynomial.js";
import { InternalTexture, InternalTextureSource } from "../Materials/Textures/internalTexture.js";
import { BaseTexture } from "../Materials/Textures/baseTexture.js";

import { Scene } from "../scene.js";
import { PostProcess } from "../PostProcesses/postProcess.js";
import { Logger } from "../Misc/logger.js";
import { RGBDTextureTools } from "./rgbdTextureTools.js";
import "../Engines/Extensions/engine.renderTargetCube.js";
import "../Engines/Extensions/engine.readTexture.js";
import "../Materials/Textures/baseTexture.polynomial.js";
import "../Shaders/rgbdEncode.fragment.js";
import "../Shaders/rgbdDecode.fragment.js";
var DefaultEnvironmentTextureImageType = "image/png";
var CurrentVersion = 2;
/**
 * Magic number identifying the env file.
 */
var MagicBytes = [0x86, 0x16, 0x87, 0x96, 0xf6, 0xd6, 0x96, 0x36];
/**
 * Gets the environment info from an env file.
 * @param data The array buffer containing the .env bytes.
 * @returns the environment file info (the json header) if successfully parsed, normalized to the latest supported version.
 */
export function GetEnvInfo(data) {
    var dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
    var pos = 0;
    for (var i = 0; i < MagicBytes.length; i++) {
        if (dataView.getUint8(pos++) !== MagicBytes[i]) {
            Logger.Error("Not a babylon environment map");
            return null;
        }
    }
    // Read json manifest - collect characters up to null terminator
    var manifestString = "";
    var charCode = 0x00;
    while ((charCode = dataView.getUint8(pos++))) {
        manifestString += String.fromCharCode(charCode);
    }
    var manifest = JSON.parse(manifestString);
    manifest = normalizeEnvInfo(manifest);
    if (manifest.specular) {
        // Extend the header with the position of the payload.
        manifest.specular.specularDataPosition = pos;
        // Fallback to 0.8 exactly if lodGenerationScale is not defined for backward compatibility.
        manifest.specular.lodGenerationScale = manifest.specular.lodGenerationScale || 0.8;
    }
    return manifest;
}
/**
 * Normalizes any supported version of the environment file info to the latest version
 * @param info environment file info on any supported version
 * @returns environment file info in the latest supported version
 * @private
 */
export function normalizeEnvInfo(info) {
    if (info.version > CurrentVersion) {
        throw new Error("Unsupported babylon environment map version \"".concat(info.version, "\". Latest supported version is \"").concat(CurrentVersion, "\"."));
    }
    if (info.version === 2) {
        return info;
    }
    // Migrate a v1 info to v2
    info = __assign(__assign({}, info), { version: 2, imageType: DefaultEnvironmentTextureImageType });
    return info;
}
/**
 * Creates an environment texture from a loaded cube texture.
 * @param texture defines the cube texture to convert in env file
 * @param options options for the conversion process
 * @param options.imageType the mime type for the encoded images, with support for "image/png" (default) and "image/webp"
 * @param options.imageQuality the image quality of encoded WebP images.
 * @return a promise containing the environment data if successful.
 */
export function CreateEnvTextureAsync(texture, options) {
    var _a;
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var internalTexture, imageType, engine, textureType, cubeWidth, hostingScene, specularTextures, mipmapsCount, i, faceWidth, face, faceData, faceDataFloat, i_1, tempTexture, rgbdEncodedData, imageEncodedData, info, position, i, face, byteLength, infoString, infoBuffer, infoView, i, strLen, totalSize, finalBuffer, finalBufferView, dataView, pos, i, i, face, dataBuffer;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    internalTexture = texture.getInternalTexture();
                    if (!internalTexture) {
                        return [2 /*return*/, Promise.reject("The cube texture is invalid.")];
                    }
                    imageType = (_a = options.imageType) !== null && _a !== void 0 ? _a : DefaultEnvironmentTextureImageType;
                    engine = internalTexture.getEngine();
                    if (texture.textureType !== 2 &&
                        texture.textureType !== 1 &&
                        texture.textureType !== 0 &&
                        texture.textureType !== 0 &&
                        texture.textureType !== 7 &&
                        texture.textureType !== -1) {
                        return [2 /*return*/, Promise.reject("The cube texture should allow HDR (Full Float or Half Float).")];
                    }
                    textureType = 1;
                    if (!engine.getCaps().textureFloatRender) {
                        textureType = 2;
                        if (!engine.getCaps().textureHalfFloatRender) {
                            return [2 /*return*/, Promise.reject("Env texture can only be created when the browser supports half float or full float rendering.")];
                        }
                    }
                    cubeWidth = internalTexture.width;
                    hostingScene = new Scene(engine);
                    specularTextures = {};
                    // As we are going to readPixels the faces of the cube, make sure the drawing/update commands for the cube texture are fully sent to the GPU in case it is drawn for the first time in this very frame!
                    engine.flushFramebuffer();
                    mipmapsCount = Scalar.ILog2(internalTexture.width);
                    i = 0;
                    _b.label = 1;
                case 1:
                    if (!(i <= mipmapsCount)) return [3 /*break*/, 9];
                    faceWidth = Math.pow(2, mipmapsCount - i);
                    face = 0;
                    _b.label = 2;
                case 2:
                    if (!(face < 6)) return [3 /*break*/, 8];
                    return [4 /*yield*/, texture.readPixels(face, i, undefined, false)];
                case 3:
                    faceData = _b.sent();
                    if (faceData && faceData.byteLength === faceData.length) {
                        faceDataFloat = new Float32Array(faceData.byteLength * 4);
                        for (i_1 = 0; i_1 < faceData.byteLength; i_1++) {
                            faceDataFloat[i_1] = faceData[i_1] / 255;
                            // Gamma to linear
                            faceDataFloat[i_1] = Math.pow(faceDataFloat[i_1], 2.2);
                        }
                        faceData = faceDataFloat;
                    }
                    tempTexture = engine.createRawTexture(faceData, faceWidth, faceWidth, 5, false, true, 1, null, textureType);
                    return [4 /*yield*/, RGBDTextureTools.EncodeTextureToRGBD(tempTexture, hostingScene, textureType)];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, engine._readTexturePixels(tempTexture, faceWidth, faceWidth)];
                case 5:
                    rgbdEncodedData = _b.sent();
                    return [4 /*yield*/, Tools.DumpDataAsync(faceWidth, faceWidth, rgbdEncodedData, imageType, undefined, false, true, options.imageQuality)];
                case 6:
                    imageEncodedData = _b.sent();
                    specularTextures[i * 6 + face] = imageEncodedData;
                    tempTexture.dispose();
                    _b.label = 7;
                case 7:
                    face++;
                    return [3 /*break*/, 2];
                case 8:
                    i++;
                    return [3 /*break*/, 1];
                case 9:
                    // We can delete the hosting scene keeping track of all the creation objects
                    hostingScene.dispose();
                    info = {
                        version: CurrentVersion,
                        width: cubeWidth,
                        imageType: imageType,
                        irradiance: _CreateEnvTextureIrradiance(texture),
                        specular: {
                            mipmaps: [],
                            lodGenerationScale: texture.lodGenerationScale,
                        },
                    };
                    position = 0;
                    for (i = 0; i <= mipmapsCount; i++) {
                        for (face = 0; face < 6; face++) {
                            byteLength = specularTextures[i * 6 + face].byteLength;
                            info.specular.mipmaps.push({
                                length: byteLength,
                                position: position,
                            });
                            position += byteLength;
                        }
                    }
                    infoString = JSON.stringify(info);
                    infoBuffer = new ArrayBuffer(infoString.length + 1);
                    infoView = new Uint8Array(infoBuffer);
                    for (i = 0, strLen = infoString.length; i < strLen; i++) {
                        infoView[i] = infoString.charCodeAt(i);
                    }
                    // Ends up with a null terminator for easier parsing
                    infoView[infoString.length] = 0x00;
                    totalSize = MagicBytes.length + position + infoBuffer.byteLength;
                    finalBuffer = new ArrayBuffer(totalSize);
                    finalBufferView = new Uint8Array(finalBuffer);
                    dataView = new DataView(finalBuffer);
                    pos = 0;
                    for (i = 0; i < MagicBytes.length; i++) {
                        dataView.setUint8(pos++, MagicBytes[i]);
                    }
                    // Add the json info
                    finalBufferView.set(new Uint8Array(infoBuffer), pos);
                    pos += infoBuffer.byteLength;
                    // Finally inserts the texture data
                    for (i = 0; i <= mipmapsCount; i++) {
                        for (face = 0; face < 6; face++) {
                            dataBuffer = specularTextures[i * 6 + face];
                            finalBufferView.set(new Uint8Array(dataBuffer), pos);
                            pos += dataBuffer.byteLength;
                        }
                    }
                    // Voila
                    return [2 /*return*/, finalBuffer];
            }
        });
    });
}
/**
 * Creates a JSON representation of the spherical data.
 * @param texture defines the texture containing the polynomials
 * @return the JSON representation of the spherical info
 */
function _CreateEnvTextureIrradiance(texture) {
    var polynmials = texture.sphericalPolynomial;
    if (polynmials == null) {
        return null;
    }
    return {
        x: [polynmials.x.x, polynmials.x.y, polynmials.x.z],
        y: [polynmials.y.x, polynmials.y.y, polynmials.y.z],
        z: [polynmials.z.x, polynmials.z.y, polynmials.z.z],
        xx: [polynmials.xx.x, polynmials.xx.y, polynmials.xx.z],
        yy: [polynmials.yy.x, polynmials.yy.y, polynmials.yy.z],
        zz: [polynmials.zz.x, polynmials.zz.y, polynmials.zz.z],
        yz: [polynmials.yz.x, polynmials.yz.y, polynmials.yz.z],
        zx: [polynmials.zx.x, polynmials.zx.y, polynmials.zx.z],
        xy: [polynmials.xy.x, polynmials.xy.y, polynmials.xy.z],
    };
}
/**
 * Creates the ArrayBufferViews used for initializing environment texture image data.
 * @param data the image data
 * @param info parameters that determine what views will be created for accessing the underlying buffer
 * @return the views described by info providing access to the underlying buffer
 */
export function CreateImageDataArrayBufferViews(data, info) {
    info = normalizeEnvInfo(info);
    var specularInfo = info.specular;
    // Double checks the enclosed info
    var mipmapsCount = Scalar.Log2(info.width);
    mipmapsCount = Math.round(mipmapsCount) + 1;
    if (specularInfo.mipmaps.length !== 6 * mipmapsCount) {
        throw new Error("Unsupported specular mipmaps number \"".concat(specularInfo.mipmaps.length, "\""));
    }
    var imageData = new Array(mipmapsCount);
    for (var i = 0; i < mipmapsCount; i++) {
        imageData[i] = new Array(6);
        for (var face = 0; face < 6; face++) {
            var imageInfo = specularInfo.mipmaps[i * 6 + face];
            imageData[i][face] = new Uint8Array(data.buffer, data.byteOffset + specularInfo.specularDataPosition + imageInfo.position, imageInfo.length);
        }
    }
    return imageData;
}
/**
 * Uploads the texture info contained in the env file to the GPU.
 * @param texture defines the internal texture to upload to
 * @param data defines the data to load
 * @param info defines the texture info retrieved through the GetEnvInfo method
 * @returns a promise
 */
export function UploadEnvLevelsAsync(texture, data, info) {
    info = normalizeEnvInfo(info);
    var specularInfo = info.specular;
    if (!specularInfo) {
        // Nothing else parsed so far
        return Promise.resolve();
    }
    texture._lodGenerationScale = specularInfo.lodGenerationScale;
    var imageData = CreateImageDataArrayBufferViews(data, info);
    return UploadLevelsAsync(texture, imageData, info.imageType);
}
function _OnImageReadyAsync(image, engine, expandTexture, rgbdPostProcess, url, face, i, generateNonLODTextures, lodTextures, cubeRtt, texture) {
    return new Promise(function (resolve, reject) {
        if (expandTexture) {
            var tempTexture_1 = engine.createTexture(null, true, true, null, 1, null, function (message) {
                reject(message);
            }, image);
            rgbdPostProcess.getEffect().executeWhenCompiled(function () {
                // Uncompress the data to a RTT
                rgbdPostProcess.externalTextureSamplerBinding = true;
                rgbdPostProcess.onApply = function (effect) {
                    effect._bindTexture("textureSampler", tempTexture_1);
                    effect.setFloat2("scale", 1, engine._features.needsInvertingBitmap && image instanceof ImageBitmap ? -1 : 1);
                };
                if (!engine.scenes.length) {
                    return;
                }
                engine.scenes[0].postProcessManager.directRender([rgbdPostProcess], cubeRtt, true, face, i);
                // Cleanup
                engine.restoreDefaultFramebuffer();
                tempTexture_1.dispose();
                URL.revokeObjectURL(url);
                resolve();
            });
        }
        else {
            engine._uploadImageToTexture(texture, image, face, i);
            // Upload the face to the non lod texture support
            if (generateNonLODTextures) {
                var lodTexture = lodTextures[i];
                if (lodTexture) {
                    engine._uploadImageToTexture(lodTexture._texture, image, face, 0);
                }
            }
            resolve();
        }
    });
}
/**
 * Uploads the levels of image data to the GPU.
 * @param texture defines the internal texture to upload to
 * @param imageData defines the array buffer views of image data [mipmap][face]
 * @param imageType the mime type of the image data
 * @returns a promise
 */
export function UploadLevelsAsync(texture, imageData, imageType) {
    if (imageType === void 0) { imageType = DefaultEnvironmentTextureImageType; }
    if (!Tools.IsExponentOfTwo(texture.width)) {
        throw new Error("Texture size must be a power of two");
    }
    var mipmapsCount = Scalar.ILog2(texture.width) + 1;
    // Gets everything ready.
    var engine = texture.getEngine();
    var expandTexture = false;
    var generateNonLODTextures = false;
    var rgbdPostProcess = null;
    var cubeRtt = null;
    var lodTextures = null;
    var caps = engine.getCaps();
    texture.format = 5;
    texture.type = 0;
    texture.generateMipMaps = true;
    texture._cachedAnisotropicFilteringLevel = null;
    engine.updateTextureSamplingMode(3, texture);
    // Add extra process if texture lod is not supported
    if (!caps.textureLOD) {
        expandTexture = false;
        generateNonLODTextures = true;
        lodTextures = {};
    }
    // in webgl 1 there are no ways to either render or copy lod level information for float textures.
    else if (!engine._features.supportRenderAndCopyToLodForFloatTextures) {
        expandTexture = false;
    }
    // If half float available we can uncompress the texture
    else if (caps.textureHalfFloatRender && caps.textureHalfFloatLinearFiltering) {
        expandTexture = true;
        texture.type = 2;
    }
    // If full float available we can uncompress the texture
    else if (caps.textureFloatRender && caps.textureFloatLinearFiltering) {
        expandTexture = true;
        texture.type = 1;
    }
    // Expand the texture if possible
    if (expandTexture) {
        // Simply run through the decode PP
        rgbdPostProcess = new PostProcess("rgbdDecode", "rgbdDecode", null, null, 1, null, 3, engine, false, undefined, texture.type, undefined, null, false);
        texture._isRGBD = false;
        texture.invertY = false;
        cubeRtt = engine.createRenderTargetCubeTexture(texture.width, {
            generateDepthBuffer: false,
            generateMipMaps: true,
            generateStencilBuffer: false,
            samplingMode: 3,
            type: texture.type,
            format: 5,
        });
    }
    else {
        texture._isRGBD = true;
        texture.invertY = true;
        // In case of missing support, applies the same patch than DDS files.
        if (generateNonLODTextures) {
            var mipSlices = 3;
            var scale = texture._lodGenerationScale;
            var offset = texture._lodGenerationOffset;
            for (var i = 0; i < mipSlices; i++) {
                //compute LOD from even spacing in smoothness (matching shader calculation)
                var smoothness = i / (mipSlices - 1);
                var roughness = 1 - smoothness;
                var minLODIndex = offset; // roughness = 0
                var maxLODIndex = (mipmapsCount - 1) * scale + offset; // roughness = 1 (mipmaps start from 0)
                var lodIndex = minLODIndex + (maxLODIndex - minLODIndex) * roughness;
                var mipmapIndex = Math.round(Math.min(Math.max(lodIndex, 0), maxLODIndex));
                var glTextureFromLod = new InternalTexture(engine, InternalTextureSource.Temp);
                glTextureFromLod.isCube = true;
                glTextureFromLod.invertY = true;
                glTextureFromLod.generateMipMaps = false;
                engine.updateTextureSamplingMode(2, glTextureFromLod);
                // Wrap in a base texture for easy binding.
                var lodTexture = new BaseTexture(null);
                lodTexture.isCube = true;
                lodTexture._texture = glTextureFromLod;
                lodTextures[mipmapIndex] = lodTexture;
                switch (i) {
                    case 0:
                        texture._lodTextureLow = lodTexture;
                        break;
                    case 1:
                        texture._lodTextureMid = lodTexture;
                        break;
                    case 2:
                        texture._lodTextureHigh = lodTexture;
                        break;
                }
            }
        }
    }
    var promises = [];
    var _loop_1 = function (i) {
        var _loop_2 = function (face) {
            // Constructs an image element from image data
            var bytes = imageData[i][face];
            var blob = new Blob([bytes], { type: imageType });
            var url = URL.createObjectURL(blob);
            var promise = void 0;
            if (typeof Image === "undefined" || engine._features.forceBitmapOverHTMLImageElement) {
                promise = engine.createImageBitmap(blob, { premultiplyAlpha: "none" }).then(function (img) {
                    return _OnImageReadyAsync(img, engine, expandTexture, rgbdPostProcess, url, face, i, generateNonLODTextures, lodTextures, cubeRtt, texture);
                });
            }
            else {
                var image_1 = new Image();
                image_1.src = url;
                // Enqueue promise to upload to the texture.
                promise = new Promise(function (resolve, reject) {
                    image_1.onload = function () {
                        _OnImageReadyAsync(image_1, engine, expandTexture, rgbdPostProcess, url, face, i, generateNonLODTextures, lodTextures, cubeRtt, texture)
                            .then(function () { return resolve(); })
                            .catch(function (reason) {
                            reject(reason);
                        });
                    };
                    image_1.onerror = function (error) {
                        reject(error);
                    };
                });
            }
            promises.push(promise);
        };
        // All faces
        for (var face = 0; face < 6; face++) {
            _loop_2(face);
        }
    };
    // All mipmaps up to provided number of images
    for (var i = 0; i < imageData.length; i++) {
        _loop_1(i);
    }
    // Fill remaining mipmaps with black textures.
    if (imageData.length < mipmapsCount) {
        var data = void 0;
        var size = Math.pow(2, mipmapsCount - 1 - imageData.length);
        var dataLength = size * size * 4;
        switch (texture.type) {
            case 0: {
                data = new Uint8Array(dataLength);
                break;
            }
            case 2: {
                data = new Uint16Array(dataLength);
                break;
            }
            case 1: {
                data = new Float32Array(dataLength);
                break;
            }
        }
        for (var i = imageData.length; i < mipmapsCount; i++) {
            for (var face = 0; face < 6; face++) {
                engine._uploadArrayBufferViewToTexture(texture, data, face, i);
            }
        }
    }
    // Once all done, finishes the cleanup and return
    return Promise.all(promises).then(function () {
        // Release temp RTT.
        if (cubeRtt) {
            engine._releaseTexture(texture);
            cubeRtt._swapAndDie(texture);
        }
        // Release temp Post Process.
        if (rgbdPostProcess) {
            rgbdPostProcess.dispose();
        }
        // Flag internal texture as ready in case they are in use.
        if (generateNonLODTextures) {
            if (texture._lodTextureHigh && texture._lodTextureHigh._texture) {
                texture._lodTextureHigh._texture.isReady = true;
            }
            if (texture._lodTextureMid && texture._lodTextureMid._texture) {
                texture._lodTextureMid._texture.isReady = true;
            }
            if (texture._lodTextureLow && texture._lodTextureLow._texture) {
                texture._lodTextureLow._texture.isReady = true;
            }
        }
    });
}
/**
 * Uploads spherical polynomials information to the texture.
 * @param texture defines the texture we are trying to upload the information to
 * @param info defines the environment texture info retrieved through the GetEnvInfo method
 */
export function UploadEnvSpherical(texture, info) {
    info = normalizeEnvInfo(info);
    var irradianceInfo = info.irradiance;
    if (!irradianceInfo) {
        return;
    }
    var sp = new SphericalPolynomial();
    Vector3.FromArrayToRef(irradianceInfo.x, 0, sp.x);
    Vector3.FromArrayToRef(irradianceInfo.y, 0, sp.y);
    Vector3.FromArrayToRef(irradianceInfo.z, 0, sp.z);
    Vector3.FromArrayToRef(irradianceInfo.xx, 0, sp.xx);
    Vector3.FromArrayToRef(irradianceInfo.yy, 0, sp.yy);
    Vector3.FromArrayToRef(irradianceInfo.zz, 0, sp.zz);
    Vector3.FromArrayToRef(irradianceInfo.yz, 0, sp.yz);
    Vector3.FromArrayToRef(irradianceInfo.zx, 0, sp.zx);
    Vector3.FromArrayToRef(irradianceInfo.xy, 0, sp.xy);
    texture._sphericalPolynomial = sp;
}
/**
 * @param internalTexture
 * @param data
 * @param sphericalPolynomial
 * @param lodScale
 * @param lodOffset
 * @hidden
 */
export function _UpdateRGBDAsync(internalTexture, data, sphericalPolynomial, lodScale, lodOffset) {
    var proxy = internalTexture
        .getEngine()
        .createRawCubeTexture(null, internalTexture.width, internalTexture.format, internalTexture.type, internalTexture.generateMipMaps, internalTexture.invertY, internalTexture.samplingMode, internalTexture._compression);
    var proxyPromise = UploadLevelsAsync(proxy, data).then(function () { return internalTexture; });
    internalTexture.onRebuildCallback = function (_internalTexture) {
        return {
            proxy: proxyPromise,
            isReady: true,
            isAsync: true,
        };
    };
    internalTexture._source = InternalTextureSource.CubeRawRGBD;
    internalTexture._bufferViewArrayArray = data;
    internalTexture._lodGenerationScale = lodScale;
    internalTexture._lodGenerationOffset = lodOffset;
    internalTexture._sphericalPolynomial = sphericalPolynomial;
    return UploadLevelsAsync(internalTexture, data).then(function () {
        internalTexture.isReady = true;
        return internalTexture;
    });
}
/**
 * Sets of helpers addressing the serialization and deserialization of environment texture
 * stored in a BabylonJS env file.
 * Those files are usually stored as .env files.
 */
export var EnvironmentTextureTools = {
    /**
     * Gets the environment info from an env file.
     * @param data The array buffer containing the .env bytes.
     * @returns the environment file info (the json header) if successfully parsed, normalized to the latest supported version.
     */
    GetEnvInfo: GetEnvInfo,
    /**
     * Creates an environment texture from a loaded cube texture.
     * @param texture defines the cube texture to convert in env file
     * @param options options for the conversion process
     * @param options.imageType the mime type for the encoded images, with support for "image/png" (default) and "image/webp"
     * @param options.imageQuality the image quality of encoded WebP images.
     * @return a promise containing the environment data if successful.
     */
    CreateEnvTextureAsync: CreateEnvTextureAsync,
    /**
     * Creates the ArrayBufferViews used for initializing environment texture image data.
     * @param data the image data
     * @param info parameters that determine what views will be created for accessing the underlying buffer
     * @return the views described by info providing access to the underlying buffer
     */
    CreateImageDataArrayBufferViews: CreateImageDataArrayBufferViews,
    /**
     * Uploads the texture info contained in the env file to the GPU.
     * @param texture defines the internal texture to upload to
     * @param data defines the data to load
     * @param info defines the texture info retrieved through the GetEnvInfo method
     * @returns a promise
     */
    UploadEnvLevelsAsync: UploadEnvLevelsAsync,
    /**
     * Uploads the levels of image data to the GPU.
     * @param texture defines the internal texture to upload to
     * @param imageData defines the array buffer views of image data [mipmap][face]
     * @param imageType the mime type of the image data
     * @returns a promise
     */
    UploadLevelsAsync: UploadLevelsAsync,
    /**
     * Uploads spherical polynomials information to the texture.
     * @param texture defines the texture we are trying to upload the information to
     * @param info defines the environment texture info retrieved through the GetEnvInfo method
     */
    UploadEnvSpherical: UploadEnvSpherical,
};
//# sourceMappingURL=environmentTextureTools.js.map