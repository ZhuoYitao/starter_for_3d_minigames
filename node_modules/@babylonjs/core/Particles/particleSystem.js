import { __assign, __extends } from "tslib";
import { FactorGradient, ColorGradient, Color3Gradient, GradientHelper } from "../Misc/gradients.js";
import { Observable } from "../Misc/observable.js";
import { Vector3, Matrix, TmpVectors, Vector4 } from "../Maths/math.vector.js";
import { Scalar } from "../Maths/math.scalar.js";
import { VertexBuffer, Buffer } from "../Buffers/buffer.js";
import { ImageProcessingConfiguration } from "../Materials/imageProcessingConfiguration.js";
import { RawTexture } from "../Materials/Textures/rawTexture.js";
import { EngineStore } from "../Engines/engineStore.js";
import { BoxParticleEmitter, HemisphericParticleEmitter, SphereParticleEmitter, SphereDirectedParticleEmitter, CylinderParticleEmitter, ConeParticleEmitter, PointParticleEmitter, MeshParticleEmitter, CylinderDirectedParticleEmitter, } from "../Particles/EmitterTypes/index.js";
import { BaseParticleSystem } from "./baseParticleSystem.js";
import { Particle } from "./particle.js";
import { SubEmitter, SubEmitterType } from "./subEmitter.js";

import { SerializationHelper } from "../Misc/decorators.js";
import { GetClass } from "../Misc/typeStore.js";
import { DrawWrapper } from "../Materials/drawWrapper.js";
import "../Shaders/particles.fragment.js";
import "../Shaders/particles.vertex.js";
import { Color4, Color3, TmpColors } from "../Maths/math.color.js";
import { ThinEngine } from "../Engines/thinEngine.js";
import { ThinMaterialHelper } from "../Materials/thinMaterialHelper.js";
import "../Engines/Extensions/engine.alpha.js";
/**
 * This represents a particle system in Babylon.
 * Particles are often small sprites used to simulate hard-to-reproduce phenomena like fire, smoke, water, or abstract visual effects like magic glitter and faery dust.
 * Particles can take different shapes while emitted like box, sphere, cone or you can write your custom function.
 * @example https://doc.babylonjs.com/babylon101/particles
 */
var ParticleSystem = /** @class */ (function (_super) {
    __extends(ParticleSystem, _super);
    /**
     * Instantiates a particle system.
     * Particles are often small sprites used to simulate hard-to-reproduce phenomena like fire, smoke, water, or abstract visual effects like magic glitter and faery dust.
     * @param name The name of the particle system
     * @param capacity The max number of particles alive at the same time
     * @param sceneOrEngine The scene the particle system belongs to or the engine to use if no scene
     * @param customEffect a custom effect used to change the way particles are rendered by default
     * @param isAnimationSheetEnabled Must be true if using a spritesheet to animate the particles texture
     * @param epsilon Offset used to render the particles
     */
    function ParticleSystem(name, capacity, sceneOrEngine, customEffect, isAnimationSheetEnabled, epsilon) {
        if (customEffect === void 0) { customEffect = null; }
        if (isAnimationSheetEnabled === void 0) { isAnimationSheetEnabled = false; }
        if (epsilon === void 0) { epsilon = 0.01; }
        var _this = _super.call(this, name) || this;
        _this._emitterInverseWorldMatrix = Matrix.Identity();
        /**
         * @hidden
         */
        _this._inheritedVelocityOffset = new Vector3();
        /**
         * An event triggered when the system is disposed
         */
        _this.onDisposeObservable = new Observable();
        /**
         * An event triggered when the system is stopped
         */
        _this.onStoppedObservable = new Observable();
        _this._particles = new Array();
        _this._stockParticles = new Array();
        _this._newPartsExcess = 0;
        _this._vertexBuffers = {};
        _this._scaledColorStep = new Color4(0, 0, 0, 0);
        _this._colorDiff = new Color4(0, 0, 0, 0);
        _this._scaledDirection = Vector3.Zero();
        _this._scaledGravity = Vector3.Zero();
        _this._currentRenderId = -1;
        _this._useInstancing = false;
        _this._started = false;
        _this._stopped = false;
        _this._actualFrame = 0;
        /** @hidden */
        _this._currentEmitRate1 = 0;
        /** @hidden */
        _this._currentEmitRate2 = 0;
        /** @hidden */
        _this._currentStartSize1 = 0;
        /** @hidden */
        _this._currentStartSize2 = 0;
        _this._rawTextureWidth = 256;
        _this._useRampGradients = false;
        /**
         * @hidden
         * If the particle systems emitter should be disposed when the particle system is disposed
         */
        _this._disposeEmitterOnDispose = false;
        /**
         * Specifies if the particles are updated in emitter local space or world space
         */
        _this.isLocal = false;
        /** @hidden */
        _this._onBeforeDrawParticlesObservable = null;
        // start of sub system methods
        /**
         * "Recycles" one of the particle by copying it back to the "stock" of particles and removing it from the active list.
         * Its lifetime will start back at 0.
         * @param particle
         */
        _this.recycleParticle = function (particle) {
            // move particle from activeParticle list to stock particles
            var lastParticle = _this._particles.pop();
            if (lastParticle !== particle) {
                lastParticle.copyTo(particle);
            }
            _this._stockParticles.push(lastParticle);
        };
        _this._createParticle = function () {
            var particle;
            if (_this._stockParticles.length !== 0) {
                particle = _this._stockParticles.pop();
                particle._reset();
            }
            else {
                particle = new Particle(_this);
            }
            // Attach emitters
            if (_this._subEmitters && _this._subEmitters.length > 0) {
                var subEmitters = _this._subEmitters[Math.floor(Math.random() * _this._subEmitters.length)];
                particle._attachedSubEmitters = [];
                subEmitters.forEach(function (subEmitter) {
                    if (subEmitter.type === SubEmitterType.ATTACHED) {
                        var newEmitter = subEmitter.clone();
                        particle._attachedSubEmitters.push(newEmitter);
                        newEmitter.particleSystem.start();
                    }
                });
            }
            return particle;
        };
        _this._emitFromParticle = function (particle) {
            if (!_this._subEmitters || _this._subEmitters.length === 0) {
                return;
            }
            var templateIndex = Math.floor(Math.random() * _this._subEmitters.length);
            _this._subEmitters[templateIndex].forEach(function (subEmitter) {
                if (subEmitter.type === SubEmitterType.END) {
                    var subSystem = subEmitter.clone();
                    particle._inheritParticleInfoToSubEmitter(subSystem);
                    subSystem.particleSystem._rootParticleSystem = _this;
                    _this.activeSubSystems.push(subSystem.particleSystem);
                    subSystem.particleSystem.start();
                }
            });
        };
        _this._capacity = capacity;
        _this._epsilon = epsilon;
        _this._isAnimationSheetEnabled = isAnimationSheetEnabled;
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
        if (_this._engine.getCaps().vertexArrayObject) {
            _this._vertexArrayObject = null;
        }
        // Setup the default processing configuration to the scene.
        _this._attachImageProcessingConfiguration(null);
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _this._customWrappers = { 0: new DrawWrapper(_this._engine) };
        _this._customWrappers[0].effect = customEffect;
        _this._drawWrappers = [];
        _this._useInstancing = _this._engine.getCaps().instancedArrays;
        _this._createIndexBuffer();
        _this._createVertexBuffers();
        // Default emitter type
        _this.particleEmitterType = new BoxParticleEmitter();
        var noiseTextureData = null;
        // Update
        _this.updateFunction = function (particles) {
            var _a;
            var noiseTextureSize = null;
            if (_this.noiseTexture) {
                // We need to get texture data back to CPU
                noiseTextureSize = _this.noiseTexture.getSize();
                (_a = _this.noiseTexture.getContent()) === null || _a === void 0 ? void 0 : _a.then(function (data) {
                    noiseTextureData = data;
                });
            }
            var _loop_1 = function (index) {
                var particle = particles[index];
                var scaledUpdateSpeed = _this._scaledUpdateSpeed;
                var previousAge = particle.age;
                particle.age += scaledUpdateSpeed;
                // Evaluate step to death
                if (particle.age > particle.lifeTime) {
                    var diff = particle.age - previousAge;
                    var oldDiff = particle.lifeTime - previousAge;
                    scaledUpdateSpeed = (oldDiff * scaledUpdateSpeed) / diff;
                    particle.age = particle.lifeTime;
                }
                var ratio = particle.age / particle.lifeTime;
                // Color
                if (_this._colorGradients && _this._colorGradients.length > 0) {
                    GradientHelper.GetCurrentGradient(ratio, _this._colorGradients, function (currentGradient, nextGradient, scale) {
                        if (currentGradient !== particle._currentColorGradient) {
                            particle._currentColor1.copyFrom(particle._currentColor2);
                            nextGradient.getColorToRef(particle._currentColor2);
                            particle._currentColorGradient = currentGradient;
                        }
                        Color4.LerpToRef(particle._currentColor1, particle._currentColor2, scale, particle.color);
                    });
                }
                else {
                    particle.colorStep.scaleToRef(scaledUpdateSpeed, _this._scaledColorStep);
                    particle.color.addInPlace(_this._scaledColorStep);
                    if (particle.color.a < 0) {
                        particle.color.a = 0;
                    }
                }
                // Angular speed
                if (_this._angularSpeedGradients && _this._angularSpeedGradients.length > 0) {
                    GradientHelper.GetCurrentGradient(ratio, _this._angularSpeedGradients, function (currentGradient, nextGradient, scale) {
                        if (currentGradient !== particle._currentAngularSpeedGradient) {
                            particle._currentAngularSpeed1 = particle._currentAngularSpeed2;
                            particle._currentAngularSpeed2 = nextGradient.getFactor();
                            particle._currentAngularSpeedGradient = currentGradient;
                        }
                        particle.angularSpeed = Scalar.Lerp(particle._currentAngularSpeed1, particle._currentAngularSpeed2, scale);
                    });
                }
                particle.angle += particle.angularSpeed * scaledUpdateSpeed;
                // Direction
                var directionScale = scaledUpdateSpeed;
                /// Velocity
                if (_this._velocityGradients && _this._velocityGradients.length > 0) {
                    GradientHelper.GetCurrentGradient(ratio, _this._velocityGradients, function (currentGradient, nextGradient, scale) {
                        if (currentGradient !== particle._currentVelocityGradient) {
                            particle._currentVelocity1 = particle._currentVelocity2;
                            particle._currentVelocity2 = nextGradient.getFactor();
                            particle._currentVelocityGradient = currentGradient;
                        }
                        directionScale *= Scalar.Lerp(particle._currentVelocity1, particle._currentVelocity2, scale);
                    });
                }
                particle.direction.scaleToRef(directionScale, _this._scaledDirection);
                /// Limit velocity
                if (_this._limitVelocityGradients && _this._limitVelocityGradients.length > 0) {
                    GradientHelper.GetCurrentGradient(ratio, _this._limitVelocityGradients, function (currentGradient, nextGradient, scale) {
                        if (currentGradient !== particle._currentLimitVelocityGradient) {
                            particle._currentLimitVelocity1 = particle._currentLimitVelocity2;
                            particle._currentLimitVelocity2 = nextGradient.getFactor();
                            particle._currentLimitVelocityGradient = currentGradient;
                        }
                        var limitVelocity = Scalar.Lerp(particle._currentLimitVelocity1, particle._currentLimitVelocity2, scale);
                        var currentVelocity = particle.direction.length();
                        if (currentVelocity > limitVelocity) {
                            particle.direction.scaleInPlace(_this.limitVelocityDamping);
                        }
                    });
                }
                /// Drag
                if (_this._dragGradients && _this._dragGradients.length > 0) {
                    GradientHelper.GetCurrentGradient(ratio, _this._dragGradients, function (currentGradient, nextGradient, scale) {
                        if (currentGradient !== particle._currentDragGradient) {
                            particle._currentDrag1 = particle._currentDrag2;
                            particle._currentDrag2 = nextGradient.getFactor();
                            particle._currentDragGradient = currentGradient;
                        }
                        var drag = Scalar.Lerp(particle._currentDrag1, particle._currentDrag2, scale);
                        _this._scaledDirection.scaleInPlace(1.0 - drag);
                    });
                }
                if (_this.isLocal && particle._localPosition) {
                    particle._localPosition.addInPlace(_this._scaledDirection);
                    Vector3.TransformCoordinatesToRef(particle._localPosition, _this._emitterWorldMatrix, particle.position);
                }
                else {
                    particle.position.addInPlace(_this._scaledDirection);
                }
                // Noise
                if (noiseTextureData && noiseTextureSize && particle._randomNoiseCoordinates1) {
                    var fetchedColorR = _this._fetchR(particle._randomNoiseCoordinates1.x, particle._randomNoiseCoordinates1.y, noiseTextureSize.width, noiseTextureSize.height, noiseTextureData);
                    var fetchedColorG = _this._fetchR(particle._randomNoiseCoordinates1.z, particle._randomNoiseCoordinates2.x, noiseTextureSize.width, noiseTextureSize.height, noiseTextureData);
                    var fetchedColorB = _this._fetchR(particle._randomNoiseCoordinates2.y, particle._randomNoiseCoordinates2.z, noiseTextureSize.width, noiseTextureSize.height, noiseTextureData);
                    var force = TmpVectors.Vector3[0];
                    var scaledForce = TmpVectors.Vector3[1];
                    force.copyFromFloats((2 * fetchedColorR - 1) * _this.noiseStrength.x, (2 * fetchedColorG - 1) * _this.noiseStrength.y, (2 * fetchedColorB - 1) * _this.noiseStrength.z);
                    force.scaleToRef(scaledUpdateSpeed, scaledForce);
                    particle.direction.addInPlace(scaledForce);
                }
                // Gravity
                _this.gravity.scaleToRef(scaledUpdateSpeed, _this._scaledGravity);
                particle.direction.addInPlace(_this._scaledGravity);
                // Size
                if (_this._sizeGradients && _this._sizeGradients.length > 0) {
                    GradientHelper.GetCurrentGradient(ratio, _this._sizeGradients, function (currentGradient, nextGradient, scale) {
                        if (currentGradient !== particle._currentSizeGradient) {
                            particle._currentSize1 = particle._currentSize2;
                            particle._currentSize2 = nextGradient.getFactor();
                            particle._currentSizeGradient = currentGradient;
                        }
                        particle.size = Scalar.Lerp(particle._currentSize1, particle._currentSize2, scale);
                    });
                }
                // Remap data
                if (_this._useRampGradients) {
                    if (_this._colorRemapGradients && _this._colorRemapGradients.length > 0) {
                        GradientHelper.GetCurrentGradient(ratio, _this._colorRemapGradients, function (currentGradient, nextGradient, scale) {
                            var min = Scalar.Lerp(currentGradient.factor1, nextGradient.factor1, scale);
                            var max = Scalar.Lerp(currentGradient.factor2, nextGradient.factor2, scale);
                            particle.remapData.x = min;
                            particle.remapData.y = max - min;
                        });
                    }
                    if (_this._alphaRemapGradients && _this._alphaRemapGradients.length > 0) {
                        GradientHelper.GetCurrentGradient(ratio, _this._alphaRemapGradients, function (currentGradient, nextGradient, scale) {
                            var min = Scalar.Lerp(currentGradient.factor1, nextGradient.factor1, scale);
                            var max = Scalar.Lerp(currentGradient.factor2, nextGradient.factor2, scale);
                            particle.remapData.z = min;
                            particle.remapData.w = max - min;
                        });
                    }
                }
                if (_this._isAnimationSheetEnabled) {
                    particle.updateCellIndex();
                }
                // Update the position of the attached sub-emitters to match their attached particle
                particle._inheritParticleInfoToSubEmitters();
                if (particle.age >= particle.lifeTime) {
                    // Recycle by swapping with last particle
                    _this._emitFromParticle(particle);
                    if (particle._attachedSubEmitters) {
                        particle._attachedSubEmitters.forEach(function (subEmitter) {
                            subEmitter.particleSystem.disposeOnStop = true;
                            subEmitter.particleSystem.stop();
                        });
                        particle._attachedSubEmitters = null;
                    }
                    _this.recycleParticle(particle);
                    index--;
                    return out_index_1 = index, "continue";
                }
                out_index_1 = index;
            };
            var out_index_1;
            for (var index = 0; index < particles.length; index++) {
                _loop_1(index);
                index = out_index_1;
            }
        };
        return _this;
    }
    Object.defineProperty(ParticleSystem.prototype, "onDispose", {
        /**
         * Sets a callback that will be triggered when the system is disposed
         */
        set: function (callback) {
            if (this._onDisposeObserver) {
                this.onDisposeObservable.remove(this._onDisposeObserver);
            }
            this._onDisposeObserver = this.onDisposeObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticleSystem.prototype, "useRampGradients", {
        /** Gets or sets a boolean indicating that ramp gradients must be used
         * @see https://doc.babylonjs.com/babylon101/particles#ramp-gradients
         */
        get: function () {
            return this._useRampGradients;
        },
        set: function (value) {
            if (this._useRampGradients === value) {
                return;
            }
            this._useRampGradients = value;
            this._resetEffect();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticleSystem.prototype, "particles", {
        //end of Sub-emitter
        /**
         * Gets the current list of active particles
         */
        get: function () {
            return this._particles;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the number of particles active at the same time.
     * @returns The number of active particles.
     */
    ParticleSystem.prototype.getActiveCount = function () {
        return this._particles.length;
    };
    /**
     * Returns the string "ParticleSystem"
     * @returns a string containing the class name
     */
    ParticleSystem.prototype.getClassName = function () {
        return "ParticleSystem";
    };
    /**
     * Gets a boolean indicating that the system is stopping
     * @returns true if the system is currently stopping
     */
    ParticleSystem.prototype.isStopping = function () {
        return this._stopped && this.isAlive();
    };
    /**
     * Gets the custom effect used to render the particles
     * @param blendMode Blend mode for which the effect should be retrieved
     * @returns The effect
     */
    ParticleSystem.prototype.getCustomEffect = function (blendMode) {
        var _a, _b;
        if (blendMode === void 0) { blendMode = 0; }
        return (_b = (_a = this._customWrappers[blendMode]) === null || _a === void 0 ? void 0 : _a.effect) !== null && _b !== void 0 ? _b : this._customWrappers[0].effect;
    };
    ParticleSystem.prototype._getCustomDrawWrapper = function (blendMode) {
        var _a;
        if (blendMode === void 0) { blendMode = 0; }
        return (_a = this._customWrappers[blendMode]) !== null && _a !== void 0 ? _a : this._customWrappers[0];
    };
    /**
     * Sets the custom effect used to render the particles
     * @param effect The effect to set
     * @param blendMode Blend mode for which the effect should be set
     */
    ParticleSystem.prototype.setCustomEffect = function (effect, blendMode) {
        if (blendMode === void 0) { blendMode = 0; }
        this._customWrappers[blendMode] = new DrawWrapper(this._engine);
        this._customWrappers[blendMode].effect = effect;
        if (this._customWrappers[blendMode].drawContext) {
            this._customWrappers[blendMode].drawContext.useInstancing = this._useInstancing;
        }
    };
    Object.defineProperty(ParticleSystem.prototype, "onBeforeDrawParticlesObservable", {
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
    Object.defineProperty(ParticleSystem.prototype, "vertexShaderName", {
        /**
         * Gets the name of the particle vertex shader
         */
        get: function () {
            return "particles";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticleSystem.prototype, "vertexBuffers", {
        /**
         * Gets the vertex buffers used by the particle system
         */
        get: function () {
            return this._vertexBuffers;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticleSystem.prototype, "indexBuffer", {
        /**
         * Gets the index buffer used by the particle system (or null if no index buffer is used (if _useInstancing=true))
         */
        get: function () {
            return this._indexBuffer;
        },
        enumerable: false,
        configurable: true
    });
    ParticleSystem.prototype._addFactorGradient = function (factorGradients, gradient, factor, factor2) {
        var newGradient = new FactorGradient(gradient, factor, factor2);
        factorGradients.push(newGradient);
        factorGradients.sort(function (a, b) {
            if (a.gradient < b.gradient) {
                return -1;
            }
            else if (a.gradient > b.gradient) {
                return 1;
            }
            return 0;
        });
    };
    ParticleSystem.prototype._removeFactorGradient = function (factorGradients, gradient) {
        if (!factorGradients) {
            return;
        }
        var index = 0;
        for (var _i = 0, factorGradients_1 = factorGradients; _i < factorGradients_1.length; _i++) {
            var factorGradient = factorGradients_1[_i];
            if (factorGradient.gradient === gradient) {
                factorGradients.splice(index, 1);
                break;
            }
            index++;
        }
    };
    /**
     * Adds a new life time gradient
     * @param gradient defines the gradient to use (between 0 and 1)
     * @param factor defines the life time factor to affect to the specified gradient
     * @param factor2 defines an additional factor used to define a range ([factor, factor2]) with main value to pick the final value from
     * @returns the current particle system
     */
    ParticleSystem.prototype.addLifeTimeGradient = function (gradient, factor, factor2) {
        if (!this._lifeTimeGradients) {
            this._lifeTimeGradients = [];
        }
        this._addFactorGradient(this._lifeTimeGradients, gradient, factor, factor2);
        return this;
    };
    /**
     * Remove a specific life time gradient
     * @param gradient defines the gradient to remove
     * @returns the current particle system
     */
    ParticleSystem.prototype.removeLifeTimeGradient = function (gradient) {
        this._removeFactorGradient(this._lifeTimeGradients, gradient);
        return this;
    };
    /**
     * Adds a new size gradient
     * @param gradient defines the gradient to use (between 0 and 1)
     * @param factor defines the size factor to affect to the specified gradient
     * @param factor2 defines an additional factor used to define a range ([factor, factor2]) with main value to pick the final value from
     * @returns the current particle system
     */
    ParticleSystem.prototype.addSizeGradient = function (gradient, factor, factor2) {
        if (!this._sizeGradients) {
            this._sizeGradients = [];
        }
        this._addFactorGradient(this._sizeGradients, gradient, factor, factor2);
        return this;
    };
    /**
     * Remove a specific size gradient
     * @param gradient defines the gradient to remove
     * @returns the current particle system
     */
    ParticleSystem.prototype.removeSizeGradient = function (gradient) {
        this._removeFactorGradient(this._sizeGradients, gradient);
        return this;
    };
    /**
     * Adds a new color remap gradient
     * @param gradient defines the gradient to use (between 0 and 1)
     * @param min defines the color remap minimal range
     * @param max defines the color remap maximal range
     * @returns the current particle system
     */
    ParticleSystem.prototype.addColorRemapGradient = function (gradient, min, max) {
        if (!this._colorRemapGradients) {
            this._colorRemapGradients = [];
        }
        this._addFactorGradient(this._colorRemapGradients, gradient, min, max);
        return this;
    };
    /**
     * Remove a specific color remap gradient
     * @param gradient defines the gradient to remove
     * @returns the current particle system
     */
    ParticleSystem.prototype.removeColorRemapGradient = function (gradient) {
        this._removeFactorGradient(this._colorRemapGradients, gradient);
        return this;
    };
    /**
     * Adds a new alpha remap gradient
     * @param gradient defines the gradient to use (between 0 and 1)
     * @param min defines the alpha remap minimal range
     * @param max defines the alpha remap maximal range
     * @returns the current particle system
     */
    ParticleSystem.prototype.addAlphaRemapGradient = function (gradient, min, max) {
        if (!this._alphaRemapGradients) {
            this._alphaRemapGradients = [];
        }
        this._addFactorGradient(this._alphaRemapGradients, gradient, min, max);
        return this;
    };
    /**
     * Remove a specific alpha remap gradient
     * @param gradient defines the gradient to remove
     * @returns the current particle system
     */
    ParticleSystem.prototype.removeAlphaRemapGradient = function (gradient) {
        this._removeFactorGradient(this._alphaRemapGradients, gradient);
        return this;
    };
    /**
     * Adds a new angular speed gradient
     * @param gradient defines the gradient to use (between 0 and 1)
     * @param factor defines the angular speed  to affect to the specified gradient
     * @param factor2 defines an additional factor used to define a range ([factor, factor2]) with main value to pick the final value from
     * @returns the current particle system
     */
    ParticleSystem.prototype.addAngularSpeedGradient = function (gradient, factor, factor2) {
        if (!this._angularSpeedGradients) {
            this._angularSpeedGradients = [];
        }
        this._addFactorGradient(this._angularSpeedGradients, gradient, factor, factor2);
        return this;
    };
    /**
     * Remove a specific angular speed gradient
     * @param gradient defines the gradient to remove
     * @returns the current particle system
     */
    ParticleSystem.prototype.removeAngularSpeedGradient = function (gradient) {
        this._removeFactorGradient(this._angularSpeedGradients, gradient);
        return this;
    };
    /**
     * Adds a new velocity gradient
     * @param gradient defines the gradient to use (between 0 and 1)
     * @param factor defines the velocity to affect to the specified gradient
     * @param factor2 defines an additional factor used to define a range ([factor, factor2]) with main value to pick the final value from
     * @returns the current particle system
     */
    ParticleSystem.prototype.addVelocityGradient = function (gradient, factor, factor2) {
        if (!this._velocityGradients) {
            this._velocityGradients = [];
        }
        this._addFactorGradient(this._velocityGradients, gradient, factor, factor2);
        return this;
    };
    /**
     * Remove a specific velocity gradient
     * @param gradient defines the gradient to remove
     * @returns the current particle system
     */
    ParticleSystem.prototype.removeVelocityGradient = function (gradient) {
        this._removeFactorGradient(this._velocityGradients, gradient);
        return this;
    };
    /**
     * Adds a new limit velocity gradient
     * @param gradient defines the gradient to use (between 0 and 1)
     * @param factor defines the limit velocity value to affect to the specified gradient
     * @param factor2 defines an additional factor used to define a range ([factor, factor2]) with main value to pick the final value from
     * @returns the current particle system
     */
    ParticleSystem.prototype.addLimitVelocityGradient = function (gradient, factor, factor2) {
        if (!this._limitVelocityGradients) {
            this._limitVelocityGradients = [];
        }
        this._addFactorGradient(this._limitVelocityGradients, gradient, factor, factor2);
        return this;
    };
    /**
     * Remove a specific limit velocity gradient
     * @param gradient defines the gradient to remove
     * @returns the current particle system
     */
    ParticleSystem.prototype.removeLimitVelocityGradient = function (gradient) {
        this._removeFactorGradient(this._limitVelocityGradients, gradient);
        return this;
    };
    /**
     * Adds a new drag gradient
     * @param gradient defines the gradient to use (between 0 and 1)
     * @param factor defines the drag value to affect to the specified gradient
     * @param factor2 defines an additional factor used to define a range ([factor, factor2]) with main value to pick the final value from
     * @returns the current particle system
     */
    ParticleSystem.prototype.addDragGradient = function (gradient, factor, factor2) {
        if (!this._dragGradients) {
            this._dragGradients = [];
        }
        this._addFactorGradient(this._dragGradients, gradient, factor, factor2);
        return this;
    };
    /**
     * Remove a specific drag gradient
     * @param gradient defines the gradient to remove
     * @returns the current particle system
     */
    ParticleSystem.prototype.removeDragGradient = function (gradient) {
        this._removeFactorGradient(this._dragGradients, gradient);
        return this;
    };
    /**
     * Adds a new emit rate gradient (please note that this will only work if you set the targetStopDuration property)
     * @param gradient defines the gradient to use (between 0 and 1)
     * @param factor defines the emit rate value to affect to the specified gradient
     * @param factor2 defines an additional factor used to define a range ([factor, factor2]) with main value to pick the final value from
     * @returns the current particle system
     */
    ParticleSystem.prototype.addEmitRateGradient = function (gradient, factor, factor2) {
        if (!this._emitRateGradients) {
            this._emitRateGradients = [];
        }
        this._addFactorGradient(this._emitRateGradients, gradient, factor, factor2);
        return this;
    };
    /**
     * Remove a specific emit rate gradient
     * @param gradient defines the gradient to remove
     * @returns the current particle system
     */
    ParticleSystem.prototype.removeEmitRateGradient = function (gradient) {
        this._removeFactorGradient(this._emitRateGradients, gradient);
        return this;
    };
    /**
     * Adds a new start size gradient (please note that this will only work if you set the targetStopDuration property)
     * @param gradient defines the gradient to use (between 0 and 1)
     * @param factor defines the start size value to affect to the specified gradient
     * @param factor2 defines an additional factor used to define a range ([factor, factor2]) with main value to pick the final value from
     * @returns the current particle system
     */
    ParticleSystem.prototype.addStartSizeGradient = function (gradient, factor, factor2) {
        if (!this._startSizeGradients) {
            this._startSizeGradients = [];
        }
        this._addFactorGradient(this._startSizeGradients, gradient, factor, factor2);
        return this;
    };
    /**
     * Remove a specific start size gradient
     * @param gradient defines the gradient to remove
     * @returns the current particle system
     */
    ParticleSystem.prototype.removeStartSizeGradient = function (gradient) {
        this._removeFactorGradient(this._startSizeGradients, gradient);
        return this;
    };
    ParticleSystem.prototype._createRampGradientTexture = function () {
        if (!this._rampGradients || !this._rampGradients.length || this._rampGradientsTexture || !this._scene) {
            return;
        }
        var data = new Uint8Array(this._rawTextureWidth * 4);
        var tmpColor = TmpColors.Color3[0];
        var _loop_2 = function (x) {
            var ratio = x / this_1._rawTextureWidth;
            GradientHelper.GetCurrentGradient(ratio, this_1._rampGradients, function (currentGradient, nextGradient, scale) {
                Color3.LerpToRef(currentGradient.color, nextGradient.color, scale, tmpColor);
                data[x * 4] = tmpColor.r * 255;
                data[x * 4 + 1] = tmpColor.g * 255;
                data[x * 4 + 2] = tmpColor.b * 255;
                data[x * 4 + 3] = 255;
            });
        };
        var this_1 = this;
        for (var x = 0; x < this._rawTextureWidth; x++) {
            _loop_2(x);
        }
        this._rampGradientsTexture = RawTexture.CreateRGBATexture(data, this._rawTextureWidth, 1, this._scene, false, false, 1);
    };
    /**
     * Gets the current list of ramp gradients.
     * You must use addRampGradient and removeRampGradient to update this list
     * @returns the list of ramp gradients
     */
    ParticleSystem.prototype.getRampGradients = function () {
        return this._rampGradients;
    };
    /** Force the system to rebuild all gradients that need to be resync */
    ParticleSystem.prototype.forceRefreshGradients = function () {
        this._syncRampGradientTexture();
    };
    ParticleSystem.prototype._syncRampGradientTexture = function () {
        if (!this._rampGradients) {
            return;
        }
        this._rampGradients.sort(function (a, b) {
            if (a.gradient < b.gradient) {
                return -1;
            }
            else if (a.gradient > b.gradient) {
                return 1;
            }
            return 0;
        });
        if (this._rampGradientsTexture) {
            this._rampGradientsTexture.dispose();
            this._rampGradientsTexture = null;
        }
        this._createRampGradientTexture();
    };
    /**
     * Adds a new ramp gradient used to remap particle colors
     * @param gradient defines the gradient to use (between 0 and 1)
     * @param color defines the color to affect to the specified gradient
     * @returns the current particle system
     */
    ParticleSystem.prototype.addRampGradient = function (gradient, color) {
        if (!this._rampGradients) {
            this._rampGradients = [];
        }
        var rampGradient = new Color3Gradient(gradient, color);
        this._rampGradients.push(rampGradient);
        this._syncRampGradientTexture();
        return this;
    };
    /**
     * Remove a specific ramp gradient
     * @param gradient defines the gradient to remove
     * @returns the current particle system
     */
    ParticleSystem.prototype.removeRampGradient = function (gradient) {
        this._removeGradientAndTexture(gradient, this._rampGradients, this._rampGradientsTexture);
        this._rampGradientsTexture = null;
        if (this._rampGradients && this._rampGradients.length > 0) {
            this._createRampGradientTexture();
        }
        return this;
    };
    /**
     * Adds a new color gradient
     * @param gradient defines the gradient to use (between 0 and 1)
     * @param color1 defines the color to affect to the specified gradient
     * @param color2 defines an additional color used to define a range ([color, color2]) with main color to pick the final color from
     * @returns this particle system
     */
    ParticleSystem.prototype.addColorGradient = function (gradient, color1, color2) {
        if (!this._colorGradients) {
            this._colorGradients = [];
        }
        var colorGradient = new ColorGradient(gradient, color1, color2);
        this._colorGradients.push(colorGradient);
        this._colorGradients.sort(function (a, b) {
            if (a.gradient < b.gradient) {
                return -1;
            }
            else if (a.gradient > b.gradient) {
                return 1;
            }
            return 0;
        });
        return this;
    };
    /**
     * Remove a specific color gradient
     * @param gradient defines the gradient to remove
     * @returns this particle system
     */
    ParticleSystem.prototype.removeColorGradient = function (gradient) {
        if (!this._colorGradients) {
            return this;
        }
        var index = 0;
        for (var _i = 0, _a = this._colorGradients; _i < _a.length; _i++) {
            var colorGradient = _a[_i];
            if (colorGradient.gradient === gradient) {
                this._colorGradients.splice(index, 1);
                break;
            }
            index++;
        }
        return this;
    };
    /**
     * Resets the draw wrappers cache
     */
    ParticleSystem.prototype.resetDrawCache = function () {
        for (var _i = 0, _a = this._drawWrappers; _i < _a.length; _i++) {
            var drawWrappers = _a[_i];
            if (drawWrappers) {
                for (var _b = 0, drawWrappers_1 = drawWrappers; _b < drawWrappers_1.length; _b++) {
                    var drawWrapper = drawWrappers_1[_b];
                    drawWrapper === null || drawWrapper === void 0 ? void 0 : drawWrapper.dispose();
                }
            }
        }
        this._drawWrappers = [];
    };
    ParticleSystem.prototype._fetchR = function (u, v, width, height, pixels) {
        u = Math.abs(u) * 0.5 + 0.5;
        v = Math.abs(v) * 0.5 + 0.5;
        var wrappedU = (u * width) % width | 0;
        var wrappedV = (v * height) % height | 0;
        var position = (wrappedU + wrappedV * width) * 4;
        return pixels[position] / 255;
    };
    ParticleSystem.prototype._reset = function () {
        this._resetEffect();
    };
    ParticleSystem.prototype._resetEffect = function () {
        if (this._vertexBuffer) {
            this._vertexBuffer.dispose();
            this._vertexBuffer = null;
        }
        if (this._spriteBuffer) {
            this._spriteBuffer.dispose();
            this._spriteBuffer = null;
        }
        if (this._vertexArrayObject) {
            this._engine.releaseVertexArrayObject(this._vertexArrayObject);
            this._vertexArrayObject = null;
        }
        this._createVertexBuffers();
    };
    ParticleSystem.prototype._createVertexBuffers = function () {
        this._vertexBufferSize = this._useInstancing ? 10 : 12;
        if (this._isAnimationSheetEnabled) {
            this._vertexBufferSize += 1;
        }
        if (!this._isBillboardBased || this.billboardMode === ParticleSystem.BILLBOARDMODE_STRETCHED) {
            this._vertexBufferSize += 3;
        }
        if (this._useRampGradients) {
            this._vertexBufferSize += 4;
        }
        var engine = this._engine;
        var vertexSize = this._vertexBufferSize * (this._useInstancing ? 1 : 4);
        this._vertexData = new Float32Array(this._capacity * vertexSize);
        this._vertexBuffer = new Buffer(engine, this._vertexData, true, vertexSize);
        var dataOffset = 0;
        var positions = this._vertexBuffer.createVertexBuffer(VertexBuffer.PositionKind, dataOffset, 3, this._vertexBufferSize, this._useInstancing);
        this._vertexBuffers[VertexBuffer.PositionKind] = positions;
        dataOffset += 3;
        var colors = this._vertexBuffer.createVertexBuffer(VertexBuffer.ColorKind, dataOffset, 4, this._vertexBufferSize, this._useInstancing);
        this._vertexBuffers[VertexBuffer.ColorKind] = colors;
        dataOffset += 4;
        var options = this._vertexBuffer.createVertexBuffer("angle", dataOffset, 1, this._vertexBufferSize, this._useInstancing);
        this._vertexBuffers["angle"] = options;
        dataOffset += 1;
        var size = this._vertexBuffer.createVertexBuffer("size", dataOffset, 2, this._vertexBufferSize, this._useInstancing);
        this._vertexBuffers["size"] = size;
        dataOffset += 2;
        if (this._isAnimationSheetEnabled) {
            var cellIndexBuffer = this._vertexBuffer.createVertexBuffer("cellIndex", dataOffset, 1, this._vertexBufferSize, this._useInstancing);
            this._vertexBuffers["cellIndex"] = cellIndexBuffer;
            dataOffset += 1;
        }
        if (!this._isBillboardBased || this.billboardMode === ParticleSystem.BILLBOARDMODE_STRETCHED) {
            var directionBuffer = this._vertexBuffer.createVertexBuffer("direction", dataOffset, 3, this._vertexBufferSize, this._useInstancing);
            this._vertexBuffers["direction"] = directionBuffer;
            dataOffset += 3;
        }
        if (this._useRampGradients) {
            var rampDataBuffer = this._vertexBuffer.createVertexBuffer("remapData", dataOffset, 4, this._vertexBufferSize, this._useInstancing);
            this._vertexBuffers["remapData"] = rampDataBuffer;
            dataOffset += 4;
        }
        var offsets;
        if (this._useInstancing) {
            var spriteData = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
            this._spriteBuffer = new Buffer(engine, spriteData, false, 2);
            offsets = this._spriteBuffer.createVertexBuffer("offset", 0, 2);
        }
        else {
            offsets = this._vertexBuffer.createVertexBuffer("offset", dataOffset, 2, this._vertexBufferSize, this._useInstancing);
            dataOffset += 2;
        }
        this._vertexBuffers["offset"] = offsets;
        this.resetDrawCache();
    };
    ParticleSystem.prototype._createIndexBuffer = function () {
        if (this._useInstancing) {
            return;
        }
        var indices = [];
        var index = 0;
        for (var count = 0; count < this._capacity; count++) {
            indices.push(index);
            indices.push(index + 1);
            indices.push(index + 2);
            indices.push(index);
            indices.push(index + 2);
            indices.push(index + 3);
            index += 4;
        }
        this._indexBuffer = this._engine.createIndexBuffer(indices);
    };
    /**
     * Gets the maximum number of particles active at the same time.
     * @returns The max number of active particles.
     */
    ParticleSystem.prototype.getCapacity = function () {
        return this._capacity;
    };
    /**
     * Gets whether there are still active particles in the system.
     * @returns True if it is alive, otherwise false.
     */
    ParticleSystem.prototype.isAlive = function () {
        return this._alive;
    };
    /**
     * Gets if the system has been started. (Note: this will still be true after stop is called)
     * @returns True if it has been started, otherwise false.
     */
    ParticleSystem.prototype.isStarted = function () {
        return this._started;
    };
    ParticleSystem.prototype._prepareSubEmitterInternalArray = function () {
        var _this = this;
        this._subEmitters = new Array();
        if (this.subEmitters) {
            this.subEmitters.forEach(function (subEmitter) {
                if (subEmitter instanceof ParticleSystem) {
                    _this._subEmitters.push([new SubEmitter(subEmitter)]);
                }
                else if (subEmitter instanceof SubEmitter) {
                    _this._subEmitters.push([subEmitter]);
                }
                else if (subEmitter instanceof Array) {
                    _this._subEmitters.push(subEmitter);
                }
            });
        }
    };
    /**
     * Starts the particle system and begins to emit
     * @param delay defines the delay in milliseconds before starting the system (this.startDelay by default)
     */
    ParticleSystem.prototype.start = function (delay) {
        var _this = this;
        var _a;
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
        // Convert the subEmitters field to the constant type field _subEmitters
        this._prepareSubEmitterInternalArray();
        this._started = true;
        this._stopped = false;
        this._actualFrame = 0;
        if (this._subEmitters && this._subEmitters.length != 0) {
            this.activeSubSystems = new Array();
        }
        // Reset emit gradient so it acts the same on every start
        if (this._emitRateGradients) {
            if (this._emitRateGradients.length > 0) {
                this._currentEmitRateGradient = this._emitRateGradients[0];
                this._currentEmitRate1 = this._currentEmitRateGradient.getFactor();
                this._currentEmitRate2 = this._currentEmitRate1;
            }
            if (this._emitRateGradients.length > 1) {
                this._currentEmitRate2 = this._emitRateGradients[1].getFactor();
            }
        }
        // Reset start size gradient so it acts the same on every start
        if (this._startSizeGradients) {
            if (this._startSizeGradients.length > 0) {
                this._currentStartSizeGradient = this._startSizeGradients[0];
                this._currentStartSize1 = this._currentStartSizeGradient.getFactor();
                this._currentStartSize2 = this._currentStartSize1;
            }
            if (this._startSizeGradients.length > 1) {
                this._currentStartSize2 = this._startSizeGradients[1].getFactor();
            }
        }
        if (this.preWarmCycles) {
            if (((_a = this.emitter) === null || _a === void 0 ? void 0 : _a.getClassName().indexOf("Mesh")) !== -1) {
                this.emitter.computeWorldMatrix(true);
            }
            var noiseTextureAsProcedural_1 = this.noiseTexture;
            if (noiseTextureAsProcedural_1 && noiseTextureAsProcedural_1.onGeneratedObservable) {
                noiseTextureAsProcedural_1.onGeneratedObservable.addOnce(function () {
                    setTimeout(function () {
                        for (var index = 0; index < _this.preWarmCycles; index++) {
                            _this.animate(true);
                            noiseTextureAsProcedural_1.render();
                        }
                    });
                });
            }
            else {
                for (var index = 0; index < this.preWarmCycles; index++) {
                    this.animate(true);
                }
            }
        }
        // Animations
        if (this.beginAnimationOnStart && this.animations && this.animations.length > 0 && this._scene) {
            this._scene.beginAnimation(this, this.beginAnimationFrom, this.beginAnimationTo, this.beginAnimationLoop);
        }
    };
    /**
     * Stops the particle system.
     * @param stopSubEmitters if true it will stop the current system and all created sub-Systems if false it will stop the current root system only, this param is used by the root particle system only. the default value is true.
     */
    ParticleSystem.prototype.stop = function (stopSubEmitters) {
        if (stopSubEmitters === void 0) { stopSubEmitters = true; }
        if (this._stopped) {
            return;
        }
        this.onStoppedObservable.notifyObservers(this);
        this._stopped = true;
        if (stopSubEmitters) {
            this._stopSubEmitters();
        }
    };
    // animation sheet
    /**
     * Remove all active particles
     */
    ParticleSystem.prototype.reset = function () {
        this._stockParticles = [];
        this._particles = [];
    };
    /**
     * @param index
     * @param particle
     * @param offsetX
     * @param offsetY
     * @hidden (for internal use only)
     */
    ParticleSystem.prototype._appendParticleVertex = function (index, particle, offsetX, offsetY) {
        var offset = index * this._vertexBufferSize;
        this._vertexData[offset++] = particle.position.x + this.worldOffset.x;
        this._vertexData[offset++] = particle.position.y + this.worldOffset.y;
        this._vertexData[offset++] = particle.position.z + this.worldOffset.z;
        this._vertexData[offset++] = particle.color.r;
        this._vertexData[offset++] = particle.color.g;
        this._vertexData[offset++] = particle.color.b;
        this._vertexData[offset++] = particle.color.a;
        this._vertexData[offset++] = particle.angle;
        this._vertexData[offset++] = particle.scale.x * particle.size;
        this._vertexData[offset++] = particle.scale.y * particle.size;
        if (this._isAnimationSheetEnabled) {
            this._vertexData[offset++] = particle.cellIndex;
        }
        if (!this._isBillboardBased) {
            if (particle._initialDirection) {
                var initialDirection = particle._initialDirection;
                if (this.isLocal) {
                    Vector3.TransformNormalToRef(initialDirection, this._emitterWorldMatrix, TmpVectors.Vector3[0]);
                    initialDirection = TmpVectors.Vector3[0];
                }
                if (initialDirection.x === 0 && initialDirection.z === 0) {
                    initialDirection.x = 0.001;
                }
                this._vertexData[offset++] = initialDirection.x;
                this._vertexData[offset++] = initialDirection.y;
                this._vertexData[offset++] = initialDirection.z;
            }
            else {
                var direction = particle.direction;
                if (this.isLocal) {
                    Vector3.TransformNormalToRef(direction, this._emitterWorldMatrix, TmpVectors.Vector3[0]);
                    direction = TmpVectors.Vector3[0];
                }
                if (direction.x === 0 && direction.z === 0) {
                    direction.x = 0.001;
                }
                this._vertexData[offset++] = direction.x;
                this._vertexData[offset++] = direction.y;
                this._vertexData[offset++] = direction.z;
            }
        }
        else if (this.billboardMode === ParticleSystem.BILLBOARDMODE_STRETCHED) {
            this._vertexData[offset++] = particle.direction.x;
            this._vertexData[offset++] = particle.direction.y;
            this._vertexData[offset++] = particle.direction.z;
        }
        if (this._useRampGradients && particle.remapData) {
            this._vertexData[offset++] = particle.remapData.x;
            this._vertexData[offset++] = particle.remapData.y;
            this._vertexData[offset++] = particle.remapData.z;
            this._vertexData[offset++] = particle.remapData.w;
        }
        if (!this._useInstancing) {
            if (this._isAnimationSheetEnabled) {
                if (offsetX === 0) {
                    offsetX = this._epsilon;
                }
                else if (offsetX === 1) {
                    offsetX = 1 - this._epsilon;
                }
                if (offsetY === 0) {
                    offsetY = this._epsilon;
                }
                else if (offsetY === 1) {
                    offsetY = 1 - this._epsilon;
                }
            }
            this._vertexData[offset++] = offsetX;
            this._vertexData[offset++] = offsetY;
        }
    };
    ParticleSystem.prototype._stopSubEmitters = function () {
        if (!this.activeSubSystems) {
            return;
        }
        this.activeSubSystems.forEach(function (subSystem) {
            subSystem.stop(true);
        });
        this.activeSubSystems = new Array();
    };
    ParticleSystem.prototype._removeFromRoot = function () {
        if (!this._rootParticleSystem) {
            return;
        }
        var index = this._rootParticleSystem.activeSubSystems.indexOf(this);
        if (index !== -1) {
            this._rootParticleSystem.activeSubSystems.splice(index, 1);
        }
        this._rootParticleSystem = null;
    };
    // End of sub system methods
    ParticleSystem.prototype._update = function (newParticles) {
        var _this = this;
        // Update current
        this._alive = this._particles.length > 0;
        if (this.emitter.position) {
            var emitterMesh = this.emitter;
            this._emitterWorldMatrix = emitterMesh.getWorldMatrix();
        }
        else {
            var emitterPosition = this.emitter;
            this._emitterWorldMatrix = Matrix.Translation(emitterPosition.x, emitterPosition.y, emitterPosition.z);
        }
        this._emitterWorldMatrix.invertToRef(this._emitterInverseWorldMatrix);
        this.updateFunction(this._particles);
        // Add new ones
        var particle;
        var _loop_3 = function (index) {
            if (this_2._particles.length === this_2._capacity) {
                return "break";
            }
            particle = this_2._createParticle();
            this_2._particles.push(particle);
            // Life time
            if (this_2.targetStopDuration && this_2._lifeTimeGradients && this_2._lifeTimeGradients.length > 0) {
                var ratio_1 = Scalar.Clamp(this_2._actualFrame / this_2.targetStopDuration);
                GradientHelper.GetCurrentGradient(ratio_1, this_2._lifeTimeGradients, function (currentGradient, nextGradient) {
                    var factorGradient1 = currentGradient;
                    var factorGradient2 = nextGradient;
                    var lifeTime1 = factorGradient1.getFactor();
                    var lifeTime2 = factorGradient2.getFactor();
                    var gradient = (ratio_1 - factorGradient1.gradient) / (factorGradient2.gradient - factorGradient1.gradient);
                    particle.lifeTime = Scalar.Lerp(lifeTime1, lifeTime2, gradient);
                });
            }
            else {
                particle.lifeTime = Scalar.RandomRange(this_2.minLifeTime, this_2.maxLifeTime);
            }
            // Emitter
            var emitPower = Scalar.RandomRange(this_2.minEmitPower, this_2.maxEmitPower);
            if (this_2.startPositionFunction) {
                this_2.startPositionFunction(this_2._emitterWorldMatrix, particle.position, particle, this_2.isLocal);
            }
            else {
                this_2.particleEmitterType.startPositionFunction(this_2._emitterWorldMatrix, particle.position, particle, this_2.isLocal);
            }
            if (this_2.isLocal) {
                if (!particle._localPosition) {
                    particle._localPosition = particle.position.clone();
                }
                else {
                    particle._localPosition.copyFrom(particle.position);
                }
                Vector3.TransformCoordinatesToRef(particle._localPosition, this_2._emitterWorldMatrix, particle.position);
            }
            if (this_2.startDirectionFunction) {
                this_2.startDirectionFunction(this_2._emitterWorldMatrix, particle.direction, particle, this_2.isLocal);
            }
            else {
                this_2.particleEmitterType.startDirectionFunction(this_2._emitterWorldMatrix, particle.direction, particle, this_2.isLocal, this_2._emitterInverseWorldMatrix);
            }
            if (emitPower === 0) {
                if (!particle._initialDirection) {
                    particle._initialDirection = particle.direction.clone();
                }
                else {
                    particle._initialDirection.copyFrom(particle.direction);
                }
            }
            else {
                particle._initialDirection = null;
            }
            particle.direction.scaleInPlace(emitPower);
            // Size
            if (!this_2._sizeGradients || this_2._sizeGradients.length === 0) {
                particle.size = Scalar.RandomRange(this_2.minSize, this_2.maxSize);
            }
            else {
                particle._currentSizeGradient = this_2._sizeGradients[0];
                particle._currentSize1 = particle._currentSizeGradient.getFactor();
                particle.size = particle._currentSize1;
                if (this_2._sizeGradients.length > 1) {
                    particle._currentSize2 = this_2._sizeGradients[1].getFactor();
                }
                else {
                    particle._currentSize2 = particle._currentSize1;
                }
            }
            // Size and scale
            particle.scale.copyFromFloats(Scalar.RandomRange(this_2.minScaleX, this_2.maxScaleX), Scalar.RandomRange(this_2.minScaleY, this_2.maxScaleY));
            // Adjust scale by start size
            if (this_2._startSizeGradients && this_2._startSizeGradients[0] && this_2.targetStopDuration) {
                var ratio = this_2._actualFrame / this_2.targetStopDuration;
                GradientHelper.GetCurrentGradient(ratio, this_2._startSizeGradients, function (currentGradient, nextGradient, scale) {
                    if (currentGradient !== _this._currentStartSizeGradient) {
                        _this._currentStartSize1 = _this._currentStartSize2;
                        _this._currentStartSize2 = nextGradient.getFactor();
                        _this._currentStartSizeGradient = currentGradient;
                    }
                    var value = Scalar.Lerp(_this._currentStartSize1, _this._currentStartSize2, scale);
                    particle.scale.scaleInPlace(value);
                });
            }
            // Angle
            if (!this_2._angularSpeedGradients || this_2._angularSpeedGradients.length === 0) {
                particle.angularSpeed = Scalar.RandomRange(this_2.minAngularSpeed, this_2.maxAngularSpeed);
            }
            else {
                particle._currentAngularSpeedGradient = this_2._angularSpeedGradients[0];
                particle.angularSpeed = particle._currentAngularSpeedGradient.getFactor();
                particle._currentAngularSpeed1 = particle.angularSpeed;
                if (this_2._angularSpeedGradients.length > 1) {
                    particle._currentAngularSpeed2 = this_2._angularSpeedGradients[1].getFactor();
                }
                else {
                    particle._currentAngularSpeed2 = particle._currentAngularSpeed1;
                }
            }
            particle.angle = Scalar.RandomRange(this_2.minInitialRotation, this_2.maxInitialRotation);
            // Velocity
            if (this_2._velocityGradients && this_2._velocityGradients.length > 0) {
                particle._currentVelocityGradient = this_2._velocityGradients[0];
                particle._currentVelocity1 = particle._currentVelocityGradient.getFactor();
                if (this_2._velocityGradients.length > 1) {
                    particle._currentVelocity2 = this_2._velocityGradients[1].getFactor();
                }
                else {
                    particle._currentVelocity2 = particle._currentVelocity1;
                }
            }
            // Limit velocity
            if (this_2._limitVelocityGradients && this_2._limitVelocityGradients.length > 0) {
                particle._currentLimitVelocityGradient = this_2._limitVelocityGradients[0];
                particle._currentLimitVelocity1 = particle._currentLimitVelocityGradient.getFactor();
                if (this_2._limitVelocityGradients.length > 1) {
                    particle._currentLimitVelocity2 = this_2._limitVelocityGradients[1].getFactor();
                }
                else {
                    particle._currentLimitVelocity2 = particle._currentLimitVelocity1;
                }
            }
            // Drag
            if (this_2._dragGradients && this_2._dragGradients.length > 0) {
                particle._currentDragGradient = this_2._dragGradients[0];
                particle._currentDrag1 = particle._currentDragGradient.getFactor();
                if (this_2._dragGradients.length > 1) {
                    particle._currentDrag2 = this_2._dragGradients[1].getFactor();
                }
                else {
                    particle._currentDrag2 = particle._currentDrag1;
                }
            }
            // Color
            if (!this_2._colorGradients || this_2._colorGradients.length === 0) {
                var step = Scalar.RandomRange(0, 1.0);
                Color4.LerpToRef(this_2.color1, this_2.color2, step, particle.color);
                this_2.colorDead.subtractToRef(particle.color, this_2._colorDiff);
                this_2._colorDiff.scaleToRef(1.0 / particle.lifeTime, particle.colorStep);
            }
            else {
                particle._currentColorGradient = this_2._colorGradients[0];
                particle._currentColorGradient.getColorToRef(particle.color);
                particle._currentColor1.copyFrom(particle.color);
                if (this_2._colorGradients.length > 1) {
                    this_2._colorGradients[1].getColorToRef(particle._currentColor2);
                }
                else {
                    particle._currentColor2.copyFrom(particle.color);
                }
            }
            // Sheet
            if (this_2._isAnimationSheetEnabled) {
                particle._initialStartSpriteCellID = this_2.startSpriteCellID;
                particle._initialEndSpriteCellID = this_2.endSpriteCellID;
                particle._initialSpriteCellLoop = this_2.spriteCellLoop;
            }
            // Inherited Velocity
            particle.direction.addInPlace(this_2._inheritedVelocityOffset);
            // Ramp
            if (this_2._useRampGradients) {
                particle.remapData = new Vector4(0, 1, 0, 1);
            }
            // Noise texture coordinates
            if (this_2.noiseTexture) {
                if (particle._randomNoiseCoordinates1) {
                    particle._randomNoiseCoordinates1.copyFromFloats(Math.random(), Math.random(), Math.random());
                    particle._randomNoiseCoordinates2.copyFromFloats(Math.random(), Math.random(), Math.random());
                }
                else {
                    particle._randomNoiseCoordinates1 = new Vector3(Math.random(), Math.random(), Math.random());
                    particle._randomNoiseCoordinates2 = new Vector3(Math.random(), Math.random(), Math.random());
                }
            }
            // Update the position of the attached sub-emitters to match their attached particle
            particle._inheritParticleInfoToSubEmitters();
        };
        var this_2 = this;
        for (var index = 0; index < newParticles; index++) {
            var state_1 = _loop_3(index);
            if (state_1 === "break")
                break;
        }
    };
    /**
     * @param isAnimationSheetEnabled
     * @param isBillboardBased
     * @param useRampGradients
     * @hidden
     */
    ParticleSystem._GetAttributeNamesOrOptions = function (isAnimationSheetEnabled, isBillboardBased, useRampGradients) {
        if (isAnimationSheetEnabled === void 0) { isAnimationSheetEnabled = false; }
        if (isBillboardBased === void 0) { isBillboardBased = false; }
        if (useRampGradients === void 0) { useRampGradients = false; }
        var attributeNamesOrOptions = [VertexBuffer.PositionKind, VertexBuffer.ColorKind, "angle", "offset", "size"];
        if (isAnimationSheetEnabled) {
            attributeNamesOrOptions.push("cellIndex");
        }
        if (!isBillboardBased) {
            attributeNamesOrOptions.push("direction");
        }
        if (useRampGradients) {
            attributeNamesOrOptions.push("remapData");
        }
        return attributeNamesOrOptions;
    };
    /**
     * @param isAnimationSheetEnabled
     * @hidden
     */
    ParticleSystem._GetEffectCreationOptions = function (isAnimationSheetEnabled) {
        if (isAnimationSheetEnabled === void 0) { isAnimationSheetEnabled = false; }
        var effectCreationOption = [
            "invView",
            "view",
            "projection",
            "vClipPlane",
            "vClipPlane2",
            "vClipPlane3",
            "vClipPlane4",
            "vClipPlane5",
            "vClipPlane6",
            "textureMask",
            "translationPivot",
            "eyePosition",
        ];
        if (isAnimationSheetEnabled) {
            effectCreationOption.push("particlesInfos");
        }
        return effectCreationOption;
    };
    /**
     * Fill the defines array according to the current settings of the particle system
     * @param defines Array to be updated
     * @param blendMode blend mode to take into account when updating the array
     */
    ParticleSystem.prototype.fillDefines = function (defines, blendMode) {
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
        if (this._isAnimationSheetEnabled) {
            defines.push("#define ANIMATESHEET");
        }
        if (blendMode === ParticleSystem.BLENDMODE_MULTIPLY) {
            defines.push("#define BLENDMULTIPLYMODE");
        }
        if (this._useRampGradients) {
            defines.push("#define RAMPGRADIENT");
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
        if (this._imageProcessingConfiguration) {
            this._imageProcessingConfiguration.prepareDefines(this._imageProcessingConfigurationDefines);
            defines.push(this._imageProcessingConfigurationDefines.toString());
        }
    };
    /**
     * Fill the uniforms, attributes and samplers arrays according to the current settings of the particle system
     * @param uniforms Uniforms array to fill
     * @param attributes Attributes array to fill
     * @param samplers Samplers array to fill
     */
    ParticleSystem.prototype.fillUniformsAttributesAndSamplerNames = function (uniforms, attributes, samplers) {
        attributes.push.apply(attributes, ParticleSystem._GetAttributeNamesOrOptions(this._isAnimationSheetEnabled, this._isBillboardBased && this.billboardMode !== ParticleSystem.BILLBOARDMODE_STRETCHED, this._useRampGradients));
        uniforms.push.apply(uniforms, ParticleSystem._GetEffectCreationOptions(this._isAnimationSheetEnabled));
        samplers.push("diffuseSampler", "rampSampler");
        if (this._imageProcessingConfiguration) {
            ImageProcessingConfiguration.PrepareUniforms(uniforms, this._imageProcessingConfigurationDefines);
            ImageProcessingConfiguration.PrepareSamplers(samplers, this._imageProcessingConfigurationDefines);
        }
    };
    /**
     * @param blendMode
     * @hidden
     */
    ParticleSystem.prototype._getWrapper = function (blendMode) {
        var customWrapper = this._getCustomDrawWrapper(blendMode);
        if (customWrapper === null || customWrapper === void 0 ? void 0 : customWrapper.effect) {
            return customWrapper;
        }
        var defines = [];
        this.fillDefines(defines, blendMode);
        // Effect
        var currentRenderPassId = this._engine._features.supportRenderPasses ? this._engine.currentRenderPassId : 0;
        var drawWrappers = this._drawWrappers[currentRenderPassId];
        if (!drawWrappers) {
            drawWrappers = this._drawWrappers[currentRenderPassId] = [];
        }
        var drawWrapper = drawWrappers[blendMode];
        if (!drawWrapper) {
            drawWrapper = new DrawWrapper(this._engine);
            if (drawWrapper.drawContext) {
                drawWrapper.drawContext.useInstancing = this._useInstancing;
            }
            drawWrappers[blendMode] = drawWrapper;
        }
        var join = defines.join("\n");
        if (drawWrapper.defines !== join) {
            var attributesNamesOrOptions = [];
            var effectCreationOption = [];
            var samplers = [];
            this.fillUniformsAttributesAndSamplerNames(effectCreationOption, attributesNamesOrOptions, samplers);
            drawWrapper.setEffect(this._engine.createEffect("particles", attributesNamesOrOptions, effectCreationOption, samplers, join), join);
        }
        return drawWrapper;
    };
    /**
     * Animates the particle system for the current frame by emitting new particles and or animating the living ones.
     * @param preWarmOnly will prevent the system from updating the vertex buffer (default is false)
     */
    ParticleSystem.prototype.animate = function (preWarmOnly) {
        var _this = this;
        var _a;
        if (preWarmOnly === void 0) { preWarmOnly = false; }
        if (!this._started) {
            return;
        }
        if (!preWarmOnly && this._scene) {
            // Check
            if (!this.isReady()) {
                return;
            }
            if (this._currentRenderId === this._scene.getFrameId()) {
                return;
            }
            this._currentRenderId = this._scene.getFrameId();
        }
        this._scaledUpdateSpeed = this.updateSpeed * (preWarmOnly ? this.preWarmStepOffset : ((_a = this._scene) === null || _a === void 0 ? void 0 : _a.getAnimationRatio()) || 1);
        // Determine the number of particles we need to create
        var newParticles;
        if (this.manualEmitCount > -1) {
            newParticles = this.manualEmitCount;
            this._newPartsExcess = 0;
            this.manualEmitCount = 0;
        }
        else {
            var rate_1 = this.emitRate;
            if (this._emitRateGradients && this._emitRateGradients.length > 0 && this.targetStopDuration) {
                var ratio = this._actualFrame / this.targetStopDuration;
                GradientHelper.GetCurrentGradient(ratio, this._emitRateGradients, function (currentGradient, nextGradient, scale) {
                    if (currentGradient !== _this._currentEmitRateGradient) {
                        _this._currentEmitRate1 = _this._currentEmitRate2;
                        _this._currentEmitRate2 = nextGradient.getFactor();
                        _this._currentEmitRateGradient = currentGradient;
                    }
                    rate_1 = Scalar.Lerp(_this._currentEmitRate1, _this._currentEmitRate2, scale);
                });
            }
            newParticles = (rate_1 * this._scaledUpdateSpeed) >> 0;
            this._newPartsExcess += rate_1 * this._scaledUpdateSpeed - newParticles;
        }
        if (this._newPartsExcess > 1.0) {
            newParticles += this._newPartsExcess >> 0;
            this._newPartsExcess -= this._newPartsExcess >> 0;
        }
        this._alive = false;
        if (!this._stopped) {
            this._actualFrame += this._scaledUpdateSpeed;
            if (this.targetStopDuration && this._actualFrame >= this.targetStopDuration) {
                this.stop();
            }
        }
        else {
            newParticles = 0;
        }
        this._update(newParticles);
        // Stopped?
        if (this._stopped) {
            if (!this._alive) {
                this._started = false;
                if (this.onAnimationEnd) {
                    this.onAnimationEnd();
                }
                if (this.disposeOnStop && this._scene) {
                    this._scene._toBeDisposed.push(this);
                }
            }
        }
        if (!preWarmOnly) {
            // Update VBO
            var offset = 0;
            for (var index = 0; index < this._particles.length; index++) {
                var particle = this._particles[index];
                this._appendParticleVertices(offset, particle);
                offset += this._useInstancing ? 1 : 4;
            }
            if (this._vertexBuffer) {
                this._vertexBuffer.updateDirectly(this._vertexData, 0, this._particles.length);
            }
        }
        if (this.manualEmitCount === 0 && this.disposeOnStop) {
            this.stop();
        }
    };
    ParticleSystem.prototype._appendParticleVertices = function (offset, particle) {
        this._appendParticleVertex(offset++, particle, 0, 0);
        if (!this._useInstancing) {
            this._appendParticleVertex(offset++, particle, 1, 0);
            this._appendParticleVertex(offset++, particle, 1, 1);
            this._appendParticleVertex(offset++, particle, 0, 1);
        }
    };
    /**
     * Rebuilds the particle system.
     */
    ParticleSystem.prototype.rebuild = function () {
        var _a, _b;
        if (this._engine.getCaps().vertexArrayObject) {
            this._vertexArrayObject = null;
        }
        this._createIndexBuffer();
        (_a = this._spriteBuffer) === null || _a === void 0 ? void 0 : _a._rebuild();
        (_b = this._vertexBuffer) === null || _b === void 0 ? void 0 : _b._rebuild();
        for (var key in this._vertexBuffers) {
            this._vertexBuffers[key]._rebuild();
        }
        this.resetDrawCache();
    };
    /**
     * Is this system ready to be used/rendered
     * @return true if the system is ready
     */
    ParticleSystem.prototype.isReady = function () {
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
        return true;
    };
    ParticleSystem.prototype._render = function (blendMode) {
        var _a, _b;
        var drawWrapper = this._getWrapper(blendMode);
        var effect = drawWrapper.effect;
        var engine = this._engine;
        // Render
        engine.enableEffect(drawWrapper);
        var viewMatrix = (_a = this.defaultViewMatrix) !== null && _a !== void 0 ? _a : this._scene.getViewMatrix();
        effect.setTexture("diffuseSampler", this.particleTexture);
        effect.setMatrix("view", viewMatrix);
        effect.setMatrix("projection", (_b = this.defaultProjectionMatrix) !== null && _b !== void 0 ? _b : this._scene.getProjectionMatrix());
        if (this._isAnimationSheetEnabled && this.particleTexture) {
            var baseSize = this.particleTexture.getBaseSize();
            effect.setFloat3("particlesInfos", this.spriteCellWidth / baseSize.width, this.spriteCellHeight / baseSize.height, this.spriteCellWidth / baseSize.width);
        }
        effect.setVector2("translationPivot", this.translationPivot);
        effect.setFloat4("textureMask", this.textureMask.r, this.textureMask.g, this.textureMask.b, this.textureMask.a);
        if (this._isBillboardBased && this._scene) {
            var camera = this._scene.activeCamera;
            effect.setVector3("eyePosition", camera.globalPosition);
        }
        if (this._rampGradientsTexture) {
            if (!this._rampGradients || !this._rampGradients.length) {
                this._rampGradientsTexture.dispose();
                this._rampGradientsTexture = null;
            }
            effect.setTexture("rampSampler", this._rampGradientsTexture);
        }
        var defines = effect.defines;
        if (this._scene) {
            if (this._scene.clipPlane || this._scene.clipPlane2 || this._scene.clipPlane3 || this._scene.clipPlane4 || this._scene.clipPlane5 || this._scene.clipPlane6) {
                ThinMaterialHelper.BindClipPlane(effect, this._scene);
            }
        }
        if (defines.indexOf("#define BILLBOARDMODE_ALL") >= 0) {
            viewMatrix.invertToRef(TmpVectors.Matrix[0]);
            effect.setMatrix("invView", TmpVectors.Matrix[0]);
        }
        if (this._vertexArrayObject !== undefined) {
            if (!this._vertexArrayObject) {
                this._vertexArrayObject = this._engine.recordVertexArrayObject(this._vertexBuffers, this._indexBuffer, effect);
            }
            this._engine.bindVertexArrayObject(this._vertexArrayObject, this._indexBuffer);
        }
        else {
            engine.bindBuffers(this._vertexBuffers, this._indexBuffer, effect);
        }
        // image processing
        if (this._imageProcessingConfiguration && !this._imageProcessingConfiguration.applyByPostProcess) {
            this._imageProcessingConfiguration.bind(effect);
        }
        // Draw order
        switch (blendMode) {
            case ParticleSystem.BLENDMODE_ADD:
                engine.setAlphaMode(1);
                break;
            case ParticleSystem.BLENDMODE_ONEONE:
                engine.setAlphaMode(6);
                break;
            case ParticleSystem.BLENDMODE_STANDARD:
                engine.setAlphaMode(2);
                break;
            case ParticleSystem.BLENDMODE_MULTIPLY:
                engine.setAlphaMode(4);
                break;
        }
        if (this._onBeforeDrawParticlesObservable) {
            this._onBeforeDrawParticlesObservable.notifyObservers(effect);
        }
        if (this._useInstancing) {
            engine.drawArraysType(7, 0, 4, this._particles.length);
        }
        else {
            engine.drawElementsType(0, 0, this._particles.length * 6);
        }
        return this._particles.length;
    };
    /**
     * Renders the particle system in its current state.
     * @returns the current number of particles
     */
    ParticleSystem.prototype.render = function () {
        // Check
        if (!this.isReady() || !this._particles.length) {
            return 0;
        }
        var engine = this._engine;
        if (engine.setState) {
            engine.setState(false);
            if (this.forceDepthWrite) {
                engine.setDepthWrite(true);
            }
        }
        var outparticles = 0;
        if (this.blendMode === ParticleSystem.BLENDMODE_MULTIPLYADD) {
            outparticles = this._render(ParticleSystem.BLENDMODE_MULTIPLY) + this._render(ParticleSystem.BLENDMODE_ADD);
        }
        else {
            outparticles = this._render(this.blendMode);
        }
        this._engine.unbindInstanceAttributes();
        this._engine.setAlphaMode(0);
        return outparticles;
    };
    /**
     * Disposes the particle system and free the associated resources
     * @param disposeTexture defines if the particle texture must be disposed as well (true by default)
     */
    ParticleSystem.prototype.dispose = function (disposeTexture) {
        if (disposeTexture === void 0) { disposeTexture = true; }
        this.resetDrawCache();
        if (this._vertexBuffer) {
            this._vertexBuffer.dispose();
            this._vertexBuffer = null;
        }
        if (this._spriteBuffer) {
            this._spriteBuffer.dispose();
            this._spriteBuffer = null;
        }
        if (this._indexBuffer) {
            this._engine._releaseBuffer(this._indexBuffer);
            this._indexBuffer = null;
        }
        if (this._vertexArrayObject) {
            this._engine.releaseVertexArrayObject(this._vertexArrayObject);
            this._vertexArrayObject = null;
        }
        if (disposeTexture && this.particleTexture) {
            this.particleTexture.dispose();
            this.particleTexture = null;
        }
        if (disposeTexture && this.noiseTexture) {
            this.noiseTexture.dispose();
            this.noiseTexture = null;
        }
        if (this._rampGradientsTexture) {
            this._rampGradientsTexture.dispose();
            this._rampGradientsTexture = null;
        }
        this._removeFromRoot();
        if (this.subEmitters && !this._subEmitters) {
            this._prepareSubEmitterInternalArray();
        }
        if (this._subEmitters && this._subEmitters.length) {
            for (var index = 0; index < this._subEmitters.length; index++) {
                for (var _i = 0, _a = this._subEmitters[index]; _i < _a.length; _i++) {
                    var subEmitter = _a[_i];
                    subEmitter.dispose();
                }
            }
            this._subEmitters = [];
            this.subEmitters = [];
        }
        if (this._disposeEmitterOnDispose && this.emitter && this.emitter.dispose) {
            this.emitter.dispose(true);
        }
        if (this._onBeforeDrawParticlesObservable) {
            this._onBeforeDrawParticlesObservable.clear();
        }
        // Remove from scene
        if (this._scene) {
            var index = this._scene.particleSystems.indexOf(this);
            if (index > -1) {
                this._scene.particleSystems.splice(index, 1);
            }
            this._scene._activeParticleSystems.dispose();
        }
        // Callback
        this.onDisposeObservable.notifyObservers(this);
        this.onDisposeObservable.clear();
        this.onStoppedObservable.clear();
        this.reset();
    };
    // Clone
    /**
     * Clones the particle system.
     * @param name The name of the cloned object
     * @param newEmitter The new emitter to use
     * @returns the cloned particle system
     */
    ParticleSystem.prototype.clone = function (name, newEmitter) {
        var custom = __assign({}, this._customWrappers);
        var program = null;
        var engine = this._engine;
        if (engine.createEffectForParticles) {
            if (this.customShader != null) {
                program = this.customShader;
                var defines = program.shaderOptions.defines.length > 0 ? program.shaderOptions.defines.join("\n") : "";
                var effect = engine.createEffectForParticles(program.shaderPath.fragmentElement, program.shaderOptions.uniforms, program.shaderOptions.samplers, defines);
                if (!custom[0]) {
                    this.setCustomEffect(effect, 0);
                }
                else {
                    custom[0].effect = effect;
                }
            }
        }
        var serialization = this.serialize();
        var result = ParticleSystem.Parse(serialization, this._scene || this._engine, this._rootUrl);
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
        if (!this.preventAutoStart) {
            result.start();
        }
        return result;
    };
    /**
     * Serializes the particle system to a JSON object
     * @param serializeTexture defines if the texture must be serialized as well
     * @returns the JSON object
     */
    ParticleSystem.prototype.serialize = function (serializeTexture) {
        if (serializeTexture === void 0) { serializeTexture = false; }
        var serializationObject = {};
        ParticleSystem._Serialize(serializationObject, this, serializeTexture);
        serializationObject.textureMask = this.textureMask.asArray();
        serializationObject.customShader = this.customShader;
        serializationObject.preventAutoStart = this.preventAutoStart;
        // SubEmitters
        if (this.subEmitters) {
            serializationObject.subEmitters = [];
            if (!this._subEmitters) {
                this._prepareSubEmitterInternalArray();
            }
            for (var _i = 0, _a = this._subEmitters; _i < _a.length; _i++) {
                var subs = _a[_i];
                var cell = [];
                for (var _b = 0, subs_1 = subs; _b < subs_1.length; _b++) {
                    var sub = subs_1[_b];
                    cell.push(sub.serialize(serializeTexture));
                }
                serializationObject.subEmitters.push(cell);
            }
        }
        return serializationObject;
    };
    /**
     * @param serializationObject
     * @param particleSystem
     * @param serializeTexture
     * @hidden
     */
    ParticleSystem._Serialize = function (serializationObject, particleSystem, serializeTexture) {
        serializationObject.name = particleSystem.name;
        serializationObject.id = particleSystem.id;
        serializationObject.capacity = particleSystem.getCapacity();
        serializationObject.disposeOnStop = particleSystem.disposeOnStop;
        serializationObject.manualEmitCount = particleSystem.manualEmitCount;
        // Emitter
        if (particleSystem.emitter.position) {
            var emitterMesh = particleSystem.emitter;
            serializationObject.emitterId = emitterMesh.id;
        }
        else {
            var emitterPosition = particleSystem.emitter;
            serializationObject.emitter = emitterPosition.asArray();
        }
        // Emitter
        if (particleSystem.particleEmitterType) {
            serializationObject.particleEmitterType = particleSystem.particleEmitterType.serialize();
        }
        if (particleSystem.particleTexture) {
            if (serializeTexture) {
                serializationObject.texture = particleSystem.particleTexture.serialize();
            }
            else {
                serializationObject.textureName = particleSystem.particleTexture.name;
                serializationObject.invertY = !!particleSystem.particleTexture._invertY;
            }
        }
        serializationObject.isLocal = particleSystem.isLocal;
        // Animations
        SerializationHelper.AppendSerializedAnimations(particleSystem, serializationObject);
        serializationObject.beginAnimationOnStart = particleSystem.beginAnimationOnStart;
        serializationObject.beginAnimationFrom = particleSystem.beginAnimationFrom;
        serializationObject.beginAnimationTo = particleSystem.beginAnimationTo;
        serializationObject.beginAnimationLoop = particleSystem.beginAnimationLoop;
        // Particle system
        serializationObject.startDelay = particleSystem.startDelay;
        serializationObject.renderingGroupId = particleSystem.renderingGroupId;
        serializationObject.isBillboardBased = particleSystem.isBillboardBased;
        serializationObject.billboardMode = particleSystem.billboardMode;
        serializationObject.minAngularSpeed = particleSystem.minAngularSpeed;
        serializationObject.maxAngularSpeed = particleSystem.maxAngularSpeed;
        serializationObject.minSize = particleSystem.minSize;
        serializationObject.maxSize = particleSystem.maxSize;
        serializationObject.minScaleX = particleSystem.minScaleX;
        serializationObject.maxScaleX = particleSystem.maxScaleX;
        serializationObject.minScaleY = particleSystem.minScaleY;
        serializationObject.maxScaleY = particleSystem.maxScaleY;
        serializationObject.minEmitPower = particleSystem.minEmitPower;
        serializationObject.maxEmitPower = particleSystem.maxEmitPower;
        serializationObject.minLifeTime = particleSystem.minLifeTime;
        serializationObject.maxLifeTime = particleSystem.maxLifeTime;
        serializationObject.emitRate = particleSystem.emitRate;
        serializationObject.gravity = particleSystem.gravity.asArray();
        serializationObject.noiseStrength = particleSystem.noiseStrength.asArray();
        serializationObject.color1 = particleSystem.color1.asArray();
        serializationObject.color2 = particleSystem.color2.asArray();
        serializationObject.colorDead = particleSystem.colorDead.asArray();
        serializationObject.updateSpeed = particleSystem.updateSpeed;
        serializationObject.targetStopDuration = particleSystem.targetStopDuration;
        serializationObject.blendMode = particleSystem.blendMode;
        serializationObject.preWarmCycles = particleSystem.preWarmCycles;
        serializationObject.preWarmStepOffset = particleSystem.preWarmStepOffset;
        serializationObject.minInitialRotation = particleSystem.minInitialRotation;
        serializationObject.maxInitialRotation = particleSystem.maxInitialRotation;
        serializationObject.startSpriteCellID = particleSystem.startSpriteCellID;
        serializationObject.spriteCellLoop = particleSystem.spriteCellLoop;
        serializationObject.endSpriteCellID = particleSystem.endSpriteCellID;
        serializationObject.spriteCellChangeSpeed = particleSystem.spriteCellChangeSpeed;
        serializationObject.spriteCellWidth = particleSystem.spriteCellWidth;
        serializationObject.spriteCellHeight = particleSystem.spriteCellHeight;
        serializationObject.spriteRandomStartCell = particleSystem.spriteRandomStartCell;
        serializationObject.isAnimationSheetEnabled = particleSystem.isAnimationSheetEnabled;
        var colorGradients = particleSystem.getColorGradients();
        if (colorGradients) {
            serializationObject.colorGradients = [];
            for (var _i = 0, colorGradients_1 = colorGradients; _i < colorGradients_1.length; _i++) {
                var colorGradient = colorGradients_1[_i];
                var serializedGradient = {
                    gradient: colorGradient.gradient,
                    color1: colorGradient.color1.asArray(),
                };
                if (colorGradient.color2) {
                    serializedGradient.color2 = colorGradient.color2.asArray();
                }
                else {
                    serializedGradient.color2 = colorGradient.color1.asArray();
                }
                serializationObject.colorGradients.push(serializedGradient);
            }
        }
        var rampGradients = particleSystem.getRampGradients();
        if (rampGradients) {
            serializationObject.rampGradients = [];
            for (var _a = 0, rampGradients_1 = rampGradients; _a < rampGradients_1.length; _a++) {
                var rampGradient = rampGradients_1[_a];
                var serializedGradient = {
                    gradient: rampGradient.gradient,
                    color: rampGradient.color.asArray(),
                };
                serializationObject.rampGradients.push(serializedGradient);
            }
            serializationObject.useRampGradients = particleSystem.useRampGradients;
        }
        var colorRemapGradients = particleSystem.getColorRemapGradients();
        if (colorRemapGradients) {
            serializationObject.colorRemapGradients = [];
            for (var _b = 0, colorRemapGradients_1 = colorRemapGradients; _b < colorRemapGradients_1.length; _b++) {
                var colorRemapGradient = colorRemapGradients_1[_b];
                var serializedGradient = {
                    gradient: colorRemapGradient.gradient,
                    factor1: colorRemapGradient.factor1,
                };
                if (colorRemapGradient.factor2 !== undefined) {
                    serializedGradient.factor2 = colorRemapGradient.factor2;
                }
                else {
                    serializedGradient.factor2 = colorRemapGradient.factor1;
                }
                serializationObject.colorRemapGradients.push(serializedGradient);
            }
        }
        var alphaRemapGradients = particleSystem.getAlphaRemapGradients();
        if (alphaRemapGradients) {
            serializationObject.alphaRemapGradients = [];
            for (var _c = 0, alphaRemapGradients_1 = alphaRemapGradients; _c < alphaRemapGradients_1.length; _c++) {
                var alphaRemapGradient = alphaRemapGradients_1[_c];
                var serializedGradient = {
                    gradient: alphaRemapGradient.gradient,
                    factor1: alphaRemapGradient.factor1,
                };
                if (alphaRemapGradient.factor2 !== undefined) {
                    serializedGradient.factor2 = alphaRemapGradient.factor2;
                }
                else {
                    serializedGradient.factor2 = alphaRemapGradient.factor1;
                }
                serializationObject.alphaRemapGradients.push(serializedGradient);
            }
        }
        var sizeGradients = particleSystem.getSizeGradients();
        if (sizeGradients) {
            serializationObject.sizeGradients = [];
            for (var _d = 0, sizeGradients_1 = sizeGradients; _d < sizeGradients_1.length; _d++) {
                var sizeGradient = sizeGradients_1[_d];
                var serializedGradient = {
                    gradient: sizeGradient.gradient,
                    factor1: sizeGradient.factor1,
                };
                if (sizeGradient.factor2 !== undefined) {
                    serializedGradient.factor2 = sizeGradient.factor2;
                }
                else {
                    serializedGradient.factor2 = sizeGradient.factor1;
                }
                serializationObject.sizeGradients.push(serializedGradient);
            }
        }
        var angularSpeedGradients = particleSystem.getAngularSpeedGradients();
        if (angularSpeedGradients) {
            serializationObject.angularSpeedGradients = [];
            for (var _e = 0, angularSpeedGradients_1 = angularSpeedGradients; _e < angularSpeedGradients_1.length; _e++) {
                var angularSpeedGradient = angularSpeedGradients_1[_e];
                var serializedGradient = {
                    gradient: angularSpeedGradient.gradient,
                    factor1: angularSpeedGradient.factor1,
                };
                if (angularSpeedGradient.factor2 !== undefined) {
                    serializedGradient.factor2 = angularSpeedGradient.factor2;
                }
                else {
                    serializedGradient.factor2 = angularSpeedGradient.factor1;
                }
                serializationObject.angularSpeedGradients.push(serializedGradient);
            }
        }
        var velocityGradients = particleSystem.getVelocityGradients();
        if (velocityGradients) {
            serializationObject.velocityGradients = [];
            for (var _f = 0, velocityGradients_1 = velocityGradients; _f < velocityGradients_1.length; _f++) {
                var velocityGradient = velocityGradients_1[_f];
                var serializedGradient = {
                    gradient: velocityGradient.gradient,
                    factor1: velocityGradient.factor1,
                };
                if (velocityGradient.factor2 !== undefined) {
                    serializedGradient.factor2 = velocityGradient.factor2;
                }
                else {
                    serializedGradient.factor2 = velocityGradient.factor1;
                }
                serializationObject.velocityGradients.push(serializedGradient);
            }
        }
        var dragGradients = particleSystem.getDragGradients();
        if (dragGradients) {
            serializationObject.dragGradients = [];
            for (var _g = 0, dragGradients_1 = dragGradients; _g < dragGradients_1.length; _g++) {
                var dragGradient = dragGradients_1[_g];
                var serializedGradient = {
                    gradient: dragGradient.gradient,
                    factor1: dragGradient.factor1,
                };
                if (dragGradient.factor2 !== undefined) {
                    serializedGradient.factor2 = dragGradient.factor2;
                }
                else {
                    serializedGradient.factor2 = dragGradient.factor1;
                }
                serializationObject.dragGradients.push(serializedGradient);
            }
        }
        var emitRateGradients = particleSystem.getEmitRateGradients();
        if (emitRateGradients) {
            serializationObject.emitRateGradients = [];
            for (var _h = 0, emitRateGradients_1 = emitRateGradients; _h < emitRateGradients_1.length; _h++) {
                var emitRateGradient = emitRateGradients_1[_h];
                var serializedGradient = {
                    gradient: emitRateGradient.gradient,
                    factor1: emitRateGradient.factor1,
                };
                if (emitRateGradient.factor2 !== undefined) {
                    serializedGradient.factor2 = emitRateGradient.factor2;
                }
                else {
                    serializedGradient.factor2 = emitRateGradient.factor1;
                }
                serializationObject.emitRateGradients.push(serializedGradient);
            }
        }
        var startSizeGradients = particleSystem.getStartSizeGradients();
        if (startSizeGradients) {
            serializationObject.startSizeGradients = [];
            for (var _j = 0, startSizeGradients_1 = startSizeGradients; _j < startSizeGradients_1.length; _j++) {
                var startSizeGradient = startSizeGradients_1[_j];
                var serializedGradient = {
                    gradient: startSizeGradient.gradient,
                    factor1: startSizeGradient.factor1,
                };
                if (startSizeGradient.factor2 !== undefined) {
                    serializedGradient.factor2 = startSizeGradient.factor2;
                }
                else {
                    serializedGradient.factor2 = startSizeGradient.factor1;
                }
                serializationObject.startSizeGradients.push(serializedGradient);
            }
        }
        var lifeTimeGradients = particleSystem.getLifeTimeGradients();
        if (lifeTimeGradients) {
            serializationObject.lifeTimeGradients = [];
            for (var _k = 0, lifeTimeGradients_1 = lifeTimeGradients; _k < lifeTimeGradients_1.length; _k++) {
                var lifeTimeGradient = lifeTimeGradients_1[_k];
                var serializedGradient = {
                    gradient: lifeTimeGradient.gradient,
                    factor1: lifeTimeGradient.factor1,
                };
                if (lifeTimeGradient.factor2 !== undefined) {
                    serializedGradient.factor2 = lifeTimeGradient.factor2;
                }
                else {
                    serializedGradient.factor2 = lifeTimeGradient.factor1;
                }
                serializationObject.lifeTimeGradients.push(serializedGradient);
            }
        }
        var limitVelocityGradients = particleSystem.getLimitVelocityGradients();
        if (limitVelocityGradients) {
            serializationObject.limitVelocityGradients = [];
            for (var _l = 0, limitVelocityGradients_1 = limitVelocityGradients; _l < limitVelocityGradients_1.length; _l++) {
                var limitVelocityGradient = limitVelocityGradients_1[_l];
                var serializedGradient = {
                    gradient: limitVelocityGradient.gradient,
                    factor1: limitVelocityGradient.factor1,
                };
                if (limitVelocityGradient.factor2 !== undefined) {
                    serializedGradient.factor2 = limitVelocityGradient.factor2;
                }
                else {
                    serializedGradient.factor2 = limitVelocityGradient.factor1;
                }
                serializationObject.limitVelocityGradients.push(serializedGradient);
            }
            serializationObject.limitVelocityDamping = particleSystem.limitVelocityDamping;
        }
        if (particleSystem.noiseTexture) {
            serializationObject.noiseTexture = particleSystem.noiseTexture.serialize();
        }
    };
    /**
     * @param parsedParticleSystem
     * @param particleSystem
     * @param sceneOrEngine
     * @param rootUrl
     * @hidden
     */
    ParticleSystem._Parse = function (parsedParticleSystem, particleSystem, sceneOrEngine, rootUrl) {
        var _a, _b, _c;
        var scene;
        if (sceneOrEngine instanceof ThinEngine) {
            scene = null;
        }
        else {
            scene = sceneOrEngine;
        }
        var internalClass = GetClass("BABYLON.Texture");
        if (internalClass && scene) {
            // Texture
            if (parsedParticleSystem.texture) {
                particleSystem.particleTexture = internalClass.Parse(parsedParticleSystem.texture, scene, rootUrl);
            }
            else if (parsedParticleSystem.textureName) {
                particleSystem.particleTexture = new internalClass(rootUrl + parsedParticleSystem.textureName, scene, false, parsedParticleSystem.invertY !== undefined ? parsedParticleSystem.invertY : true);
                particleSystem.particleTexture.name = parsedParticleSystem.textureName;
            }
        }
        // Emitter
        if (!parsedParticleSystem.emitterId && parsedParticleSystem.emitterId !== 0 && parsedParticleSystem.emitter === undefined) {
            particleSystem.emitter = Vector3.Zero();
        }
        else if (parsedParticleSystem.emitterId && scene) {
            particleSystem.emitter = scene.getLastMeshById(parsedParticleSystem.emitterId);
        }
        else {
            particleSystem.emitter = Vector3.FromArray(parsedParticleSystem.emitter);
        }
        particleSystem.isLocal = !!parsedParticleSystem.isLocal;
        // Misc.
        if (parsedParticleSystem.renderingGroupId !== undefined) {
            particleSystem.renderingGroupId = parsedParticleSystem.renderingGroupId;
        }
        if (parsedParticleSystem.isBillboardBased !== undefined) {
            particleSystem.isBillboardBased = parsedParticleSystem.isBillboardBased;
        }
        if (parsedParticleSystem.billboardMode !== undefined) {
            particleSystem.billboardMode = parsedParticleSystem.billboardMode;
        }
        // Animations
        if (parsedParticleSystem.animations) {
            for (var animationIndex = 0; animationIndex < parsedParticleSystem.animations.length; animationIndex++) {
                var parsedAnimation = parsedParticleSystem.animations[animationIndex];
                var internalClass_1 = GetClass("BABYLON.Animation");
                if (internalClass_1) {
                    particleSystem.animations.push(internalClass_1.Parse(parsedAnimation));
                }
            }
            particleSystem.beginAnimationOnStart = parsedParticleSystem.beginAnimationOnStart;
            particleSystem.beginAnimationFrom = parsedParticleSystem.beginAnimationFrom;
            particleSystem.beginAnimationTo = parsedParticleSystem.beginAnimationTo;
            particleSystem.beginAnimationLoop = parsedParticleSystem.beginAnimationLoop;
        }
        if (parsedParticleSystem.autoAnimate && scene) {
            scene.beginAnimation(particleSystem, parsedParticleSystem.autoAnimateFrom, parsedParticleSystem.autoAnimateTo, parsedParticleSystem.autoAnimateLoop, parsedParticleSystem.autoAnimateSpeed || 1.0);
        }
        // Particle system
        particleSystem.startDelay = parsedParticleSystem.startDelay | 0;
        particleSystem.minAngularSpeed = parsedParticleSystem.minAngularSpeed;
        particleSystem.maxAngularSpeed = parsedParticleSystem.maxAngularSpeed;
        particleSystem.minSize = parsedParticleSystem.minSize;
        particleSystem.maxSize = parsedParticleSystem.maxSize;
        if (parsedParticleSystem.minScaleX) {
            particleSystem.minScaleX = parsedParticleSystem.minScaleX;
            particleSystem.maxScaleX = parsedParticleSystem.maxScaleX;
            particleSystem.minScaleY = parsedParticleSystem.minScaleY;
            particleSystem.maxScaleY = parsedParticleSystem.maxScaleY;
        }
        if (parsedParticleSystem.preWarmCycles !== undefined) {
            particleSystem.preWarmCycles = parsedParticleSystem.preWarmCycles;
            particleSystem.preWarmStepOffset = parsedParticleSystem.preWarmStepOffset;
        }
        if (parsedParticleSystem.minInitialRotation !== undefined) {
            particleSystem.minInitialRotation = parsedParticleSystem.minInitialRotation;
            particleSystem.maxInitialRotation = parsedParticleSystem.maxInitialRotation;
        }
        particleSystem.minLifeTime = parsedParticleSystem.minLifeTime;
        particleSystem.maxLifeTime = parsedParticleSystem.maxLifeTime;
        particleSystem.minEmitPower = parsedParticleSystem.minEmitPower;
        particleSystem.maxEmitPower = parsedParticleSystem.maxEmitPower;
        particleSystem.emitRate = parsedParticleSystem.emitRate;
        particleSystem.gravity = Vector3.FromArray(parsedParticleSystem.gravity);
        if (parsedParticleSystem.noiseStrength) {
            particleSystem.noiseStrength = Vector3.FromArray(parsedParticleSystem.noiseStrength);
        }
        particleSystem.color1 = Color4.FromArray(parsedParticleSystem.color1);
        particleSystem.color2 = Color4.FromArray(parsedParticleSystem.color2);
        particleSystem.colorDead = Color4.FromArray(parsedParticleSystem.colorDead);
        particleSystem.updateSpeed = parsedParticleSystem.updateSpeed;
        particleSystem.targetStopDuration = parsedParticleSystem.targetStopDuration;
        particleSystem.blendMode = parsedParticleSystem.blendMode;
        if (parsedParticleSystem.colorGradients) {
            for (var _i = 0, _d = parsedParticleSystem.colorGradients; _i < _d.length; _i++) {
                var colorGradient = _d[_i];
                particleSystem.addColorGradient(colorGradient.gradient, Color4.FromArray(colorGradient.color1), colorGradient.color2 ? Color4.FromArray(colorGradient.color2) : undefined);
            }
        }
        if (parsedParticleSystem.rampGradients) {
            for (var _e = 0, _f = parsedParticleSystem.rampGradients; _e < _f.length; _e++) {
                var rampGradient = _f[_e];
                particleSystem.addRampGradient(rampGradient.gradient, Color3.FromArray(rampGradient.color));
            }
            particleSystem.useRampGradients = parsedParticleSystem.useRampGradients;
        }
        if (parsedParticleSystem.colorRemapGradients) {
            for (var _g = 0, _h = parsedParticleSystem.colorRemapGradients; _g < _h.length; _g++) {
                var colorRemapGradient = _h[_g];
                particleSystem.addColorRemapGradient(colorRemapGradient.gradient, colorRemapGradient.factor1 !== undefined ? colorRemapGradient.factor1 : colorRemapGradient.factor, colorRemapGradient.factor2);
            }
        }
        if (parsedParticleSystem.alphaRemapGradients) {
            for (var _j = 0, _k = parsedParticleSystem.alphaRemapGradients; _j < _k.length; _j++) {
                var alphaRemapGradient = _k[_j];
                particleSystem.addAlphaRemapGradient(alphaRemapGradient.gradient, alphaRemapGradient.factor1 !== undefined ? alphaRemapGradient.factor1 : alphaRemapGradient.factor, alphaRemapGradient.factor2);
            }
        }
        if (parsedParticleSystem.sizeGradients) {
            for (var _l = 0, _m = parsedParticleSystem.sizeGradients; _l < _m.length; _l++) {
                var sizeGradient = _m[_l];
                particleSystem.addSizeGradient(sizeGradient.gradient, sizeGradient.factor1 !== undefined ? sizeGradient.factor1 : sizeGradient.factor, sizeGradient.factor2);
            }
        }
        if (parsedParticleSystem.angularSpeedGradients) {
            for (var _o = 0, _p = parsedParticleSystem.angularSpeedGradients; _o < _p.length; _o++) {
                var angularSpeedGradient = _p[_o];
                particleSystem.addAngularSpeedGradient(angularSpeedGradient.gradient, angularSpeedGradient.factor1 !== undefined ? angularSpeedGradient.factor1 : angularSpeedGradient.factor, angularSpeedGradient.factor2);
            }
        }
        if (parsedParticleSystem.velocityGradients) {
            for (var _q = 0, _r = parsedParticleSystem.velocityGradients; _q < _r.length; _q++) {
                var velocityGradient = _r[_q];
                particleSystem.addVelocityGradient(velocityGradient.gradient, velocityGradient.factor1 !== undefined ? velocityGradient.factor1 : velocityGradient.factor, velocityGradient.factor2);
            }
        }
        if (parsedParticleSystem.dragGradients) {
            for (var _s = 0, _t = parsedParticleSystem.dragGradients; _s < _t.length; _s++) {
                var dragGradient = _t[_s];
                particleSystem.addDragGradient(dragGradient.gradient, dragGradient.factor1 !== undefined ? dragGradient.factor1 : dragGradient.factor, dragGradient.factor2);
            }
        }
        if (parsedParticleSystem.emitRateGradients) {
            for (var _u = 0, _v = parsedParticleSystem.emitRateGradients; _u < _v.length; _u++) {
                var emitRateGradient = _v[_u];
                particleSystem.addEmitRateGradient(emitRateGradient.gradient, emitRateGradient.factor1 !== undefined ? emitRateGradient.factor1 : emitRateGradient.factor, emitRateGradient.factor2);
            }
        }
        if (parsedParticleSystem.startSizeGradients) {
            for (var _w = 0, _x = parsedParticleSystem.startSizeGradients; _w < _x.length; _w++) {
                var startSizeGradient = _x[_w];
                particleSystem.addStartSizeGradient(startSizeGradient.gradient, startSizeGradient.factor1 !== undefined ? startSizeGradient.factor1 : startSizeGradient.factor, startSizeGradient.factor2);
            }
        }
        if (parsedParticleSystem.lifeTimeGradients) {
            for (var _y = 0, _z = parsedParticleSystem.lifeTimeGradients; _y < _z.length; _y++) {
                var lifeTimeGradient = _z[_y];
                particleSystem.addLifeTimeGradient(lifeTimeGradient.gradient, lifeTimeGradient.factor1 !== undefined ? lifeTimeGradient.factor1 : lifeTimeGradient.factor, lifeTimeGradient.factor2);
            }
        }
        if (parsedParticleSystem.limitVelocityGradients) {
            for (var _0 = 0, _1 = parsedParticleSystem.limitVelocityGradients; _0 < _1.length; _0++) {
                var limitVelocityGradient = _1[_0];
                particleSystem.addLimitVelocityGradient(limitVelocityGradient.gradient, limitVelocityGradient.factor1 !== undefined ? limitVelocityGradient.factor1 : limitVelocityGradient.factor, limitVelocityGradient.factor2);
            }
            particleSystem.limitVelocityDamping = parsedParticleSystem.limitVelocityDamping;
        }
        if (parsedParticleSystem.noiseTexture && scene) {
            var internalClass_2 = GetClass("BABYLON.ProceduralTexture");
            particleSystem.noiseTexture = internalClass_2.Parse(parsedParticleSystem.noiseTexture, scene, rootUrl);
        }
        // Emitter
        var emitterType;
        if (parsedParticleSystem.particleEmitterType) {
            switch (parsedParticleSystem.particleEmitterType.type) {
                case "SphereParticleEmitter":
                    emitterType = new SphereParticleEmitter();
                    break;
                case "SphereDirectedParticleEmitter":
                    emitterType = new SphereDirectedParticleEmitter();
                    break;
                case "ConeEmitter":
                case "ConeParticleEmitter":
                    emitterType = new ConeParticleEmitter();
                    break;
                case "CylinderParticleEmitter":
                    emitterType = new CylinderParticleEmitter();
                    break;
                case "CylinderDirectedParticleEmitter":
                    emitterType = new CylinderDirectedParticleEmitter();
                    break;
                case "HemisphericParticleEmitter":
                    emitterType = new HemisphericParticleEmitter();
                    break;
                case "PointParticleEmitter":
                    emitterType = new PointParticleEmitter();
                    break;
                case "MeshParticleEmitter":
                    emitterType = new MeshParticleEmitter();
                    break;
                case "BoxEmitter":
                case "BoxParticleEmitter":
                default:
                    emitterType = new BoxParticleEmitter();
                    break;
            }
            emitterType.parse(parsedParticleSystem.particleEmitterType, scene);
        }
        else {
            emitterType = new BoxParticleEmitter();
            emitterType.parse(parsedParticleSystem, scene);
        }
        particleSystem.particleEmitterType = emitterType;
        // Animation sheet
        particleSystem.startSpriteCellID = parsedParticleSystem.startSpriteCellID;
        particleSystem.endSpriteCellID = parsedParticleSystem.endSpriteCellID;
        particleSystem.spriteCellLoop = (_a = parsedParticleSystem.spriteCellLoop) !== null && _a !== void 0 ? _a : true;
        particleSystem.spriteCellWidth = parsedParticleSystem.spriteCellWidth;
        particleSystem.spriteCellHeight = parsedParticleSystem.spriteCellHeight;
        particleSystem.spriteCellChangeSpeed = parsedParticleSystem.spriteCellChangeSpeed;
        particleSystem.spriteRandomStartCell = parsedParticleSystem.spriteRandomStartCell;
        particleSystem.disposeOnStop = (_b = parsedParticleSystem.disposeOnStop) !== null && _b !== void 0 ? _b : false;
        particleSystem.manualEmitCount = (_c = parsedParticleSystem.manualEmitCount) !== null && _c !== void 0 ? _c : -1;
    };
    /**
     * Parses a JSON object to create a particle system.
     * @param parsedParticleSystem The JSON object to parse
     * @param sceneOrEngine The scene or the engine to create the particle system in
     * @param rootUrl The root url to use to load external dependencies like texture
     * @param doNotStart Ignore the preventAutoStart attribute and does not start
     * @param capacity defines the system capacity (if null or undefined the sotred capacity will be used)
     * @returns the Parsed particle system
     */
    ParticleSystem.Parse = function (parsedParticleSystem, sceneOrEngine, rootUrl, doNotStart, capacity) {
        if (doNotStart === void 0) { doNotStart = false; }
        var name = parsedParticleSystem.name;
        var custom = null;
        var program = null;
        var engine;
        var scene;
        if (sceneOrEngine instanceof ThinEngine) {
            engine = sceneOrEngine;
        }
        else {
            scene = sceneOrEngine;
            engine = scene.getEngine();
        }
        if (parsedParticleSystem.customShader && engine.createEffectForParticles) {
            program = parsedParticleSystem.customShader;
            var defines = program.shaderOptions.defines.length > 0 ? program.shaderOptions.defines.join("\n") : "";
            custom = engine.createEffectForParticles(program.shaderPath.fragmentElement, program.shaderOptions.uniforms, program.shaderOptions.samplers, defines);
        }
        var particleSystem = new ParticleSystem(name, capacity || parsedParticleSystem.capacity, sceneOrEngine, custom, parsedParticleSystem.isAnimationSheetEnabled);
        particleSystem.customShader = program;
        particleSystem._rootUrl = rootUrl;
        if (parsedParticleSystem.id) {
            particleSystem.id = parsedParticleSystem.id;
        }
        // SubEmitters
        if (parsedParticleSystem.subEmitters) {
            particleSystem.subEmitters = [];
            for (var _i = 0, _a = parsedParticleSystem.subEmitters; _i < _a.length; _i++) {
                var cell = _a[_i];
                var cellArray = [];
                for (var _b = 0, cell_1 = cell; _b < cell_1.length; _b++) {
                    var sub = cell_1[_b];
                    cellArray.push(SubEmitter.Parse(sub, sceneOrEngine, rootUrl));
                }
                particleSystem.subEmitters.push(cellArray);
            }
        }
        ParticleSystem._Parse(parsedParticleSystem, particleSystem, sceneOrEngine, rootUrl);
        if (parsedParticleSystem.textureMask) {
            particleSystem.textureMask = Color4.FromArray(parsedParticleSystem.textureMask);
        }
        // Auto start
        if (parsedParticleSystem.preventAutoStart) {
            particleSystem.preventAutoStart = parsedParticleSystem.preventAutoStart;
        }
        if (!doNotStart && !particleSystem.preventAutoStart) {
            particleSystem.start();
        }
        return particleSystem;
    };
    /**
     * Billboard mode will only apply to Y axis
     */
    ParticleSystem.BILLBOARDMODE_Y = 2;
    /**
     * Billboard mode will apply to all axes
     */
    ParticleSystem.BILLBOARDMODE_ALL = 7;
    /**
     * Special billboard mode where the particle will be biilboard to the camera but rotated to align with direction
     */
    ParticleSystem.BILLBOARDMODE_STRETCHED = 8;
    return ParticleSystem;
}(BaseParticleSystem));
export { ParticleSystem };
SubEmitter._ParseParticleSystem = ParticleSystem.Parse;
//# sourceMappingURL=particleSystem.js.map