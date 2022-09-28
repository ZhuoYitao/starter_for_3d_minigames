import { __decorate, __extends } from "tslib";
import { serialize, serializeAsTexture, expandToProperty, serializeAsColor3 } from "../../Misc/decorators.js";
import { Color3 } from "../../Maths/math.color.js";
import { MaterialFlags } from "../materialFlags.js";
import { MaterialHelper } from "../../Materials/materialHelper.js";
import { Scalar } from "../../Maths/math.scalar.js";
import { TmpVectors } from "../../Maths/math.vector.js";
import { MaterialPluginBase } from "../materialPluginBase.js";

import { MaterialDefines } from "../materialDefines.js";
/**
 * @hidden
 */
var MaterialSubSurfaceDefines = /** @class */ (function (_super) {
    __extends(MaterialSubSurfaceDefines, _super);
    function MaterialSubSurfaceDefines() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.SUBSURFACE = false;
        _this.SS_REFRACTION = false;
        _this.SS_REFRACTION_USE_INTENSITY_FROM_TEXTURE = false;
        _this.SS_TRANSLUCENCY = false;
        _this.SS_TRANSLUCENCY_USE_INTENSITY_FROM_TEXTURE = false;
        _this.SS_SCATTERING = false;
        _this.SS_THICKNESSANDMASK_TEXTURE = false;
        _this.SS_THICKNESSANDMASK_TEXTUREDIRECTUV = 0;
        _this.SS_HAS_THICKNESS = false;
        _this.SS_REFRACTIONINTENSITY_TEXTURE = false;
        _this.SS_REFRACTIONINTENSITY_TEXTUREDIRECTUV = 0;
        _this.SS_TRANSLUCENCYINTENSITY_TEXTURE = false;
        _this.SS_TRANSLUCENCYINTENSITY_TEXTUREDIRECTUV = 0;
        _this.SS_REFRACTIONMAP_3D = false;
        _this.SS_REFRACTIONMAP_OPPOSITEZ = false;
        _this.SS_LODINREFRACTIONALPHA = false;
        _this.SS_GAMMAREFRACTION = false;
        _this.SS_RGBDREFRACTION = false;
        _this.SS_LINEARSPECULARREFRACTION = false;
        _this.SS_LINKREFRACTIONTOTRANSPARENCY = false;
        _this.SS_ALBEDOFORREFRACTIONTINT = false;
        _this.SS_ALBEDOFORTRANSLUCENCYTINT = false;
        _this.SS_USE_LOCAL_REFRACTIONMAP_CUBIC = false;
        _this.SS_USE_THICKNESS_AS_DEPTH = false;
        _this.SS_MASK_FROM_THICKNESS_TEXTURE = false;
        _this.SS_USE_GLTF_TEXTURES = false;
        return _this;
    }
    return MaterialSubSurfaceDefines;
}(MaterialDefines));
export { MaterialSubSurfaceDefines };
/**
 * Plugin that implements the sub surface component of the PBR material
 */
var PBRSubSurfaceConfiguration = /** @class */ (function (_super) {
    __extends(PBRSubSurfaceConfiguration, _super);
    function PBRSubSurfaceConfiguration(material, addToPluginList) {
        if (addToPluginList === void 0) { addToPluginList = true; }
        var _this = _super.call(this, material, "PBRSubSurface", 130, new MaterialSubSurfaceDefines(), addToPluginList) || this;
        _this._isRefractionEnabled = false;
        /**
         * Defines if the refraction is enabled in the material.
         */
        _this.isRefractionEnabled = false;
        _this._isTranslucencyEnabled = false;
        /**
         * Defines if the translucency is enabled in the material.
         */
        _this.isTranslucencyEnabled = false;
        _this._isScatteringEnabled = false;
        /**
         * Defines if the sub surface scattering is enabled in the material.
         */
        _this.isScatteringEnabled = false;
        _this._scatteringDiffusionProfileIndex = 0;
        /**
         * Defines the refraction intensity of the material.
         * The refraction when enabled replaces the Diffuse part of the material.
         * The intensity helps transitioning between diffuse and refraction.
         */
        _this.refractionIntensity = 1;
        /**
         * Defines the translucency intensity of the material.
         * When translucency has been enabled, this defines how much of the "translucency"
         * is added to the diffuse part of the material.
         */
        _this.translucencyIntensity = 1;
        /**
         * When enabled, transparent surfaces will be tinted with the albedo colour (independent of thickness)
         */
        _this.useAlbedoToTintRefraction = false;
        /**
         * When enabled, translucent surfaces will be tinted with the albedo colour (independent of thickness)
         */
        _this.useAlbedoToTintTranslucency = false;
        _this._thicknessTexture = null;
        /**
         * Stores the average thickness of a mesh in a texture (The texture is holding the values linearly).
         * The red (or green if useGltfStyleTextures=true) channel of the texture should contain the thickness remapped between 0 and 1.
         * 0 would mean minimumThickness
         * 1 would mean maximumThickness
         * The other channels might be use as a mask to vary the different effects intensity.
         */
        _this.thicknessTexture = null;
        _this._refractionTexture = null;
        /**
         * Defines the texture to use for refraction.
         */
        _this.refractionTexture = null;
        /** @hidden */
        _this._indexOfRefraction = 1.5;
        /**
         * Index of refraction of the material base layer.
         * https://en.wikipedia.org/wiki/List_of_refractive_indices
         *
         * This does not only impact refraction but also the Base F0 of Dielectric Materials.
         *
         * From dielectric fresnel rules: F0 = square((iorT - iorI) / (iorT + iorI))
         */
        _this.indexOfRefraction = 1.5;
        _this._volumeIndexOfRefraction = -1.0;
        _this._invertRefractionY = false;
        /**
         * Controls if refraction needs to be inverted on Y. This could be useful for procedural texture.
         */
        _this.invertRefractionY = false;
        /** @hidden */
        _this._linkRefractionWithTransparency = false;
        /**
         * This parameters will make the material used its opacity to control how much it is refracting against not.
         * Materials half opaque for instance using refraction could benefit from this control.
         */
        _this.linkRefractionWithTransparency = false;
        /**
         * Defines the minimum thickness stored in the thickness map.
         * If no thickness map is defined, this value will be used to simulate thickness.
         */
        _this.minimumThickness = 0;
        /**
         * Defines the maximum thickness stored in the thickness map.
         */
        _this.maximumThickness = 1;
        /**
         * Defines that the thickness should be used as a measure of the depth volume.
         */
        _this.useThicknessAsDepth = false;
        /**
         * Defines the volume tint of the material.
         * This is used for both translucency and scattering.
         */
        _this.tintColor = Color3.White();
        /**
         * Defines the distance at which the tint color should be found in the media.
         * This is used for refraction only.
         */
        _this.tintColorAtDistance = 1;
        /**
         * Defines how far each channel transmit through the media.
         * It is defined as a color to simplify it selection.
         */
        _this.diffusionDistance = Color3.White();
        _this._useMaskFromThicknessTexture = false;
        /**
         * Stores the intensity of the different subsurface effects in the thickness texture.
         * Note that if refractionIntensityTexture and/or translucencyIntensityTexture is provided it takes precedence over thicknessTexture + useMaskFromThicknessTexture
         * * the green (red if useGltfStyleTextures = true) channel is the refraction intensity.
         * * the blue channel is the translucency intensity.
         */
        _this.useMaskFromThicknessTexture = false;
        _this._refractionIntensityTexture = null;
        /**
         * Stores the intensity of the refraction. If provided, it takes precedence over thicknessTexture + useMaskFromThicknessTexture
         * * the green (red if useGltfStyleTextures = true) channel is the refraction intensity.
         */
        _this.refractionIntensityTexture = null;
        _this._translucencyIntensityTexture = null;
        /**
         * Stores the intensity of the translucency. If provided, it takes precedence over thicknessTexture + useMaskFromThicknessTexture
         * * the blue channel is the translucency intensity.
         */
        _this.translucencyIntensityTexture = null;
        _this._useGltfStyleTextures = false;
        /**
         * Use channels layout used by glTF:
         * * thicknessTexture: the green (instead of red) channel is the thickness
         * * thicknessTexture/refractionIntensityTexture: the red (instead of green) channel is the refraction intensity
         * * thicknessTexture/translucencyIntensityTexture: no change, use the blue channel for the translucency intensity
         */
        _this.useGltfStyleTextures = false;
        _this._scene = material.getScene();
        _this.registerForExtraEvents = true;
        _this._internalMarkAllSubMeshesAsTexturesDirty = material._dirtyCallbacks[1];
        _this._internalMarkScenePrePassDirty = material._dirtyCallbacks[32];
        return _this;
    }
    Object.defineProperty(PBRSubSurfaceConfiguration.prototype, "scatteringDiffusionProfile", {
        /**
         * Diffusion profile for subsurface scattering.
         * Useful for better scattering in the skins or foliages.
         */
        get: function () {
            if (!this._scene.subSurfaceConfiguration) {
                return null;
            }
            return this._scene.subSurfaceConfiguration.ssDiffusionProfileColors[this._scatteringDiffusionProfileIndex];
        },
        set: function (c) {
            if (!this._scene.enableSubSurfaceForPrePass()) {
                // Not supported
                return;
            }
            // addDiffusionProfile automatically checks for doubles
            if (c) {
                this._scatteringDiffusionProfileIndex = this._scene.subSurfaceConfiguration.addDiffusionProfile(c);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRSubSurfaceConfiguration.prototype, "volumeIndexOfRefraction", {
        /**
         * Index of refraction of the material's volume.
         * https://en.wikipedia.org/wiki/List_of_refractive_indices
         *
         * This ONLY impacts refraction. If not provided or given a non-valid value,
         * the volume will use the same IOR as the surface.
         */
        get: function () {
            if (this._volumeIndexOfRefraction >= 1.0) {
                return this._volumeIndexOfRefraction;
            }
            return this._indexOfRefraction;
        },
        set: function (value) {
            if (value >= 1.0) {
                this._volumeIndexOfRefraction = value;
            }
            else {
                this._volumeIndexOfRefraction = -1.0;
            }
        },
        enumerable: false,
        configurable: true
    });
    /** @hidden */
    PBRSubSurfaceConfiguration.prototype._markAllSubMeshesAsTexturesDirty = function () {
        this._enable(this._isRefractionEnabled || this._isTranslucencyEnabled || this._isScatteringEnabled);
        this._internalMarkAllSubMeshesAsTexturesDirty();
    };
    /** @hidden */
    PBRSubSurfaceConfiguration.prototype._markScenePrePassDirty = function () {
        this._internalMarkAllSubMeshesAsTexturesDirty();
        this._internalMarkScenePrePassDirty();
    };
    PBRSubSurfaceConfiguration.prototype.isReadyForSubMesh = function (defines, scene) {
        if (!this._isRefractionEnabled && !this._isTranslucencyEnabled && !this._isScatteringEnabled) {
            return true;
        }
        if (defines._areTexturesDirty) {
            if (scene.texturesEnabled) {
                if (this._thicknessTexture && MaterialFlags.ThicknessTextureEnabled) {
                    if (!this._thicknessTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
                var refractionTexture = this._getRefractionTexture(scene);
                if (refractionTexture && MaterialFlags.RefractionTextureEnabled) {
                    if (!refractionTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
            }
        }
        return true;
    };
    PBRSubSurfaceConfiguration.prototype.prepareDefines = function (defines, scene) {
        if (!this._isRefractionEnabled && !this._isTranslucencyEnabled && !this._isScatteringEnabled) {
            defines.SUBSURFACE = false;
            defines.SS_TRANSLUCENCY = false;
            defines.SS_SCATTERING = false;
            defines.SS_REFRACTION = false;
            return;
        }
        if (defines._areTexturesDirty) {
            defines.SUBSURFACE = true;
            defines.SS_TRANSLUCENCY = this._isTranslucencyEnabled;
            defines.SS_TRANSLUCENCY_USE_INTENSITY_FROM_TEXTURE = false;
            defines.SS_SCATTERING = this._isScatteringEnabled;
            defines.SS_THICKNESSANDMASK_TEXTURE = false;
            defines.SS_REFRACTIONINTENSITY_TEXTURE = false;
            defines.SS_TRANSLUCENCYINTENSITY_TEXTURE = false;
            defines.SS_HAS_THICKNESS = false;
            defines.SS_MASK_FROM_THICKNESS_TEXTURE = false;
            defines.SS_USE_GLTF_TEXTURES = false;
            defines.SS_REFRACTION = false;
            defines.SS_REFRACTION_USE_INTENSITY_FROM_TEXTURE = false;
            defines.SS_REFRACTIONMAP_3D = false;
            defines.SS_GAMMAREFRACTION = false;
            defines.SS_RGBDREFRACTION = false;
            defines.SS_LINEARSPECULARREFRACTION = false;
            defines.SS_REFRACTIONMAP_OPPOSITEZ = false;
            defines.SS_LODINREFRACTIONALPHA = false;
            defines.SS_LINKREFRACTIONTOTRANSPARENCY = false;
            defines.SS_ALBEDOFORREFRACTIONTINT = false;
            defines.SS_ALBEDOFORTRANSLUCENCYTINT = false;
            defines.SS_USE_LOCAL_REFRACTIONMAP_CUBIC = false;
            defines.SS_USE_THICKNESS_AS_DEPTH = false;
            var refractionIntensityTextureIsThicknessTexture = !!this._thicknessTexture &&
                !!this._refractionIntensityTexture &&
                this._refractionIntensityTexture.checkTransformsAreIdentical(this._thicknessTexture) &&
                this._refractionIntensityTexture._texture === this._thicknessTexture._texture;
            var translucencyIntensityTextureIsThicknessTexture = !!this._thicknessTexture &&
                !!this._translucencyIntensityTexture &&
                this._translucencyIntensityTexture.checkTransformsAreIdentical(this._thicknessTexture) &&
                this._translucencyIntensityTexture._texture === this._thicknessTexture._texture;
            // if true, it means the refraction/translucency textures are the same than the thickness texture so there's no need to pass them to the shader, only thicknessTexture
            var useOnlyThicknessTexture = (refractionIntensityTextureIsThicknessTexture || !this._refractionIntensityTexture) &&
                (translucencyIntensityTextureIsThicknessTexture || !this._translucencyIntensityTexture);
            if (defines._areTexturesDirty) {
                if (scene.texturesEnabled) {
                    if (this._thicknessTexture && MaterialFlags.ThicknessTextureEnabled) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._thicknessTexture, defines, "SS_THICKNESSANDMASK_TEXTURE");
                    }
                    if (this._refractionIntensityTexture && MaterialFlags.RefractionIntensityTextureEnabled && !useOnlyThicknessTexture) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._refractionIntensityTexture, defines, "SS_REFRACTIONINTENSITY_TEXTURE");
                    }
                    if (this._translucencyIntensityTexture && MaterialFlags.TranslucencyIntensityTextureEnabled && !useOnlyThicknessTexture) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._translucencyIntensityTexture, defines, "SS_TRANSLUCENCYINTENSITY_TEXTURE");
                    }
                }
            }
            defines.SS_HAS_THICKNESS = this.maximumThickness - this.minimumThickness !== 0.0;
            defines.SS_MASK_FROM_THICKNESS_TEXTURE =
                (this._useMaskFromThicknessTexture || !!this._refractionIntensityTexture || !!this._translucencyIntensityTexture) && useOnlyThicknessTexture;
            defines.SS_USE_GLTF_TEXTURES = this._useGltfStyleTextures;
            defines.SS_REFRACTION_USE_INTENSITY_FROM_TEXTURE = (this._useMaskFromThicknessTexture || !!this._refractionIntensityTexture) && useOnlyThicknessTexture;
            defines.SS_TRANSLUCENCY_USE_INTENSITY_FROM_TEXTURE = (this._useMaskFromThicknessTexture || !!this._translucencyIntensityTexture) && useOnlyThicknessTexture;
            if (this._isRefractionEnabled) {
                if (scene.texturesEnabled) {
                    var refractionTexture = this._getRefractionTexture(scene);
                    if (refractionTexture && MaterialFlags.RefractionTextureEnabled) {
                        defines.SS_REFRACTION = true;
                        defines.SS_REFRACTIONMAP_3D = refractionTexture.isCube;
                        defines.SS_GAMMAREFRACTION = refractionTexture.gammaSpace;
                        defines.SS_RGBDREFRACTION = refractionTexture.isRGBD;
                        defines.SS_LINEARSPECULARREFRACTION = refractionTexture.linearSpecularLOD;
                        defines.SS_REFRACTIONMAP_OPPOSITEZ = refractionTexture.invertZ;
                        defines.SS_LODINREFRACTIONALPHA = refractionTexture.lodLevelInAlpha;
                        defines.SS_LINKREFRACTIONTOTRANSPARENCY = this._linkRefractionWithTransparency;
                        defines.SS_ALBEDOFORREFRACTIONTINT = this.useAlbedoToTintRefraction;
                        defines.SS_USE_LOCAL_REFRACTIONMAP_CUBIC = refractionTexture.isCube && refractionTexture.boundingBoxSize;
                        defines.SS_USE_THICKNESS_AS_DEPTH = this.useThicknessAsDepth;
                    }
                }
            }
            if (this._isTranslucencyEnabled) {
                defines.SS_ALBEDOFORTRANSLUCENCYTINT = this.useAlbedoToTintTranslucency;
            }
        }
    };
    /**
     * Binds the material data (this function is called even if mustRebind() returns false)
     * @param uniformBuffer defines the Uniform buffer to fill in.
     * @param scene defines the scene the material belongs to.
     * @param engine defines the engine the material belongs to.
     * @param subMesh the submesh to bind data for
     */
    PBRSubSurfaceConfiguration.prototype.hardBindForSubMesh = function (uniformBuffer, scene, engine, subMesh) {
        if (!this._isRefractionEnabled && !this._isTranslucencyEnabled && !this._isScatteringEnabled) {
            return;
        }
        subMesh.getRenderingMesh().getWorldMatrix().decompose(TmpVectors.Vector3[0]);
        var thicknessScale = Math.max(Math.abs(TmpVectors.Vector3[0].x), Math.abs(TmpVectors.Vector3[0].y), Math.abs(TmpVectors.Vector3[0].z));
        uniformBuffer.updateFloat2("vThicknessParam", this.minimumThickness * thicknessScale, (this.maximumThickness - this.minimumThickness) * thicknessScale);
    };
    PBRSubSurfaceConfiguration.prototype.bindForSubMesh = function (uniformBuffer, scene, engine, subMesh) {
        if (!this._isRefractionEnabled && !this._isTranslucencyEnabled && !this._isScatteringEnabled) {
            return;
        }
        var defines = subMesh.materialDefines;
        var isFrozen = this._material.isFrozen;
        var realTimeFiltering = this._material.realTimeFiltering;
        var lodBasedMicrosurface = defines.LODBASEDMICROSFURACE;
        var refractionTexture = this._getRefractionTexture(scene);
        if (!uniformBuffer.useUbo || !isFrozen || !uniformBuffer.isSync) {
            if (this._thicknessTexture && MaterialFlags.ThicknessTextureEnabled) {
                uniformBuffer.updateFloat2("vThicknessInfos", this._thicknessTexture.coordinatesIndex, this._thicknessTexture.level);
                MaterialHelper.BindTextureMatrix(this._thicknessTexture, uniformBuffer, "thickness");
            }
            if (this._refractionIntensityTexture && MaterialFlags.RefractionIntensityTextureEnabled && defines.SS_REFRACTIONINTENSITY_TEXTURE) {
                uniformBuffer.updateFloat2("vRefractionIntensityInfos", this._refractionIntensityTexture.coordinatesIndex, this._refractionIntensityTexture.level);
                MaterialHelper.BindTextureMatrix(this._refractionIntensityTexture, uniformBuffer, "refractionIntensity");
            }
            if (this._translucencyIntensityTexture && MaterialFlags.TranslucencyIntensityTextureEnabled && defines.SS_TRANSLUCENCYINTENSITY_TEXTURE) {
                uniformBuffer.updateFloat2("vTranslucencyIntensityInfos", this._translucencyIntensityTexture.coordinatesIndex, this._translucencyIntensityTexture.level);
                MaterialHelper.BindTextureMatrix(this._translucencyIntensityTexture, uniformBuffer, "translucencyIntensity");
            }
            if (refractionTexture && MaterialFlags.RefractionTextureEnabled) {
                uniformBuffer.updateMatrix("refractionMatrix", refractionTexture.getReflectionTextureMatrix());
                var depth = 1.0;
                if (!refractionTexture.isCube) {
                    if (refractionTexture.depth) {
                        depth = refractionTexture.depth;
                    }
                }
                var width = refractionTexture.getSize().width;
                var refractionIor = this.volumeIndexOfRefraction;
                uniformBuffer.updateFloat4("vRefractionInfos", refractionTexture.level, 1 / refractionIor, depth, this._invertRefractionY ? -1 : 1);
                uniformBuffer.updateFloat4("vRefractionMicrosurfaceInfos", width, refractionTexture.lodGenerationScale, refractionTexture.lodGenerationOffset, 1.0 / this.indexOfRefraction);
                if (realTimeFiltering) {
                    uniformBuffer.updateFloat2("vRefractionFilteringInfo", width, Scalar.Log2(width));
                }
                if (refractionTexture.boundingBoxSize) {
                    var cubeTexture = refractionTexture;
                    uniformBuffer.updateVector3("vRefractionPosition", cubeTexture.boundingBoxPosition);
                    uniformBuffer.updateVector3("vRefractionSize", cubeTexture.boundingBoxSize);
                }
            }
            if (this._isScatteringEnabled) {
                uniformBuffer.updateFloat("scatteringDiffusionProfile", this._scatteringDiffusionProfileIndex);
            }
            uniformBuffer.updateColor3("vDiffusionDistance", this.diffusionDistance);
            uniformBuffer.updateFloat4("vTintColor", this.tintColor.r, this.tintColor.g, this.tintColor.b, Math.max(0.00001, this.tintColorAtDistance));
            uniformBuffer.updateFloat3("vSubSurfaceIntensity", this.refractionIntensity, this.translucencyIntensity, 0);
        }
        // Textures
        if (scene.texturesEnabled) {
            if (this._thicknessTexture && MaterialFlags.ThicknessTextureEnabled) {
                uniformBuffer.setTexture("thicknessSampler", this._thicknessTexture);
            }
            if (this._refractionIntensityTexture && MaterialFlags.RefractionIntensityTextureEnabled && defines.SS_REFRACTIONINTENSITY_TEXTURE) {
                uniformBuffer.setTexture("refractionIntensitySampler", this._refractionIntensityTexture);
            }
            if (this._translucencyIntensityTexture && MaterialFlags.TranslucencyIntensityTextureEnabled && defines.SS_TRANSLUCENCYINTENSITY_TEXTURE) {
                uniformBuffer.setTexture("translucencyIntensitySampler", this._translucencyIntensityTexture);
            }
            if (refractionTexture && MaterialFlags.RefractionTextureEnabled) {
                if (lodBasedMicrosurface) {
                    uniformBuffer.setTexture("refractionSampler", refractionTexture);
                }
                else {
                    uniformBuffer.setTexture("refractionSampler", refractionTexture._lodTextureMid || refractionTexture);
                    uniformBuffer.setTexture("refractionSamplerLow", refractionTexture._lodTextureLow || refractionTexture);
                    uniformBuffer.setTexture("refractionSamplerHigh", refractionTexture._lodTextureHigh || refractionTexture);
                }
            }
        }
    };
    /**
     * Returns the texture used for refraction or null if none is used.
     * @param scene defines the scene the material belongs to.
     * @returns - Refraction texture if present.  If no refraction texture and refraction
     * is linked with transparency, returns environment texture.  Otherwise, returns null.
     */
    PBRSubSurfaceConfiguration.prototype._getRefractionTexture = function (scene) {
        if (this._refractionTexture) {
            return this._refractionTexture;
        }
        if (this._isRefractionEnabled) {
            return scene.environmentTexture;
        }
        return null;
    };
    Object.defineProperty(PBRSubSurfaceConfiguration.prototype, "disableAlphaBlending", {
        /**
         * Returns true if alpha blending should be disabled.
         */
        get: function () {
            return this._isRefractionEnabled && this._linkRefractionWithTransparency;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Fills the list of render target textures.
     * @param renderTargets the list of render targets to update
     */
    PBRSubSurfaceConfiguration.prototype.fillRenderTargetTextures = function (renderTargets) {
        if (MaterialFlags.RefractionTextureEnabled && this._refractionTexture && this._refractionTexture.isRenderTarget) {
            renderTargets.push(this._refractionTexture);
        }
    };
    PBRSubSurfaceConfiguration.prototype.hasTexture = function (texture) {
        if (this._thicknessTexture === texture) {
            return true;
        }
        if (this._refractionTexture === texture) {
            return true;
        }
        return false;
    };
    PBRSubSurfaceConfiguration.prototype.hasRenderTargetTextures = function () {
        if (MaterialFlags.RefractionTextureEnabled && this._refractionTexture && this._refractionTexture.isRenderTarget) {
            return true;
        }
        return false;
    };
    PBRSubSurfaceConfiguration.prototype.getActiveTextures = function (activeTextures) {
        if (this._thicknessTexture) {
            activeTextures.push(this._thicknessTexture);
        }
        if (this._refractionTexture) {
            activeTextures.push(this._refractionTexture);
        }
    };
    PBRSubSurfaceConfiguration.prototype.getAnimatables = function (animatables) {
        if (this._thicknessTexture && this._thicknessTexture.animations && this._thicknessTexture.animations.length > 0) {
            animatables.push(this._thicknessTexture);
        }
        if (this._refractionTexture && this._refractionTexture.animations && this._refractionTexture.animations.length > 0) {
            animatables.push(this._refractionTexture);
        }
    };
    PBRSubSurfaceConfiguration.prototype.dispose = function (forceDisposeTextures) {
        if (forceDisposeTextures) {
            if (this._thicknessTexture) {
                this._thicknessTexture.dispose();
            }
            if (this._refractionTexture) {
                this._refractionTexture.dispose();
            }
        }
    };
    PBRSubSurfaceConfiguration.prototype.getClassName = function () {
        return "PBRSubSurfaceConfiguration";
    };
    PBRSubSurfaceConfiguration.prototype.addFallbacks = function (defines, fallbacks, currentRank) {
        if (defines.SS_SCATTERING) {
            fallbacks.addFallback(currentRank++, "SS_SCATTERING");
        }
        if (defines.SS_TRANSLUCENCY) {
            fallbacks.addFallback(currentRank++, "SS_TRANSLUCENCY");
        }
        return currentRank;
    };
    PBRSubSurfaceConfiguration.prototype.getSamplers = function (samplers) {
        samplers.push("thicknessSampler", "refractionIntensitySampler", "translucencyIntensitySampler", "refractionSampler", "refractionSamplerLow", "refractionSamplerHigh");
    };
    PBRSubSurfaceConfiguration.prototype.getUniforms = function () {
        return {
            ubo: [
                { name: "vRefractionMicrosurfaceInfos", size: 4, type: "vec4" },
                { name: "vRefractionFilteringInfo", size: 2, type: "vec2" },
                { name: "vTranslucencyIntensityInfos", size: 2, type: "vec2" },
                { name: "vRefractionInfos", size: 4, type: "vec4" },
                { name: "refractionMatrix", size: 16, type: "mat4" },
                { name: "vThicknessInfos", size: 2, type: "vec2" },
                { name: "vRefractionIntensityInfos", size: 2, type: "vec2" },
                { name: "thicknessMatrix", size: 16, type: "mat4" },
                { name: "refractionIntensityMatrix", size: 16, type: "mat4" },
                { name: "translucencyIntensityMatrix", size: 16, type: "mat4" },
                { name: "vThicknessParam", size: 2, type: "vec2" },
                { name: "vDiffusionDistance", size: 3, type: "vec3" },
                { name: "vTintColor", size: 4, type: "vec4" },
                { name: "vSubSurfaceIntensity", size: 3, type: "vec3" },
                { name: "vRefractionPosition", size: 3, type: "vec3" },
                { name: "vRefractionSize", size: 3, type: "vec3" },
                { name: "scatteringDiffusionProfile", size: 1, type: "float" },
            ],
        };
    };
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "isRefractionEnabled", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "isTranslucencyEnabled", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markScenePrePassDirty")
    ], PBRSubSurfaceConfiguration.prototype, "isScatteringEnabled", void 0);
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "_scatteringDiffusionProfileIndex", void 0);
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "refractionIntensity", void 0);
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "translucencyIntensity", void 0);
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "useAlbedoToTintRefraction", void 0);
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "useAlbedoToTintTranslucency", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "thicknessTexture", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "refractionTexture", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "indexOfRefraction", void 0);
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "_volumeIndexOfRefraction", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "volumeIndexOfRefraction", null);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "invertRefractionY", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "linkRefractionWithTransparency", void 0);
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "minimumThickness", void 0);
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "maximumThickness", void 0);
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "useThicknessAsDepth", void 0);
    __decorate([
        serializeAsColor3()
    ], PBRSubSurfaceConfiguration.prototype, "tintColor", void 0);
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "tintColorAtDistance", void 0);
    __decorate([
        serializeAsColor3()
    ], PBRSubSurfaceConfiguration.prototype, "diffusionDistance", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "useMaskFromThicknessTexture", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "refractionIntensityTexture", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "translucencyIntensityTexture", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "useGltfStyleTextures", void 0);
    return PBRSubSurfaceConfiguration;
}(MaterialPluginBase));
export { PBRSubSurfaceConfiguration };
//# sourceMappingURL=pbrSubSurfaceConfiguration.js.map