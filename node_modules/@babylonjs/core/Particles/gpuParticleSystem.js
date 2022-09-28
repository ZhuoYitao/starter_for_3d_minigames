import { __assign, __extends } from "tslib";
import { FactorGradient, ColorGradient, GradientHelper } from "../Misc/gradients.js";
import { Observable } from "../Misc/observable.js";
import { Matrix, TmpVectors } from "../Maths/math.vector.js";
import { Color4, TmpColors } from "../Maths/math.color.js";
import { Scalar } from "../Maths/math.scalar.js";
import { VertexBuffer, Buffer } from "../Buffers/buffer.js";
import { BaseParticleSystem } from "./baseParticleSystem.js";
import { ParticleSystem } from "./particleSystem.js";
import { BoxParticleEmitter } from "../Particles/EmitterTypes/boxParticleEmitter.js";
import { MaterialHelper } from "../Materials/materialHelper.js";
import { ImageProcessingConfiguration } from "../Materials/imageProcessingConfiguration.js";
import { RawTexture } from "../Materials/Textures/rawTexture.js";

import { EngineStore } from "../Engines/engineStore.js";
import { CustomParticleEmitter } from "./EmitterTypes/customParticleEmitter.js";
import { ThinEngine } from "../Engines/thinEngine.js";
import { DrawWrapper } from "../Materials/drawWrapper.js";
import "../Shaders/gpuRenderParticles.fragment.js";
import "../Shaders/gpuRenderParticles.vertex.js";
import { GetClass } from "../Misc/typeStore.js";
/**
 * This represents a GPU particle system in Babylon
 * This is the fastest particle system in Babylon as it uses the GPU to update the individual particle data
 * @see https://www.babylonjs-playground.com/#PU4WYI#4
 */
var GPUParticleSystem = /** @class */ (function (_super) {
    __extends(GPUParticleSystem, _super);
    /**
     * Instantiates a GPU particle system.
     * Particles are often small sprites used to simulate hard-to-reproduce phenomena like fire, smoke, water, or abstract visual effects like magic glitter and faery dust.
     * @param name The name of the particle system
     * @param options The options used to create the system
     * @param sceneOrEngine The scene the particle system belongs to or the engine to use if no scene
     * @param customEffect a custom effect used to change the way particles are rendered by default
     * @param isAnimationSheetEnabled Must be true if using a spritesheet to animate the particles texture
     */
    function GPUParticleSystem(name, options, sceneOrEngine, customEffect, isAnimationSheetEnabled) {
        if (customEffect === void 0) { customEffect = null; }
        if (isAnimationSheetEnabled === void 0) { isAnimationSheetEnabled = false; }
        var _this = _super.call(this, name) || this;
        /**
         * The layer mask we are rendering the particles through.
         */
        _this.layerMask = 0x0fffffff;
        _this._accumulatedCount = 0;
        _this._targetIndex = 0;
        _this._currentRenderId = -1;
        _this._currentRenderingCameraUniqueId = -1;
        _this._started = false;
        _this._stopped = false;
        _this._timeDelta = 0;
        _this._actualFrame = 0;
        _this._rawTextureWidth = 256;
        /**
         * An event triggered when the system is disposed.
         */
        _this.onDisposeObservable = new Observable();
        /**
         * An event triggered when the system is stopped
         */
        _this.onStoppedObservable = new Observable();
        /**
         * Forces the particle to write their depth information to the depth buffer. This can help preventing other draw calls
         * to override the particles.
         */
        _this.forceDepthWrite = false;
        _this._preWarmDone = false;
        /**
         * Specifies if the particles are updated in emitter local space or world space.
         */
        _this.isLocal = false;
        /** @hidden */
        _this._onBeforeDrawParticlesObservable = null;
        if (!sceneOrEngine || sceneOrEngine.getClassName() === "Scene") {
            _this._scene = sceneOrEngine || EngineStore.LastCreatedScene;
            _this._engine = _this._scene.getEngine();
            _this.uniqueId = _this._scene.getUniqueId();
            _this._scene.particleSystems.push(_this);
        }
        else {
            _this._engine = sceneOrEngine;
            _this.defaultProjectionMatrix = Matrix.PerspectiveFovLH(0.8, 1, 0.1, 100, _this._engine.isNDCHalfZRange);
        }
        if (_this._engine.getCaps().supportComputeShaders) {
            if (!GetClass("BABYLON.ComputeShaderParticleSystem")) {
                throw new Error("The ComputeShaderParticleSystem class is not available! Make sure you have imported it.");
            }
            _this._platform = new (GetClass("BABYLON.ComputeShaderParticleSystem"))(_this, _this._engine);
        }
        else {
            if (!GetClass("BABYLON.WebGL2ParticleSystem")) {
                throw new Error("The WebGL2ParticleSystem class is not available! Make sure you have imported it.");
            }
            _this._platform = new (GetClass("BABYLON.WebGL2ParticleSystem"))(_this, _this._engine);
        }
        _this._customWrappers = { 0: new DrawWrapper(_this._engine) };
        _this._customWrappers[0].effect = customEffect;
        _this._drawWrappers = { 0: new DrawWrapper(_this._engine) };
        if (_this._drawWrappers[0].drawContext) {
            _this._drawWrappers[0].drawContext.useInstancing = true;
        }
        // Setup the default processing configuration to the scene.
        _this._attachImageProcessingConfiguration(null);
        options = options !== null && options !== void 0 ? options : {};
        if (!options.randomTextureSize) {
            delete options.randomTextureSize;
        }
        var fullOptions = __assign({ capacity: 50000, randomTextureSize: _this._engine.getCaps().maxTextureSize }, options);
        var optionsAsNumber = options;
        if (isFinite(optionsAsNumber)) {
            fullOptions.capacity = optionsAsNumber;
        }
        _this._capacity = fullOptions.capacity;
        _this._activeCount = fullOptions.capacity;
        _this._currentActiveCount = 0;
        _this._isAnimationSheetEnabled = isAnimationSheetEnabled;
        _this.particleEmitterType = new BoxParticleEmitter();
        // Random data
        var maxTextureSize = Math.min(_this._engine.getCaps().maxTextureSize, fullOptions.randomTextureSize);
        var d = [];
        for (var i = 0; i < maxTextureSize; ++i) {
            d.push(Math.random());
            d.push(Math.random());
            d.push(Math.random());
            d.push(Math.random());
        }
        _this._randomTexture = new RawTexture(new Float32Array(d), maxTextureSize, 1, 5, sceneOrEngine, false, false, 1, 1);
        _this._randomTexture.name = "GPUParticleSystem_random1";
        _this._randomTexture.wrapU = 1;
        _this._randomTexture.wrapV = 1;
        d = [];
        for (var i = 0; i < maxTextureSize; ++i) {
            d.push(Math.random());
            d.push(Math.random());
            d.push(Math.random());
            d.push(Math.random());
        }
        _this._randomTexture2 = new RawTexture(new Float32Array(d), maxTextureSize, 1, 5, sceneOrEngine, false, false, 1, 1);
        _this._randomTexture2.name = "GPUParticleSystem_random2";
        _this._randomTexture2.wrapU = 1;
        _this._randomTexture2.wrapV = 1;
        _this._randomTextureSize = maxTextureSize;
        return _this;
    }
    Object.defineProperty(GPUParticleSystem, "IsSupported", {
        /**
         * Gets a boolean indicating if the GPU particles can be rendered on current browser
         */
        get: function () {
            if (!EngineStore.LastCreatedEngine) {
                return false;
            }
            var caps = EngineStore.LastCreatedEngine.getCaps();
            return caps.supportTransformFeedbacks || caps.supportComputeShaders;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the maximum number of particles active at the same time.
     * @returns The max number of active particles.
     */
    GPUParticleSystem.prototype.getCapacity = function () {
        return this._capacity;
    };
    Object.defineProperty(GPUParticleSystem.prototype, "activeParticleCount", {
        /**
         * Gets or set the number of active particles
         */
        get: function () {
            return this._activeCount;
        },
        set: function (value) {
            this._activeCount = Math.min(value, this._capacity);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Is this system ready to be used/rendered
     * @return true if the system is ready
     */
    GPUParticleSystem.prototype.isReady = function () {
        if (!this.emitter || (this._imageProcessingConfiguration && !this._imageProcessingConfiguration.isReady()) || !this.particleTexture || !this.particleTexture.isReady()) {
            return false;
        }
        if (this.blendMode !== ParticleSystem.BLENDMODE_MULTIPLYADD) {
            if (!this._getWrapper(this.blendMode).effect.isReady()) {
                return false;
            }
        }
        else {
            if (!this._getWrapper(ParticleSystem.BLENDMODE_MULTIPLY).effect.isReady()) {
                return false;
            }
            if (!this._getWrapper(ParticleSystem.BLENDMODE_ADD).effect.isReady()) {
                return false;
            }
        }
        if (!this._platform.isUpdateBufferCreated()) {
            this._recreateUpdateEffect();
            return false;
        }
        return this._platform.isUpdateBufferReady();
    };
    /**
     * Gets if the system has been started. (Note: this will still be true after stop is called)
     * @returns True if it has been started, otherwise false.
     */
    GPUParticleSystem.prototype.isStarted = function () {
        return this._started;
    };
    /**
     * Gets if the system has been stopped. (Note: rendering is still happening but the system is frozen)
     * @returns True if it has been stopped, otherwise false.
     */
    GPUParticleSystem.prototype.isStopped = function () {
        return this._stopped;
    };
    /**
     * Gets a boolean indicating that the system is stopping
     * @returns true if the system is currently stopping
     */
    GPUParticleSystem.prototype.isStopping = function () {
        return false; // Stop is immediate on GPU
    };
    /**
     * Gets the number of particles active at the same time.
     * @returns The number of active particles.
     */
    GPUParticleSystem.prototype.getActiveCount = function () {
        return this._currentActiveCount;
    };
    /**
     * Starts the particle system and begins to emit
     * @param delay defines the delay in milliseconds before starting the system (this.startDelay by default)
     */
    GPUParticleSystem.prototype.start = function (delay) {
        var _this = this;
        if (delay === void 0) { delay = this.startDelay; }
        if (!this.targetStopDuration && this._hasTargetStopDurationDependantGradient()) {
            throw "Particle system started with a targetStopDuration dependant gradient (eg. startSizeGradients) but no targetStopDuration set";
        }
        if (delay) {
            setTimeout(function () {
                _this.start(0);
            }, delay);
            return;
        }
        this._started = true;
        this._stopped = false;
        this._preWarmDone = false;
        // Animations
        if (this.beginAnimationOnStart && this.animations && this.animations.length > 0 && this._scene) {
            this._scene.beginAnimation(this, this.beginAnimationFrom, this.beginAnimationTo, this.beginAnimationLoop);
        }
    };
    /**
     * Stops the particle system.
     */
    GPUParticleSystem.prototype.stop = function () {
        if (this._stopped) {
            return;
        }
        this._stopped = true;
    };
    /**
     * Remove all active particles
     */
    GPUParticleSystem.prototype.reset = function () {
        this._releaseBuffers();
        this._platform.releaseVertexBuffers();
        this._currentActiveCount = 0;
        this._targetIndex = 0;
    };
    /**
     * Returns the string "GPUParticleSystem"
     * @returns a string containing the class name
     */
    GPUParticleSystem.prototype.getClassName = function () {
        return "GPUParticleSystem";
    };
    /**
     * Gets the custom effect used to render the particles
     * @param blendMode Blend mode for which the effect should be retrieved
     * @returns The effect
     */
    GPUParticleSystem.prototype.getCustomEffect = function (blendMode) {
        var _a, _b;
        if (blendMode === void 0) { blendMode = 0; }
        return (_b = (_a = this._customWrappers[blendMode]) === null || _a === void 0 ? void 0 : _a.effect) !== null && _b !== void 0 ? _b : this._customWrappers[0].effect;
    };
    GPUParticleSystem.prototype._getCustomDrawWrapper = function (blendMode) {
        var _a;
        if (blendMode === void 0) { blendMode = 0; }
        return (_a = this._customWrappers[blendMode]) !== null && _a !== void 0 ? _a : this._customWrappers[0];
    };
    /**
     * Sets the custom effect used to render the particles
     * @param effect The effect to set
     * @param blendMode Blend mode for which the effect should be set
     */
    GPUParticleSystem.prototype.setCustomEffect = function (effect, blendMode) {
        if (blendMode === void 0) { blendMode = 0; }
        this._customWrappers[blendMode] = new DrawWrapper(this._engine);
        this._customWrappers[blendMode].effect = effect;
    };
    Object.defineProperty(GPUParticleSystem.prototype, "onBeforeDrawParticlesObservable", {
        /**
         * Observable that will be called just before the particles are drawn
         */
        get: function () {
            if (!this._onBeforeDrawParticlesObservable) {
                this._onBeforeDrawParticlesObservable = new Observable();
            }
            return this._onBeforeDrawParticlesObservable;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GPUParticleSystem.prototype, "vertexShaderName", {
        /**
         * Gets the name of the particle vertex shader
         */
        get: function () {
            return "gpuRenderParticles";
        },
        enumerable: false,
        configurable: true
    });
    GPUParticleSystem.prototype._removeGradientAndTexture = function (gradient, gradients, texture) {
        _super.prototype._removeGradientAndTexture.call(this, gradient, gradients, texture);
        this._releaseBuffers();
        return this;
    };
    /**
     * Adds a new color gradient
     * @param gradient defines the gradient to use (between 0 and 1)
     * @param color1 defines the color to affect to the specified gradient
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.addColorGradient = function (gradient, color1) {
        if (!this._colorGradients) {
            this._colorGradients = [];
        }
        var colorGradient = new ColorGradient(gradient, color1);
        this._colorGradients.push(colorGradient);
        this._refreshColorGradient(true);
        this._releaseBuffers();
        return this;
    };
    GPUParticleSystem.prototype._refreshColorGradient = function (reorder) {
        if (reorder === void 0) { reorder = false; }
        if (this._colorGradients) {
            if (reorder) {
                this._colorGradients.sort(function (a, b) {
                    if (a.gradient < b.gradient) {
                        return -1;
                    }
                    else if (a.gradient > b.gradient) {
                        return 1;
                    }
                    return 0;
                });
            }
            if (this._colorGradientsTexture) {
                this._colorGradientsTexture.dispose();
                this._colorGradientsTexture = null;
            }
        }
    };
    /** Force the system to rebuild all gradients that need to be resync */
    GPUParticleSystem.prototype.forceRefreshGradients = function () {
        this._refreshColorGradient();
        this._refreshFactorGradient(this._sizeGradients, "_sizeGradientsTexture");
        this._refreshFactorGradient(this._angularSpeedGradients, "_angularSpeedGradientsTexture");
        this._refreshFactorGradient(this._velocityGradients, "_velocityGradientsTexture");
        this._refreshFactorGradient(this._limitVelocityGradients, "_limitVelocityGradientsTexture");
        this._refreshFactorGradient(this._dragGradients, "_dragGradientsTexture");
        this.reset();
    };
    /**
     * Remove a specific color gradient
     * @param gradient defines the gradient to remove
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.removeColorGradient = function (gradient) {
        this._removeGradientAndTexture(gradient, this._colorGradients, this._colorGradientsTexture);
        this._colorGradientsTexture = null;
        return this;
    };
    /**
     * Resets the draw wrappers cache
     */
    GPUParticleSystem.prototype.resetDrawCache = function () {
        var _a;
        for (var blendMode in this._drawWrappers) {
            var drawWrapper = this._drawWrappers[blendMode];
            (_a = drawWrapper.drawContext) === null || _a === void 0 ? void 0 : _a.reset();
        }
    };
    GPUParticleSystem.prototype._addFactorGradient = function (factorGradients, gradient, factor) {
        var valueGradient = new FactorGradient(gradient, factor);
        factorGradients.push(valueGradient);
        this._releaseBuffers();
    };
    /**
     * Adds a new size gradient
     * @param gradient defines the gradient to use (between 0 and 1)
     * @param factor defines the size factor to affect to the specified gradient
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.addSizeGradient = function (gradient, factor) {
        if (!this._sizeGradients) {
            this._sizeGradients = [];
        }
        this._addFactorGradient(this._sizeGradients, gradient, factor);
        this._refreshFactorGradient(this._sizeGradients, "_sizeGradientsTexture", true);
        this._releaseBuffers();
        return this;
    };
    /**
     * Remove a specific size gradient
     * @param gradient defines the gradient to remove
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.removeSizeGradient = function (gradient) {
        this._removeGradientAndTexture(gradient, this._sizeGradients, this._sizeGradientsTexture);
        this._sizeGradientsTexture = null;
        return this;
    };
    GPUParticleSystem.prototype._refreshFactorGradient = function (factorGradients, textureName, reorder) {
        if (reorder === void 0) { reorder = false; }
        if (!factorGradients) {
            return;
        }
        if (reorder) {
            factorGradients.sort(function (a, b) {
                if (a.gradient < b.gradient) {
                    return -1;
                }
                else if (a.gradient > b.gradient) {
                    return 1;
                }
                return 0;
            });
        }
        var that = this;
        if (that[textureName]) {
            that[textureName].dispose();
            that[textureName] = null;
        }
    };
    /**
     * Adds a new angular speed gradient
     * @param gradient defines the gradient to use (between 0 and 1)
     * @param factor defines the angular speed to affect to the specified gradient
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.addAngularSpeedGradient = function (gradient, factor) {
        if (!this._angularSpeedGradients) {
            this._angularSpeedGradients = [];
        }
        this._addFactorGradient(this._angularSpeedGradients, gradient, factor);
        this._refreshFactorGradient(this._angularSpeedGradients, "_angularSpeedGradientsTexture", true);
        this._releaseBuffers();
        return this;
    };
    /**
     * Remove a specific angular speed gradient
     * @param gradient defines the gradient to remove
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.removeAngularSpeedGradient = function (gradient) {
        this._removeGradientAndTexture(gradient, this._angularSpeedGradients, this._angularSpeedGradientsTexture);
        this._angularSpeedGradientsTexture = null;
        return this;
    };
    /**
     * Adds a new velocity gradient
     * @param gradient defines the gradient to use (between 0 and 1)
     * @param factor defines the velocity to affect to the specified gradient
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.addVelocityGradient = function (gradient, factor) {
        if (!this._velocityGradients) {
            this._velocityGradients = [];
        }
        this._addFactorGradient(this._velocityGradients, gradient, factor);
        this._refreshFactorGradient(this._velocityGradients, "_velocityGradientsTexture", true);
        this._releaseBuffers();
        return this;
    };
    /**
     * Remove a specific velocity gradient
     * @param gradient defines the gradient to remove
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.removeVelocityGradient = function (gradient) {
        this._removeGradientAndTexture(gradient, this._velocityGradients, this._velocityGradientsTexture);
        this._velocityGradientsTexture = null;
        return this;
    };
    /**
     * Adds a new limit velocity gradient
     * @param gradient defines the gradient to use (between 0 and 1)
     * @param factor defines the limit velocity value to affect to the specified gradient
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.addLimitVelocityGradient = function (gradient, factor) {
        if (!this._limitVelocityGradients) {
            this._limitVelocityGradients = [];
        }
        this._addFactorGradient(this._limitVelocityGradients, gradient, factor);
        this._refreshFactorGradient(this._limitVelocityGradients, "_limitVelocityGradientsTexture", true);
        this._releaseBuffers();
        return this;
    };
    /**
     * Remove a specific limit velocity gradient
     * @param gradient defines the gradient to remove
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.removeLimitVelocityGradient = function (gradient) {
        this._removeGradientAndTexture(gradient, this._limitVelocityGradients, this._limitVelocityGradientsTexture);
        this._limitVelocityGradientsTexture = null;
        return this;
    };
    /**
     * Adds a new drag gradient
     * @param gradient defines the gradient to use (between 0 and 1)
     * @param factor defines the drag value to affect to the specified gradient
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.addDragGradient = function (gradient, factor) {
        if (!this._dragGradients) {
            this._dragGradients = [];
        }
        this._addFactorGradient(this._dragGradients, gradient, factor);
        this._refreshFactorGradient(this._dragGradients, "_dragGradientsTexture", true);
        this._releaseBuffers();
        return this;
    };
    /**
     * Remove a specific drag gradient
     * @param gradient defines the gradient to remove
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.removeDragGradient = function (gradient) {
        this._removeGradientAndTexture(gradient, this._dragGradients, this._dragGradientsTexture);
        this._dragGradientsTexture = null;
        return this;
    };
    /**
     * Not supported by GPUParticleSystem
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.addEmitRateGradient = function () {
        // Do nothing as emit rate is not supported by GPUParticleSystem
        return this;
    };
    /**
     * Not supported by GPUParticleSystem
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.removeEmitRateGradient = function () {
        // Do nothing as emit rate is not supported by GPUParticleSystem
        return this;
    };
    /**
     * Not supported by GPUParticleSystem
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.addStartSizeGradient = function () {
        // Do nothing as start size is not supported by GPUParticleSystem
        return this;
    };
    /**
     * Not supported by GPUParticleSystem
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.removeStartSizeGradient = function () {
        // Do nothing as start size is not supported by GPUParticleSystem
        return this;
    };
    /**
     * Not supported by GPUParticleSystem
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.addColorRemapGradient = function () {
        // Do nothing as start size is not supported by GPUParticleSystem
        return this;
    };
    /**
     * Not supported by GPUParticleSystem
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.removeColorRemapGradient = function () {
        // Do nothing as start size is not supported by GPUParticleSystem
        return this;
    };
    /**
     * Not supported by GPUParticleSystem
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.addAlphaRemapGradient = function () {
        // Do nothing as start size is not supported by GPUParticleSystem
        return this;
    };
    /**
     * Not supported by GPUParticleSystem
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.removeAlphaRemapGradient = function () {
        // Do nothing as start size is not supported by GPUParticleSystem
        return this;
    };
    /**
     * Not supported by GPUParticleSystem
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.addRampGradient = function () {
        //Not supported by GPUParticleSystem
        return this;
    };
    /**
     * Not supported by GPUParticleSystem
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.removeRampGradient = function () {
        //Not supported by GPUParticleSystem
        return this;
    };
    /**
     * Not supported by GPUParticleSystem
     * @returns the list of ramp gradients
     */
    GPUParticleSystem.prototype.getRampGradients = function () {
        return null;
    };
    Object.defineProperty(GPUParticleSystem.prototype, "useRampGradients", {
        /**
         * Not supported by GPUParticleSystem
         * Gets or sets a boolean indicating that ramp gradients must be used
         * @see https://doc.babylonjs.com/babylon101/particles#ramp-gradients
         */
        get: function () {
            //Not supported by GPUParticleSystem
            return false;
        },
        set: function (value) {
            //Not supported by GPUParticleSystem
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Not supported by GPUParticleSystem
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.addLifeTimeGradient = function () {
        //Not supported by GPUParticleSystem
        return this;
    };
    /**
     * Not supported by GPUParticleSystem
     * @returns the current particle system
     */
    GPUParticleSystem.prototype.removeLifeTimeGradient = function () {
        //Not supported by GPUParticleSystem
        return this;
    };
    GPUParticleSystem.prototype._reset = function () {
        this._releaseBuffers();
    };
    GPUParticleSystem.prototype._createVertexBuffers = function (updateBuffer, renderBuffer, spriteSource) {
        var renderVertexBuffers = {};
        renderVertexBuffers["position"] = renderBuffer.createVertexBuffer("position", 0, 3, this._attributesStrideSize, true);
        var offset = 3;
        renderVertexBuffers["age"] = renderBuffer.createVertexBuffer("age", offset, 1, this._attributesStrideSize, true);
        offset += 1;
        renderVertexBuffers["size"] = renderBuffer.createVertexBuffer("size", offset, 3, this._attributesStrideSize, true);
        offset += 3;
        renderVertexBuffers["life"] = renderBuffer.createVertexBuffer("life", offset, 1, this._attributesStrideSize, true);
        offset += 1;
        offset += 4; // seed
        if (this.billboardMode === ParticleSystem.BILLBOARDMODE_STRETCHED) {
            renderVertexBuffers["direction"] = renderBuffer.createVertexBuffer("direction", offset, 3, this._attributesStrideSize, true);
        }
        offset += 3; // direction
        if (this._platform.alignDataInBuffer) {
            offset += 1;
        }
        if (this.particleEmitterType instanceof CustomParticleEmitter) {
            offset += 3;
            if (this._platform.alignDataInBuffer) {
                offset += 1;
            }
        }
        if (!this._colorGradientsTexture) {
            renderVertexBuffers["color"] = renderBuffer.createVertexBuffer("color", offset, 4, this._attributesStrideSize, true);
            offset += 4;
        }
        if (!this._isBillboardBased) {
            renderVertexBuffers["initialDirection"] = renderBuffer.createVertexBuffer("initialDirection", offset, 3, this._attributesStrideSize, true);
            offset += 3;
            if (this._platform.alignDataInBuffer) {
                offset += 1;
            }
        }
        if (this.noiseTexture) {
            renderVertexBuffers["noiseCoordinates1"] = renderBuffer.createVertexBuffer("noiseCoordinates1", offset, 3, this._attributesStrideSize, true);
            offset += 3;
            if (this._platform.alignDataInBuffer) {
                offset += 1;
            }
            renderVertexBuffers["noiseCoordinates2"] = renderBuffer.createVertexBuffer("noiseCoordinates2", offset, 3, this._attributesStrideSize, true);
            offset += 3;
            if (this._platform.alignDataInBuffer) {
                offset += 1;
            }
        }
        renderVertexBuffers["angle"] = renderBuffer.createVertexBuffer("angle", offset, 1, this._attributesStrideSize, true);
        if (this._angularSpeedGradientsTexture) {
            offset++;
        }
        else {
            offset += 2;
        }
        if (this._isAnimationSheetEnabled) {
            renderVertexBuffers["cellIndex"] = renderBuffer.createVertexBuffer("cellIndex", offset, 1, this._attributesStrideSize, true);
            offset += 1;
            if (this.spriteRandomStartCell) {
                renderVertexBuffers["cellStartOffset"] = renderBuffer.createVertexBuffer("cellStartOffset", offset, 1, this._attributesStrideSize, true);
                offset += 1;
            }
        }
        renderVertexBuffers["offset"] = spriteSource.createVertexBuffer("offset", 0, 2);
        renderVertexBuffers["uv"] = spriteSource.createVertexBuffer("uv", 2, 2);
        this._platform.createVertexBuffers(updateBuffer, renderVertexBuffers);
        this.resetDrawCache();
    };
    GPUParticleSystem.prototype._initialize = function (force) {
        if (force === void 0) { force = false; }
        if (this._buffer0 && !force) {
            return;
        }
        var engine = this._engine;
        var data = new Array();
        this._attributesStrideSize = 21;
        this._targetIndex = 0;
        if (this._platform.alignDataInBuffer) {
            this._attributesStrideSize += 1;
        }
        if (this.particleEmitterType instanceof CustomParticleEmitter) {
            this._attributesStrideSize += 3;
            if (this._platform.alignDataInBuffer) {
                this._attributesStrideSize += 1;
            }
        }
        if (!this.isBillboardBased) {
            this._attributesStrideSize += 3;
            if (this._platform.alignDataInBuffer) {
                this._attributesStrideSize += 1;
            }
        }
        if (this._colorGradientsTexture) {
            this._attributesStrideSize -= 4;
        }
        if (this._angularSpeedGradientsTexture) {
            this._attributesStrideSize -= 1;
        }
        if (this._isAnimationSheetEnabled) {
            this._attributesStrideSize += 1;
            if (this.spriteRandomStartCell) {
                this._attributesStrideSize += 1;
            }
        }
        if (this.noiseTexture) {
            this._attributesStrideSize += 6;
            if (this._platform.alignDataInBuffer) {
                this._attributesStrideSize += 2;
            }
        }
        if (this._platform.alignDataInBuffer) {
            this._attributesStrideSize += 3 - ((this._attributesStrideSize + 3) & 3); // round to multiple of 4
        }
        var usingCustomEmitter = this.particleEmitterType instanceof CustomParticleEmitter;
        var tmpVector = TmpVectors.Vector3[0];
        var offset = 0;
        for (var particleIndex = 0; particleIndex < this._capacity; particleIndex++) {
            // position
            data.push(0.0);
            data.push(0.0);
            data.push(0.0);
            // Age
            data.push(0.0); // create the particle as a dead one to create a new one at start
            // Size
            data.push(0.0);
            data.push(0.0);
            data.push(0.0);
            // life
            data.push(0.0);
            // Seed
            data.push(Math.random());
            data.push(Math.random());
            data.push(Math.random());
            data.push(Math.random());
            // direction
            if (usingCustomEmitter) {
                this.particleEmitterType.particleDestinationGenerator(particleIndex, null, tmpVector);
                data.push(tmpVector.x);
                data.push(tmpVector.y);
                data.push(tmpVector.z);
            }
            else {
                data.push(0.0);
                data.push(0.0);
                data.push(0.0);
            }
            if (this._platform.alignDataInBuffer) {
                data.push(0.0); // dummy0
            }
            offset += 16; // position, age, size, life, seed, direction, dummy0
            if (usingCustomEmitter) {
                this.particleEmitterType.particlePositionGenerator(particleIndex, null, tmpVector);
                data.push(tmpVector.x);
                data.push(tmpVector.y);
                data.push(tmpVector.z);
                if (this._platform.alignDataInBuffer) {
                    data.push(0.0); // dummy1
                }
                offset += 4;
            }
            if (!this._colorGradientsTexture) {
                // color
                data.push(0.0);
                data.push(0.0);
                data.push(0.0);
                data.push(0.0);
                offset += 4;
            }
            if (!this.isBillboardBased) {
                // initialDirection
                data.push(0.0);
                data.push(0.0);
                data.push(0.0);
                if (this._platform.alignDataInBuffer) {
                    data.push(0.0); // dummy2
                }
                offset += 4;
            }
            if (this.noiseTexture) {
                // Random coordinates for reading into noise texture
                data.push(Math.random());
                data.push(Math.random());
                data.push(Math.random());
                if (this._platform.alignDataInBuffer) {
                    data.push(0.0); // dummy3
                }
                data.push(Math.random());
                data.push(Math.random());
                data.push(Math.random());
                if (this._platform.alignDataInBuffer) {
                    data.push(0.0); // dummy4
                }
                offset += 8;
            }
            // angle
            data.push(0.0);
            offset += 1;
            if (!this._angularSpeedGradientsTexture) {
                data.push(0.0);
                offset += 1;
            }
            if (this._isAnimationSheetEnabled) {
                data.push(0.0);
                offset += 1;
                if (this.spriteRandomStartCell) {
                    data.push(0.0);
                    offset += 1;
                }
            }
            if (this._platform.alignDataInBuffer) {
                var numDummies = 3 - ((offset + 3) & 3);
                offset += numDummies;
                while (numDummies-- > 0) {
                    data.push(0.0);
                }
            }
        }
        // Sprite data
        var spriteData = new Float32Array([0.5, 0.5, 1, 1, -0.5, 0.5, 0, 1, 0.5, -0.5, 1, 0, -0.5, -0.5, 0, 0]);
        var bufferData1 = this._platform.createParticleBuffer(data);
        var bufferData2 = this._platform.createParticleBuffer(data);
        // Buffers
        this._buffer0 = new Buffer(engine, bufferData1, false, this._attributesStrideSize);
        this._buffer1 = new Buffer(engine, bufferData2, false, this._attributesStrideSize);
        this._spriteBuffer = new Buffer(engine, spriteData, false, 4);
        // Update & Render vertex buffers
        this._createVertexBuffers(this._buffer0, this._buffer1, this._spriteBuffer);
        this._createVertexBuffers(this._buffer1, this._buffer0, this._spriteBuffer);
        // Links
        this._sourceBuffer = this._buffer0;
        this._targetBuffer = this._buffer1;
    };
    /** @hidden */
    GPUParticleSystem.prototype._recreateUpdateEffect = function () {
        var defines = this.particleEmitterType ? this.particleEmitterType.getEffectDefines() : "";
        if (this._isBillboardBased) {
            defines += "\n#define BILLBOARD";
        }
        if (this._colorGradientsTexture) {
            defines += "\n#define COLORGRADIENTS";
        }
        if (this._sizeGradientsTexture) {
            defines += "\n#define SIZEGRADIENTS";
        }
        if (this._angularSpeedGradientsTexture) {
            defines += "\n#define ANGULARSPEEDGRADIENTS";
        }
        if (this._velocityGradientsTexture) {
            defines += "\n#define VELOCITYGRADIENTS";
        }
        if (this._limitVelocityGradientsTexture) {
            defines += "\n#define LIMITVELOCITYGRADIENTS";
        }
        if (this._dragGradientsTexture) {
            defines += "\n#define DRAGGRADIENTS";
        }
        if (this.isAnimationSheetEnabled) {
            defines += "\n#define ANIMATESHEET";
            if (this.spriteRandomStartCell) {
                defines += "\n#define ANIMATESHEETRANDOMSTART";
            }
        }
        if (this.noiseTexture) {
            defines += "\n#define NOISE";
        }
        if (this.isLocal) {
            defines += "\n#define LOCAL";
        }
        if (this._platform.isUpdateBufferCreated() && this._cachedUpdateDefines === defines) {
            return;
        }
        this._cachedUpdateDefines = defines;
        this._updateBuffer = this._platform.createUpdateBuffer(defines);
    };
    /**
     * @param blendMode
     * @hidden
     */
    GPUParticleSystem.prototype._getWrapper = function (blendMode) {
        var customWrapper = this._getCustomDrawWrapper(blendMode);
        if (customWrapper === null || customWrapper === void 0 ? void 0 : customWrapper.effect) {
            return customWrapper;
        }
        var defines = [];
        this.fillDefines(defines, blendMode);
        // Effect
        var drawWrapper = this._drawWrappers[blendMode];
        if (!drawWrapper) {
            drawWrapper = new DrawWrapper(this._engine);
            if (drawWrapper.drawContext) {
                drawWrapper.drawContext.useInstancing = true;
            }
            this._drawWrappers[blendMode] = drawWrapper;
        }
        var join = defines.join("\n");
        if (drawWrapper.defines !== join) {
            var attributes = [];
            var uniforms = [];
            var samplers = [];
            this.fillUniformsAttributesAndSamplerNames(uniforms, attributes, samplers);
            drawWrapper.setEffect(this._engine.createEffect("gpuRenderParticles", attributes, uniforms, samplers, join), join);
        }
        return drawWrapper;
    };
    /**
     * @param hasColorGradients
     * @param isAnimationSheetEnabled
     * @param isBillboardBased
     * @param isBillboardStretched
     * @hidden
     */
    GPUParticleSystem._GetAttributeNamesOrOptions = function (hasColorGradients, isAnimationSheetEnabled, isBillboardBased, isBillboardStretched) {
        if (hasColorGradients === void 0) { hasColorGradients = false; }
        if (isAnimationSheetEnabled === void 0) { isAnimationSheetEnabled = false; }
        if (isBillboardBased === void 0) { isBillboardBased = false; }
        if (isBillboardStretched === void 0) { isBillboardStretched = false; }
        var attributeNamesOrOptions = [VertexBuffer.PositionKind, "age", "life", "size", "angle"];
        if (!hasColorGradients) {
            attributeNamesOrOptions.push(VertexBuffer.ColorKind);
        }
        if (isAnimationSheetEnabled) {
            attributeNamesOrOptions.push("cellIndex");
        }
        if (!isBillboardBased) {
            attributeNamesOrOptions.push("initialDirection");
        }
        if (!isBillboardStretched) {
            attributeNamesOrOptions.push("direction");
        }
        attributeNamesOrOptions.push("offset", VertexBuffer.UVKind);
        return attributeNamesOrOptions;
    };
    /**
     * @param isAnimationSheetEnabled
     * @hidden
     */
    GPUParticleSystem._GetEffectCreationOptions = function (isAnimationSheetEnabled) {
        if (isAnimationSheetEnabled === void 0) { isAnimationSheetEnabled = false; }
        var effectCreationOption = [
            "emitterWM",
            "worldOffset",
            "view",
            "projection",
            "colorDead",
            "invView",
            "vClipPlane",
            "vClipPlane2",
            "vClipPlane3",
            "vClipPlane4",
            "vClipPlane5",
            "vClipPlane6",
            "translationPivot",
            "eyePosition",
        ];
        if (isAnimationSheetEnabled) {
            effectCreationOption.push("sheetInfos");
        }
        return effectCreationOption;
    };
    /**
     * Fill the defines array according to the current settings of the particle system
     * @param defines Array to be updated
     * @param blendMode blend mode to take into account when updating the array
     */
    GPUParticleSystem.prototype.fillDefines = function (defines, blendMode) {
        if (blendMode === void 0) { blendMode = 0; }
        if (this._scene) {
            if (this._scene.clipPlane) {
                defines.push("#define CLIPPLANE");
            }
            if (this._scene.clipPlane2) {
                defines.push("#define CLIPPLANE2");
            }
            if (this._scene.clipPlane3) {
                defines.push("#define CLIPPLANE3");
            }
            if (this._scene.clipPlane4) {
                defines.push("#define CLIPPLANE4");
            }
            if (this._scene.clipPlane5) {
                defines.push("#define CLIPPLANE5");
            }
            if (this._scene.clipPlane6) {
                defines.push("#define CLIPPLANE6");
            }
        }
        if (blendMode === ParticleSystem.BLENDMODE_MULTIPLY) {
            defines.push("#define BLENDMULTIPLYMODE");
        }
        if (this.isLocal) {
            defines.push("#define LOCAL");
        }
        if (this._isBillboardBased) {
            defines.push("#define BILLBOARD");
            switch (this.billboardMode) {
                case ParticleSystem.BILLBOARDMODE_Y:
                    defines.push("#define BILLBOARDY");
                    break;
                case ParticleSystem.BILLBOARDMODE_STRETCHED:
                    defines.push("#define BILLBOARDSTRETCHED");
                    break;
                case ParticleSystem.BILLBOARDMODE_ALL:
                    defines.push("#define BILLBOARDMODE_ALL");
                    break;
                default:
                    break;
            }
        }
        if (this._colorGradientsTexture) {
            defines.push("#define COLORGRADIENTS");
        }
        if (this.isAnimationSheetEnabled) {
            defines.push("#define ANIMATESHEET");
        }
        if (this._imageProcessingConfiguration) {
            this._imageProcessingConfiguration.prepareDefines(this._imageProcessingConfigurationDefines);
            defines.push("" + this._imageProcessingConfigurationDefines.toString());
        }
    };
    /**
     * Fill the uniforms, attributes and samplers arrays according to the current settings of the particle system
     * @param uniforms Uniforms array to fill
     * @param attributes Attributes array to fill
     * @param samplers Samplers array to fill
     */
    GPUParticleSystem.prototype.fillUniformsAttributesAndSamplerNames = function (uniforms, attributes, samplers) {
        attributes.push.apply(attributes, GPUParticleSystem._GetAttributeNamesOrOptions(!!this._colorGradientsTexture, this._isAnimationSheetEnabled, this._isBillboardBased, this._isBillboardBased && this.billboardMode === ParticleSystem.BILLBOARDMODE_STRETCHED));
        uniforms.push.apply(uniforms, GPUParticleSystem._GetEffectCreationOptions(this._isAnimationSheetEnabled));
        samplers.push("diffuseSampler", "colorGradientSampler");
        if (this._imageProcessingConfiguration) {
            ImageProcessingConfiguration.PrepareUniforms(uniforms, this._imageProcessingConfigurationDefines);
            ImageProcessingConfiguration.PrepareSamplers(samplers, this._imageProcessingConfigurationDefines);
        }
    };
    /**
     * Animates the particle system for the current frame by emitting new particles and or animating the living ones.
     * @param preWarm defines if we are in the pre-warmimg phase
     */
    GPUParticleSystem.prototype.animate = function (preWarm) {
        var _a;
        if (preWarm === void 0) { preWarm = false; }
        this._timeDelta = this.updateSpeed * (preWarm ? this.preWarmStepOffset : ((_a = this._scene) === null || _a === void 0 ? void 0 : _a.getAnimationRatio()) || 1);
        this._actualFrame += this._timeDelta;
        if (!this._stopped) {
            if (this.targetStopDuration && this._actualFrame >= this.targetStopDuration) {
                this.stop();
            }
        }
    };
    GPUParticleSystem.prototype._createFactorGradientTexture = function (factorGradients, textureName) {
        var texture = this[textureName];
        if (!factorGradients || !factorGradients.length || texture) {
            return;
        }
        var data = new Float32Array(this._rawTextureWidth);
        var _loop_1 = function (x) {
            var ratio = x / this_1._rawTextureWidth;
            GradientHelper.GetCurrentGradient(ratio, factorGradients, function (currentGradient, nextGradient, scale) {
                data[x] = Scalar.Lerp(currentGradient.factor1, nextGradient.factor1, scale);
            });
        };
        var this_1 = this;
        for (var x = 0; x < this._rawTextureWidth; x++) {
            _loop_1(x);
        }
        this[textureName] = RawTexture.CreateRTexture(data, this._rawTextureWidth, 1, this._scene || this._engine, false, false, 1);
    };
    GPUParticleSystem.prototype._createSizeGradientTexture = function () {
        this._createFactorGradientTexture(this._sizeGradients, "_sizeGradientsTexture");
    };
    GPUParticleSystem.prototype._createAngularSpeedGradientTexture = function () {
        this._createFactorGradientTexture(this._angularSpeedGradients, "_angularSpeedGradientsTexture");
    };
    GPUParticleSystem.prototype._createVelocityGradientTexture = function () {
        this._createFactorGradientTexture(this._velocityGradients, "_velocityGradientsTexture");
    };
    GPUParticleSystem.prototype._createLimitVelocityGradientTexture = function () {
        this._createFactorGradientTexture(this._limitVelocityGradients, "_limitVelocityGradientsTexture");
    };
    GPUParticleSystem.prototype._createDragGradientTexture = function () {
        this._createFactorGradientTexture(this._dragGradients, "_dragGradientsTexture");
    };
    GPUParticleSystem.prototype._createColorGradientTexture = function () {
        if (!this._colorGradients || !this._colorGradients.length || this._colorGradientsTexture) {
            return;
        }
        var data = new Uint8Array(this._rawTextureWidth * 4);
        var tmpColor = TmpColors.Color4[0];
        var _loop_2 = function (x) {
            var ratio = x / this_2._rawTextureWidth;
            GradientHelper.GetCurrentGradient(ratio, this_2._colorGradients, function (currentGradient, nextGradient, scale) {
                Color4.LerpToRef(currentGradient.color1, nextGradient.color1, scale, tmpColor);
                data[x * 4] = tmpColor.r * 255;
                data[x * 4 + 1] = tmpColor.g * 255;
                data[x * 4 + 2] = tmpColor.b * 255;
                data[x * 4 + 3] = tmpColor.a * 255;
            });
        };
        var this_2 = this;
        for (var x = 0; x < this._rawTextureWidth; x++) {
            _loop_2(x);
        }
        this._colorGradientsTexture = RawTexture.CreateRGBATexture(data, this._rawTextureWidth, 1, this._scene, false, false, 1);
    };
    GPUParticleSystem.prototype._render = function (blendMode, emitterWM) {
        var _a, _b;
        // Enable render effect
        var drawWrapper = this._getWrapper(blendMode);
        var effect = drawWrapper.effect;
        this._engine.enableEffect(drawWrapper);
        var viewMatrix = ((_a = this._scene) === null || _a === void 0 ? void 0 : _a.getViewMatrix()) || Matrix.IdentityReadOnly;
        effect.setMatrix("view", viewMatrix);
        effect.setMatrix("projection", (_b = this.defaultProjectionMatrix) !== null && _b !== void 0 ? _b : this._scene.getProjectionMatrix());
        effect.setTexture("diffuseSampler", this.particleTexture);
        effect.setVector2("translationPivot", this.translationPivot);
        effect.setVector3("worldOffset", this.worldOffset);
        if (this.isLocal) {
            effect.setMatrix("emitterWM", emitterWM);
        }
        if (this._colorGradientsTexture) {
            effect.setTexture("colorGradientSampler", this._colorGradientsTexture);
        }
        else {
            effect.setDirectColor4("colorDead", this.colorDead);
        }
        if (this._isAnimationSheetEnabled && this.particleTexture) {
            var baseSize = this.particleTexture.getBaseSize();
            effect.setFloat3("sheetInfos", this.spriteCellWidth / baseSize.width, this.spriteCellHeight / baseSize.height, baseSize.width / this.spriteCellWidth);
        }
        if (this._isBillboardBased && this._scene) {
            var camera = this._scene.activeCamera;
            effect.setVector3("eyePosition", camera.globalPosition);
        }
        var defines = effect.defines;
        if (this._scene) {
            if (this._scene.clipPlane || this._scene.clipPlane2 || this._scene.clipPlane3 || this._scene.clipPlane4 || this._scene.clipPlane5 || this._scene.clipPlane6) {
                MaterialHelper.BindClipPlane(effect, this._scene);
            }
        }
        if (defines.indexOf("#define BILLBOARDMODE_ALL") >= 0) {
            var invView = viewMatrix.clone();
            invView.invert();
            effect.setMatrix("invView", invView);
        }
        // image processing
        if (this._imageProcessingConfiguration && !this._imageProcessingConfiguration.applyByPostProcess) {
            this._imageProcessingConfiguration.bind(effect);
        }
        // Draw order
        switch (blendMode) {
            case ParticleSystem.BLENDMODE_ADD:
                this._engine.setAlphaMode(1);
                break;
            case ParticleSystem.BLENDMODE_ONEONE:
                this._engine.setAlphaMode(6);
                break;
            case ParticleSystem.BLENDMODE_STANDARD:
                this._engine.setAlphaMode(2);
                break;
            case ParticleSystem.BLENDMODE_MULTIPLY:
                this._engine.setAlphaMode(4);
                break;
        }
        // Bind source VAO
        this._platform.bindDrawBuffers(this._targetIndex, effect);
        if (this._onBeforeDrawParticlesObservable) {
            this._onBeforeDrawParticlesObservable.notifyObservers(effect);
        }
        // Render
        this._engine.drawArraysType(7, 0, 4, this._currentActiveCount);
        this._engine.setAlphaMode(0);
        return this._currentActiveCount;
    };
    /**
     * Renders the particle system in its current state
     * @param preWarm defines if the system should only update the particles but not render them
     * @param forceUpdateOnly if true, force to only update the particles and never display them (meaning, even if preWarm=false, when forceUpdateOnly=true the particles won't be displayed)
     * @returns the current number of particles
     */
    GPUParticleSystem.prototype.render = function (preWarm, forceUpdateOnly) {
        if (preWarm === void 0) { preWarm = false; }
        if (forceUpdateOnly === void 0) { forceUpdateOnly = false; }
        if (!this._started) {
            return 0;
        }
        this._createColorGradientTexture();
        this._createSizeGradientTexture();
        this._createAngularSpeedGradientTexture();
        this._createVelocityGradientTexture();
        this._createLimitVelocityGradientTexture();
        this._createDragGradientTexture();
        this._recreateUpdateEffect();
        if (!this.isReady()) {
            return 0;
        }
        if (!preWarm && this._scene) {
            if (!this._preWarmDone && this.preWarmCycles) {
                for (var index = 0; index < this.preWarmCycles; index++) {
                    this.animate(true);
                    this.render(true, true);
                }
                this._preWarmDone = true;
            }
            if (this._currentRenderId === this._scene.getFrameId() &&
                (!this._scene.activeCamera || (this._scene.activeCamera && this._currentRenderingCameraUniqueId === this._scene.activeCamera.uniqueId))) {
                return 0;
            }
            this._currentRenderId = this._scene.getFrameId();
            if (this._scene.activeCamera) {
                this._currentRenderingCameraUniqueId = this._scene.activeCamera.uniqueId;
            }
        }
        // Get everything ready to render
        this._initialize();
        this._accumulatedCount += this.emitRate * this._timeDelta;
        if (this._accumulatedCount > 1) {
            var intPart = this._accumulatedCount | 0;
            this._accumulatedCount -= intPart;
            this._currentActiveCount = Math.min(this._activeCount, this._currentActiveCount + intPart);
        }
        if (!this._currentActiveCount) {
            return 0;
        }
        // Enable update effect
        var emitterWM;
        if (this.emitter.position) {
            var emitterMesh = this.emitter;
            emitterWM = emitterMesh.getWorldMatrix();
        }
        else {
            var emitterPosition = this.emitter;
            emitterWM = Matrix.Translation(emitterPosition.x, emitterPosition.y, emitterPosition.z);
        }
        var engine = this._engine;
        this._platform.preUpdateParticleBuffer();
        this._updateBuffer.setFloat("currentCount", this._currentActiveCount);
        this._updateBuffer.setFloat("timeDelta", this._timeDelta);
        this._updateBuffer.setFloat("stopFactor", this._stopped ? 0 : 1);
        this._updateBuffer.setInt("randomTextureSize", this._randomTextureSize);
        this._updateBuffer.setFloat2("lifeTime", this.minLifeTime, this.maxLifeTime);
        this._updateBuffer.setFloat2("emitPower", this.minEmitPower, this.maxEmitPower);
        if (!this._colorGradientsTexture) {
            this._updateBuffer.setDirectColor4("color1", this.color1);
            this._updateBuffer.setDirectColor4("color2", this.color2);
        }
        this._updateBuffer.setFloat2("sizeRange", this.minSize, this.maxSize);
        this._updateBuffer.setFloat4("scaleRange", this.minScaleX, this.maxScaleX, this.minScaleY, this.maxScaleY);
        this._updateBuffer.setFloat4("angleRange", this.minAngularSpeed, this.maxAngularSpeed, this.minInitialRotation, this.maxInitialRotation);
        this._updateBuffer.setVector3("gravity", this.gravity);
        if (this._limitVelocityGradientsTexture) {
            this._updateBuffer.setFloat("limitVelocityDamping", this.limitVelocityDamping);
        }
        if (this.particleEmitterType) {
            this.particleEmitterType.applyToShader(this._updateBuffer);
        }
        if (this._isAnimationSheetEnabled) {
            this._updateBuffer.setFloat4("cellInfos", this.startSpriteCellID, this.endSpriteCellID, this.spriteCellChangeSpeed, this.spriteCellLoop ? 1 : 0);
        }
        if (this.noiseTexture) {
            this._updateBuffer.setVector3("noiseStrength", this.noiseStrength);
        }
        if (!this.isLocal) {
            this._updateBuffer.setMatrix("emitterWM", emitterWM);
        }
        this._platform.updateParticleBuffer(this._targetIndex, this._targetBuffer, this._currentActiveCount);
        var outparticles = 0;
        if (!preWarm && !forceUpdateOnly) {
            engine.setState(false);
            if (this.forceDepthWrite) {
                engine.setDepthWrite(true);
            }
            if (this.blendMode === ParticleSystem.BLENDMODE_MULTIPLYADD) {
                outparticles = this._render(ParticleSystem.BLENDMODE_MULTIPLY, emitterWM) + this._render(ParticleSystem.BLENDMODE_ADD, emitterWM);
            }
            else {
                outparticles = this._render(this.blendMode, emitterWM);
            }
            this._engine.setAlphaMode(0);
        }
        // Switch VAOs
        this._targetIndex++;
        if (this._targetIndex === 2) {
            this._targetIndex = 0;
        }
        // Switch buffers
        var tmpBuffer = this._sourceBuffer;
        this._sourceBuffer = this._targetBuffer;
        this._targetBuffer = tmpBuffer;
        return outparticles;
    };
    /**
     * Rebuilds the particle system
     */
    GPUParticleSystem.prototype.rebuild = function () {
        this._initialize(true);
    };
    GPUParticleSystem.prototype._releaseBuffers = function () {
        if (this._buffer0) {
            this._buffer0.dispose();
            this._buffer0 = null;
        }
        if (this._buffer1) {
            this._buffer1.dispose();
            this._buffer1 = null;
        }
        if (this._spriteBuffer) {
            this._spriteBuffer.dispose();
            this._spriteBuffer = null;
        }
        this._platform.releaseBuffers();
    };
    /**
     * Disposes the particle system and free the associated resources
     * @param disposeTexture defines if the particule texture must be disposed as well (true by default)
     */
    GPUParticleSystem.prototype.dispose = function (disposeTexture) {
        if (disposeTexture === void 0) { disposeTexture = true; }
        for (var blendMode in this._drawWrappers) {
            var drawWrapper = this._drawWrappers[blendMode];
            drawWrapper.dispose();
        }
        this._drawWrappers = {};
        if (this._scene) {
            var index = this._scene.particleSystems.indexOf(this);
            if (index > -1) {
                this._scene.particleSystems.splice(index, 1);
            }
        }
        this._releaseBuffers();
        this._platform.releaseVertexBuffers();
        if (this._colorGradientsTexture) {
            this._colorGradientsTexture.dispose();
            this._colorGradientsTexture = null;
        }
        if (this._sizeGradientsTexture) {
            this._sizeGradientsTexture.dispose();
            this._sizeGradientsTexture = null;
        }
        if (this._angularSpeedGradientsTexture) {
            this._angularSpeedGradientsTexture.dispose();
            this._angularSpeedGradientsTexture = null;
        }
        if (this._velocityGradientsTexture) {
            this._velocityGradientsTexture.dispose();
            this._velocityGradientsTexture = null;
        }
        if (this._limitVelocityGradientsTexture) {
            this._limitVelocityGradientsTexture.dispose();
            this._limitVelocityGradientsTexture = null;
        }
        if (this._dragGradientsTexture) {
            this._dragGradientsTexture.dispose();
            this._dragGradientsTexture = null;
        }
        if (this._randomTexture) {
            this._randomTexture.dispose();
            this._randomTexture = null;
        }
        if (this._randomTexture2) {
            this._randomTexture2.dispose();
            this._randomTexture2 = null;
        }
        if (disposeTexture && this.particleTexture) {
            this.particleTexture.dispose();
            this.particleTexture = null;
        }
        if (disposeTexture && this.noiseTexture) {
            this.noiseTexture.dispose();
            this.noiseTexture = null;
        }
        // Callback
        this.onStoppedObservable.clear();
        this.onDisposeObservable.notifyObservers(this);
        this.onDisposeObservable.clear();
    };
    /**
     * Clones the particle system.
     * @param name The name of the cloned object
     * @param newEmitter The new emitter to use
     * @returns the cloned particle system
     */
    GPUParticleSystem.prototype.clone = function (name, newEmitter) {
        var custom = __assign({}, this._customWrappers);
        var program = null;
        var engine = this._engine;
        if (engine.createEffectForParticles) {
            if (this.customShader != null) {
                program = this.customShader;
                var defines = program.shaderOptions.defines.length > 0 ? program.shaderOptions.defines.join("\n") : "";
                custom[0] = engine.createEffectForParticles(program.shaderPath.fragmentElement, program.shaderOptions.uniforms, program.shaderOptions.samplers, defines, undefined, undefined, undefined, this);
            }
        }
        var serialization = this.serialize();
        var result = GPUParticleSystem.Parse(serialization, this._scene || this._engine, this._rootUrl);
        result.name = name;
        result.customShader = program;
        result._customWrappers = custom;
        if (newEmitter === undefined) {
            newEmitter = this.emitter;
        }
        if (this.noiseTexture) {
            result.noiseTexture = this.noiseTexture.clone();
        }
        result.emitter = newEmitter;
        return result;
    };
    /**
     * Serializes the particle system to a JSON object
     * @param serializeTexture defines if the texture must be serialized as well
     * @returns the JSON object
     */
    GPUParticleSystem.prototype.serialize = function (serializeTexture) {
        if (serializeTexture === void 0) { serializeTexture = false; }
        var serializationObject = {};
        ParticleSystem._Serialize(serializationObject, this, serializeTexture);
        serializationObject.activeParticleCount = this.activeParticleCount;
        serializationObject.randomTextureSize = this._randomTextureSize;
        serializationObject.customShader = this.customShader;
        return serializationObject;
    };
    /**
     * Parses a JSON object to create a GPU particle system.
     * @param parsedParticleSystem The JSON object to parse
     * @param sceneOrEngine The scene or the engine to create the particle system in
     * @param rootUrl The root url to use to load external dependencies like texture
     * @param doNotStart Ignore the preventAutoStart attribute and does not start
     * @param capacity defines the system capacity (if null or undefined the sotred capacity will be used)
     * @returns the parsed GPU particle system
     */
    GPUParticleSystem.Parse = function (parsedParticleSystem, sceneOrEngine, rootUrl, doNotStart, capacity) {
        if (doNotStart === void 0) { doNotStart = false; }
        var name = parsedParticleSystem.name;
        var engine;
        var scene;
        if (sceneOrEngine instanceof ThinEngine) {
            engine = sceneOrEngine;
        }
        else {
            scene = sceneOrEngine;
            engine = scene.getEngine();
        }
        var particleSystem = new GPUParticleSystem(name, { capacity: capacity || parsedParticleSystem.capacity, randomTextureSize: parsedParticleSystem.randomTextureSize }, sceneOrEngine, null, parsedParticleSystem.isAnimationSheetEnabled);
        particleSystem._rootUrl = rootUrl;
        if (parsedParticleSystem.customShader && engine.createEffectForParticles) {
            var program = parsedParticleSystem.customShader;
            var defines = program.shaderOptions.defines.length > 0 ? program.shaderOptions.defines.join("\n") : "";
            var custom = engine.createEffectForParticles(program.shaderPath.fragmentElement, program.shaderOptions.uniforms, program.shaderOptions.samplers, defines, undefined, undefined, undefined, particleSystem);
            particleSystem.setCustomEffect(custom, 0);
            particleSystem.customShader = program;
        }
        if (parsedParticleSystem.id) {
            particleSystem.id = parsedParticleSystem.id;
        }
        if (parsedParticleSystem.activeParticleCount) {
            particleSystem.activeParticleCount = parsedParticleSystem.activeParticleCount;
        }
        ParticleSystem._Parse(parsedParticleSystem, particleSystem, sceneOrEngine, rootUrl);
        // Auto start
        if (parsedParticleSystem.preventAutoStart) {
            particleSystem.preventAutoStart = parsedParticleSystem.preventAutoStart;
        }
        if (!doNotStart && !particleSystem.preventAutoStart) {
            particleSystem.start();
        }
        return particleSystem;
    };
    return GPUParticleSystem;
}(BaseParticleSystem));
export { GPUParticleSystem };
//# sourceMappingURL=gpuParticleSystem.js.map