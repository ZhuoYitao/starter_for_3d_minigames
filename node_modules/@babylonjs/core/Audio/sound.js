import { Tools } from "../Misc/tools.js";
import { Observable } from "../Misc/observable.js";
import { Vector3 } from "../Maths/math.vector.js";
import { Engine } from "../Engines/engine.js";
import { Logger } from "../Misc/logger.js";
import { _WarnImport } from "../Misc/devTools.js";
import { EngineStore } from "../Engines/engineStore.js";
/**
 * Defines a sound that can be played in the application.
 * The sound can either be an ambient track or a simple sound played in reaction to a user action.
 * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music
 */
var Sound = /** @class */ (function () {
    /**
     * Create a sound and attach it to a scene
     * @param name Name of your sound
     * @param urlOrArrayBuffer Url to the sound to load async or ArrayBuffer, it also works with MediaStreams
     * @param scene defines the scene the sound belongs to
     * @param readyToPlayCallback Provide a callback function if you'd like to load your code once the sound is ready to be played
     * @param options Objects to provide with the current available options: autoplay, loop, volume, spatialSound, maxDistance, rolloffFactor, refDistance, distanceModel, panningModel, streaming
     */
    function Sound(name, urlOrArrayBuffer, scene, readyToPlayCallback, options) {
        if (readyToPlayCallback === void 0) { readyToPlayCallback = null; }
        var _this = this;
        var _a, _b, _c, _d, _e;
        /**
         * Does the sound autoplay once loaded.
         */
        this.autoplay = false;
        this._loop = false;
        /**
         * Does the sound use a custom attenuation curve to simulate the falloff
         * happening when the source gets further away from the camera.
         * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-your-own-custom-attenuation-function
         */
        this.useCustomAttenuation = false;
        /**
         * Is this sound currently played.
         */
        this.isPlaying = false;
        /**
         * Is this sound currently paused.
         */
        this.isPaused = false;
        /**
         * Define the reference distance the sound should be heard perfectly.
         * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-a-spatial-3d-sound
         */
        this.refDistance = 1;
        /**
         * Define the roll off factor of spatial sounds.
         * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-a-spatial-3d-sound
         */
        this.rolloffFactor = 1;
        /**
         * Define the max distance the sound should be heard (intensity just became 0 at this point).
         * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-a-spatial-3d-sound
         */
        this.maxDistance = 100;
        /**
         * Define the distance attenuation model the sound will follow.
         * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-a-spatial-3d-sound
         */
        this.distanceModel = "linear";
        /**
         * Gets or sets an object used to store user defined information for the sound.
         */
        this.metadata = null;
        /**
         * Observable event when the current playing sound finishes.
         */
        this.onEndedObservable = new Observable();
        this._spatialSound = false;
        this._panningModel = "equalpower";
        this._playbackRate = 1;
        this._streaming = false;
        this._startTime = 0;
        this._startOffset = 0;
        this._position = Vector3.Zero();
        this._localDirection = new Vector3(1, 0, 0);
        this._volume = 1;
        this._isReadyToPlay = false;
        this._isDirectional = false;
        // Used if you'd like to create a directional sound.
        // If not set, the sound will be omnidirectional
        this._coneInnerAngle = 360;
        this._coneOuterAngle = 360;
        this._coneOuterGain = 0;
        this._isOutputConnected = false;
        this._urlType = "Unknown";
        this.name = name;
        scene = scene || EngineStore.LastCreatedScene;
        if (!scene) {
            return;
        }
        this._scene = scene;
        Sound._SceneComponentInitialization(scene);
        this._readyToPlayCallback = readyToPlayCallback;
        // Default custom attenuation function is a linear attenuation
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this._customAttenuationFunction = function (currentVolume, currentDistance, maxDistance, refDistance, rolloffFactor) {
            if (currentDistance < maxDistance) {
                return currentVolume * (1 - currentDistance / maxDistance);
            }
            else {
                return 0;
            }
        };
        if (options) {
            this.autoplay = options.autoplay || false;
            this._loop = options.loop || false;
            // if volume === 0, we need another way to check this option
            if (options.volume !== undefined) {
                this._volume = options.volume;
            }
            this._spatialSound = (_a = options.spatialSound) !== null && _a !== void 0 ? _a : false;
            this.maxDistance = (_b = options.maxDistance) !== null && _b !== void 0 ? _b : 100;
            this.useCustomAttenuation = (_c = options.useCustomAttenuation) !== null && _c !== void 0 ? _c : false;
            this.rolloffFactor = options.rolloffFactor || 1;
            this.refDistance = options.refDistance || 1;
            this.distanceModel = options.distanceModel || "linear";
            this._playbackRate = options.playbackRate || 1;
            this._streaming = (_d = options.streaming) !== null && _d !== void 0 ? _d : false;
            this._length = options.length;
            this._offset = options.offset;
        }
        if (((_e = Engine.audioEngine) === null || _e === void 0 ? void 0 : _e.canUseWebAudio) && Engine.audioEngine.audioContext) {
            this._soundGain = Engine.audioEngine.audioContext.createGain();
            this._soundGain.gain.value = this._volume;
            this._inputAudioNode = this._soundGain;
            this._outputAudioNode = this._soundGain;
            if (this._spatialSound) {
                this._createSpatialParameters();
            }
            this._scene.mainSoundTrack.addSound(this);
            var validParameter = true;
            // if no parameter is passed, you need to call setAudioBuffer yourself to prepare the sound
            if (urlOrArrayBuffer) {
                try {
                    if (typeof urlOrArrayBuffer === "string") {
                        this._urlType = "String";
                    }
                    else if (urlOrArrayBuffer instanceof ArrayBuffer) {
                        this._urlType = "ArrayBuffer";
                    }
                    else if (urlOrArrayBuffer instanceof HTMLMediaElement) {
                        this._urlType = "MediaElement";
                    }
                    else if (urlOrArrayBuffer instanceof MediaStream) {
                        this._urlType = "MediaStream";
                    }
                    else if (Array.isArray(urlOrArrayBuffer)) {
                        this._urlType = "Array";
                    }
                    var urls = [];
                    var codecSupportedFound = false;
                    switch (this._urlType) {
                        case "MediaElement":
                            this._streaming = true;
                            this._isReadyToPlay = true;
                            this._streamingSource = Engine.audioEngine.audioContext.createMediaElementSource(urlOrArrayBuffer);
                            if (this.autoplay) {
                                this.play(0, this._offset, this._length);
                            }
                            if (this._readyToPlayCallback) {
                                this._readyToPlayCallback();
                            }
                            break;
                        case "MediaStream":
                            this._streaming = true;
                            this._isReadyToPlay = true;
                            this._streamingSource = Engine.audioEngine.audioContext.createMediaStreamSource(urlOrArrayBuffer);
                            if (this.autoplay) {
                                this.play(0, this._offset, this._length);
                            }
                            if (this._readyToPlayCallback) {
                                this._readyToPlayCallback();
                            }
                            break;
                        case "ArrayBuffer":
                            if (urlOrArrayBuffer.byteLength > 0) {
                                codecSupportedFound = true;
                                this._soundLoaded(urlOrArrayBuffer);
                            }
                            break;
                        case "String":
                            urls.push(urlOrArrayBuffer);
                        // eslint-disable-next-line no-fallthrough
                        case "Array":
                            if (urls.length === 0) {
                                urls = urlOrArrayBuffer;
                            }
                            var _loop_1 = function (i) {
                                var url = urls[i];
                                codecSupportedFound =
                                    (options && options.skipCodecCheck) ||
                                        (url.indexOf(".mp3", url.length - 4) !== -1 && Engine.audioEngine.isMP3supported) ||
                                        (url.indexOf(".ogg", url.length - 4) !== -1 && Engine.audioEngine.isOGGsupported) ||
                                        url.indexOf(".wav", url.length - 4) !== -1 ||
                                        url.indexOf(".m4a", url.length - 4) !== -1 ||
                                        url.indexOf(".mp4", url.length - 4) !== -1 ||
                                        url.indexOf("blob:") !== -1;
                                if (codecSupportedFound) {
                                    // Loading sound
                                    if (!this_1._streaming) {
                                        this_1._scene._loadFile(url, function (data) {
                                            _this._soundLoaded(data);
                                        }, undefined, true, true, function (exception) {
                                            if (exception) {
                                                Logger.Error("XHR " + exception.status + " error on: " + url + ".");
                                            }
                                            Logger.Error("Sound creation aborted.");
                                            _this._scene.mainSoundTrack.removeSound(_this);
                                        });
                                    }
                                    // Streaming sound using HTML5 Audio tag
                                    else {
                                        this_1._htmlAudioElement = new Audio(url);
                                        this_1._htmlAudioElement.controls = false;
                                        this_1._htmlAudioElement.loop = this_1.loop;
                                        Tools.SetCorsBehavior(url, this_1._htmlAudioElement);
                                        this_1._htmlAudioElement.preload = "auto";
                                        this_1._htmlAudioElement.addEventListener("canplaythrough", function () {
                                            _this._isReadyToPlay = true;
                                            if (_this.autoplay) {
                                                _this.play(0, _this._offset, _this._length);
                                            }
                                            if (_this._readyToPlayCallback) {
                                                _this._readyToPlayCallback();
                                            }
                                        });
                                        document.body.appendChild(this_1._htmlAudioElement);
                                        this_1._htmlAudioElement.load();
                                    }
                                    return "break";
                                }
                            };
                            var this_1 = this;
                            // If we found a supported format, we load it immediately and stop the loop
                            for (var i = 0; i < urls.length; i++) {
                                var state_1 = _loop_1(i);
                                if (state_1 === "break")
                                    break;
                            }
                            break;
                        default:
                            validParameter = false;
                            break;
                    }
                    if (!validParameter) {
                        Logger.Error("Parameter must be a URL to the sound, an Array of URLs (.mp3 & .ogg) or an ArrayBuffer of the sound.");
                    }
                    else {
                        if (!codecSupportedFound) {
                            this._isReadyToPlay = true;
                            // Simulating a ready to play event to avoid breaking code path
                            if (this._readyToPlayCallback) {
                                window.setTimeout(function () {
                                    if (_this._readyToPlayCallback) {
                                        _this._readyToPlayCallback();
                                    }
                                }, 1000);
                            }
                        }
                    }
                }
                catch (ex) {
                    Logger.Error("Unexpected error. Sound creation aborted.");
                    this._scene.mainSoundTrack.removeSound(this);
                }
            }
        }
        else {
            // Adding an empty sound to avoid breaking audio calls for non Web Audio browsers
            this._scene.mainSoundTrack.addSound(this);
            if (Engine.audioEngine && !Engine.audioEngine.WarnedWebAudioUnsupported) {
                Logger.Error("Web Audio is not supported by your browser.");
                Engine.audioEngine.WarnedWebAudioUnsupported = true;
            }
            // Simulating a ready to play event to avoid breaking code for non web audio browsers
            if (this._readyToPlayCallback) {
                window.setTimeout(function () {
                    if (_this._readyToPlayCallback) {
                        _this._readyToPlayCallback();
                    }
                }, 1000);
            }
        }
    }
    Object.defineProperty(Sound.prototype, "loop", {
        /**
         * Does the sound loop after it finishes playing once.
         */
        get: function () {
            return this._loop;
        },
        set: function (value) {
            if (value === this._loop) {
                return;
            }
            this._loop = value;
            this.updateOptions({ loop: value });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "currentTime", {
        /**
         * Gets the current time for the sound.
         */
        get: function () {
            var _a;
            if (this._htmlAudioElement) {
                return this._htmlAudioElement.currentTime;
            }
            var currentTime = this._startOffset;
            if (this.isPlaying && ((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.audioContext)) {
                currentTime += Engine.audioEngine.audioContext.currentTime - this._startTime;
            }
            return currentTime;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "spatialSound", {
        /**
         * Does this sound enables spatial sound.
         * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-a-spatial-3d-sound
         */
        get: function () {
            return this._spatialSound;
        },
        /**
         * Does this sound enables spatial sound.
         * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-a-spatial-3d-sound
         */
        set: function (newValue) {
            var _a;
            this._spatialSound = newValue;
            if (this._spatialSound && ((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.canUseWebAudio) && Engine.audioEngine.audioContext) {
                this._createSpatialParameters();
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Release the sound and its associated resources
     */
    Sound.prototype.dispose = function () {
        var _a;
        if ((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.canUseWebAudio) {
            if (this.isPlaying) {
                this.stop();
            }
            this._isReadyToPlay = false;
            if (this.soundTrackId === -1) {
                this._scene.mainSoundTrack.removeSound(this);
            }
            else if (this._scene.soundTracks) {
                this._scene.soundTracks[this.soundTrackId].removeSound(this);
            }
            if (this._soundGain) {
                this._soundGain.disconnect();
                this._soundGain = null;
            }
            if (this._soundPanner) {
                this._soundPanner.disconnect();
                this._soundPanner = null;
            }
            if (this._soundSource) {
                this._soundSource.disconnect();
                this._soundSource = null;
            }
            this._audioBuffer = null;
            if (this._htmlAudioElement) {
                this._htmlAudioElement.pause();
                this._htmlAudioElement.src = "";
                document.body.removeChild(this._htmlAudioElement);
            }
            if (this._streamingSource) {
                this._streamingSource.disconnect();
            }
            if (this._connectedTransformNode && this._registerFunc) {
                this._connectedTransformNode.unregisterAfterWorldMatrixUpdate(this._registerFunc);
                this._connectedTransformNode = null;
            }
        }
    };
    /**
     * Gets if the sounds is ready to be played or not.
     * @returns true if ready, otherwise false
     */
    Sound.prototype.isReady = function () {
        return this._isReadyToPlay;
    };
    /**
     * Get the current class name.
     * @returns current class name
     */
    Sound.prototype.getClassName = function () {
        return "Sound";
    };
    Sound.prototype._soundLoaded = function (audioData) {
        var _this = this;
        var _a;
        if (!((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.audioContext)) {
            return;
        }
        Engine.audioEngine.audioContext.decodeAudioData(audioData, function (buffer) {
            _this._audioBuffer = buffer;
            _this._isReadyToPlay = true;
            if (_this.autoplay) {
                _this.play(0, _this._offset, _this._length);
            }
            if (_this._readyToPlayCallback) {
                _this._readyToPlayCallback();
            }
        }, function (err) {
            Logger.Error("Error while decoding audio data for: " + _this.name + " / Error: " + err);
        });
    };
    /**
     * Sets the data of the sound from an audiobuffer
     * @param audioBuffer The audioBuffer containing the data
     */
    Sound.prototype.setAudioBuffer = function (audioBuffer) {
        var _a;
        if ((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.canUseWebAudio) {
            this._audioBuffer = audioBuffer;
            this._isReadyToPlay = true;
        }
    };
    /**
     * Updates the current sounds options such as maxdistance, loop...
     * @param options A JSON object containing values named as the object properties
     */
    Sound.prototype.updateOptions = function (options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (options) {
            this.loop = (_a = options.loop) !== null && _a !== void 0 ? _a : this.loop;
            this.maxDistance = (_b = options.maxDistance) !== null && _b !== void 0 ? _b : this.maxDistance;
            this.useCustomAttenuation = (_c = options.useCustomAttenuation) !== null && _c !== void 0 ? _c : this.useCustomAttenuation;
            this.rolloffFactor = (_d = options.rolloffFactor) !== null && _d !== void 0 ? _d : this.rolloffFactor;
            this.refDistance = (_e = options.refDistance) !== null && _e !== void 0 ? _e : this.refDistance;
            this.distanceModel = (_f = options.distanceModel) !== null && _f !== void 0 ? _f : this.distanceModel;
            this._playbackRate = (_g = options.playbackRate) !== null && _g !== void 0 ? _g : this._playbackRate;
            this._length = (_h = options.length) !== null && _h !== void 0 ? _h : undefined;
            this._offset = (_j = options.offset) !== null && _j !== void 0 ? _j : undefined;
            this.setVolume((_k = options.volume) !== null && _k !== void 0 ? _k : this._volume);
            this._updateSpatialParameters();
            if (this.isPlaying) {
                if (this._streaming && this._htmlAudioElement) {
                    this._htmlAudioElement.playbackRate = this._playbackRate;
                    if (this._htmlAudioElement.loop !== this.loop) {
                        this._htmlAudioElement.loop = this.loop;
                    }
                }
                else {
                    if (this._soundSource) {
                        this._soundSource.playbackRate.value = this._playbackRate;
                        if (this._soundSource.loop !== this.loop) {
                            this._soundSource.loop = this.loop;
                        }
                        if (this._offset !== undefined && this._soundSource.loopStart !== this._offset) {
                            this._soundSource.loopStart = this._offset;
                        }
                        if (this._length !== undefined && this._length !== this._soundSource.loopEnd) {
                            this._soundSource.loopEnd = (this._offset | 0) + this._length;
                        }
                    }
                }
            }
        }
    };
    Sound.prototype._createSpatialParameters = function () {
        var _a, _b;
        if (((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.canUseWebAudio) && Engine.audioEngine.audioContext) {
            if (this._scene.headphone) {
                this._panningModel = "HRTF";
            }
            this._soundPanner = (_b = this._soundPanner) !== null && _b !== void 0 ? _b : Engine.audioEngine.audioContext.createPanner();
            if (this._soundPanner && this._outputAudioNode) {
                this._updateSpatialParameters();
                this._soundPanner.connect(this._outputAudioNode);
                this._inputAudioNode = this._soundPanner;
            }
        }
    };
    Sound.prototype._updateSpatialParameters = function () {
        if (this._spatialSound && this._soundPanner) {
            if (this.useCustomAttenuation) {
                // Tricks to disable in a way embedded Web Audio attenuation
                this._soundPanner.distanceModel = "linear";
                this._soundPanner.maxDistance = Number.MAX_VALUE;
                this._soundPanner.refDistance = 1;
                this._soundPanner.rolloffFactor = 1;
                this._soundPanner.panningModel = this._panningModel;
            }
            else {
                this._soundPanner.distanceModel = this.distanceModel;
                this._soundPanner.maxDistance = this.maxDistance;
                this._soundPanner.refDistance = this.refDistance;
                this._soundPanner.rolloffFactor = this.rolloffFactor;
                this._soundPanner.panningModel = this._panningModel;
            }
        }
    };
    /**
     * Switch the panning model to HRTF:
     * Renders a stereo output of higher quality than equalpower — it uses a convolution with measured impulse responses from human subjects.
     * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-a-spatial-3d-sound
     */
    Sound.prototype.switchPanningModelToHRTF = function () {
        this._panningModel = "HRTF";
        this._switchPanningModel();
    };
    /**
     * Switch the panning model to Equal Power:
     * Represents the equal-power panning algorithm, generally regarded as simple and efficient. equalpower is the default value.
     * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-a-spatial-3d-sound
     */
    Sound.prototype.switchPanningModelToEqualPower = function () {
        this._panningModel = "equalpower";
        this._switchPanningModel();
    };
    Sound.prototype._switchPanningModel = function () {
        var _a;
        if (((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.canUseWebAudio) && this._spatialSound && this._soundPanner) {
            this._soundPanner.panningModel = this._panningModel;
        }
    };
    /**
     * Connect this sound to a sound track audio node like gain...
     * @param soundTrackAudioNode the sound track audio node to connect to
     */
    Sound.prototype.connectToSoundTrackAudioNode = function (soundTrackAudioNode) {
        var _a;
        if (((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.canUseWebAudio) && this._outputAudioNode) {
            if (this._isOutputConnected) {
                this._outputAudioNode.disconnect();
            }
            this._outputAudioNode.connect(soundTrackAudioNode);
            this._isOutputConnected = true;
        }
    };
    /**
     * Transform this sound into a directional source
     * @param coneInnerAngle Size of the inner cone in degree
     * @param coneOuterAngle Size of the outer cone in degree
     * @param coneOuterGain Volume of the sound outside the outer cone (between 0.0 and 1.0)
     */
    Sound.prototype.setDirectionalCone = function (coneInnerAngle, coneOuterAngle, coneOuterGain) {
        if (coneOuterAngle < coneInnerAngle) {
            Logger.Error("setDirectionalCone(): outer angle of the cone must be superior or equal to the inner angle.");
            return;
        }
        this._coneInnerAngle = coneInnerAngle;
        this._coneOuterAngle = coneOuterAngle;
        this._coneOuterGain = coneOuterGain;
        this._isDirectional = true;
        if (this.isPlaying && this.loop) {
            this.stop();
            this.play(0, this._offset, this._length);
        }
    };
    Object.defineProperty(Sound.prototype, "directionalConeInnerAngle", {
        /**
         * Gets or sets the inner angle for the directional cone.
         */
        get: function () {
            return this._coneInnerAngle;
        },
        /**
         * Gets or sets the inner angle for the directional cone.
         */
        set: function (value) {
            var _a;
            if (value != this._coneInnerAngle) {
                if (this._coneOuterAngle < value) {
                    Logger.Error("directionalConeInnerAngle: outer angle of the cone must be superior or equal to the inner angle.");
                    return;
                }
                this._coneInnerAngle = value;
                if (((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.canUseWebAudio) && this._spatialSound && this._soundPanner) {
                    this._soundPanner.coneInnerAngle = this._coneInnerAngle;
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "directionalConeOuterAngle", {
        /**
         * Gets or sets the outer angle for the directional cone.
         */
        get: function () {
            return this._coneOuterAngle;
        },
        /**
         * Gets or sets the outer angle for the directional cone.
         */
        set: function (value) {
            var _a;
            if (value != this._coneOuterAngle) {
                if (value < this._coneInnerAngle) {
                    Logger.Error("directionalConeOuterAngle: outer angle of the cone must be superior or equal to the inner angle.");
                    return;
                }
                this._coneOuterAngle = value;
                if (((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.canUseWebAudio) && this._spatialSound && this._soundPanner) {
                    this._soundPanner.coneOuterAngle = this._coneOuterAngle;
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Sets the position of the emitter if spatial sound is enabled
     * @param newPosition Defines the new position
     */
    Sound.prototype.setPosition = function (newPosition) {
        var _a;
        if (newPosition.equals(this._position)) {
            return;
        }
        this._position.copyFrom(newPosition);
        if (((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.canUseWebAudio) && this._spatialSound && this._soundPanner && !isNaN(this._position.x) && !isNaN(this._position.y) && !isNaN(this._position.z)) {
            this._soundPanner.positionX.value = this._position.x;
            this._soundPanner.positionY.value = this._position.y;
            this._soundPanner.positionZ.value = this._position.z;
        }
    };
    /**
     * Sets the local direction of the emitter if spatial sound is enabled
     * @param newLocalDirection Defines the new local direction
     */
    Sound.prototype.setLocalDirectionToMesh = function (newLocalDirection) {
        var _a;
        this._localDirection = newLocalDirection;
        if (((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.canUseWebAudio) && this._connectedTransformNode && this.isPlaying) {
            this._updateDirection();
        }
    };
    Sound.prototype._updateDirection = function () {
        if (!this._connectedTransformNode || !this._soundPanner) {
            return;
        }
        var mat = this._connectedTransformNode.getWorldMatrix();
        var direction = Vector3.TransformNormal(this._localDirection, mat);
        direction.normalize();
        this._soundPanner.orientationX.value = direction.x;
        this._soundPanner.orientationY.value = direction.y;
        this._soundPanner.orientationZ.value = direction.z;
    };
    /** @hidden */
    Sound.prototype.updateDistanceFromListener = function () {
        var _a;
        if (((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.canUseWebAudio) && this._connectedTransformNode && this.useCustomAttenuation && this._soundGain && this._scene.activeCamera) {
            var distance = this._connectedTransformNode.getDistanceToCamera(this._scene.activeCamera);
            this._soundGain.gain.value = this._customAttenuationFunction(this._volume, distance, this.maxDistance, this.refDistance, this.rolloffFactor);
        }
    };
    /**
     * Sets a new custom attenuation function for the sound.
     * @param callback Defines the function used for the attenuation
     * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-your-own-custom-attenuation-function
     */
    Sound.prototype.setAttenuationFunction = function (callback) {
        this._customAttenuationFunction = callback;
    };
    /**
     * Play the sound
     * @param time (optional) Start the sound after X seconds. Start immediately (0) by default.
     * @param offset (optional) Start the sound at a specific time in seconds
     * @param length (optional) Sound duration (in seconds)
     */
    Sound.prototype.play = function (time, offset, length) {
        var _this = this;
        var _a, _b, _c, _d;
        if (this._isReadyToPlay && this._scene.audioEnabled && ((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.audioContext)) {
            try {
                if (this._startOffset < 0) {
                    time = -this._startOffset;
                    this._startOffset = 0;
                }
                var startTime_1 = time ? ((_b = Engine.audioEngine) === null || _b === void 0 ? void 0 : _b.audioContext.currentTime) + time : (_c = Engine.audioEngine) === null || _c === void 0 ? void 0 : _c.audioContext.currentTime;
                if (!this._soundSource || !this._streamingSource) {
                    if (this._spatialSound && this._soundPanner) {
                        if (!isNaN(this._position.x) && !isNaN(this._position.y) && !isNaN(this._position.z)) {
                            this._soundPanner.positionX.value = this._position.x;
                            this._soundPanner.positionY.value = this._position.y;
                            this._soundPanner.positionZ.value = this._position.z;
                        }
                        if (this._isDirectional) {
                            this._soundPanner.coneInnerAngle = this._coneInnerAngle;
                            this._soundPanner.coneOuterAngle = this._coneOuterAngle;
                            this._soundPanner.coneOuterGain = this._coneOuterGain;
                            if (this._connectedTransformNode) {
                                this._updateDirection();
                            }
                            else {
                                this._soundPanner.setOrientation(this._localDirection.x, this._localDirection.y, this._localDirection.z);
                            }
                        }
                    }
                }
                if (this._streaming) {
                    if (!this._streamingSource) {
                        this._streamingSource = Engine.audioEngine.audioContext.createMediaElementSource(this._htmlAudioElement);
                        this._htmlAudioElement.onended = function () {
                            _this._onended();
                        };
                        this._htmlAudioElement.playbackRate = this._playbackRate;
                    }
                    this._streamingSource.disconnect();
                    if (this._inputAudioNode) {
                        this._streamingSource.connect(this._inputAudioNode);
                    }
                    if (this._htmlAudioElement) {
                        // required to manage properly the new suspended default state of Chrome
                        // When the option 'streaming: true' is used, we need first to wait for
                        // the audio engine to be unlocked by a user gesture before trying to play
                        // an HTML Audio element
                        var tryToPlay_1 = function () {
                            var _a, _b;
                            if ((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.unlocked) {
                                var playPromise = _this._htmlAudioElement.play();
                                // In browsers that don’t yet support this functionality,
                                // playPromise won’t be defined.
                                if (playPromise !== undefined) {
                                    playPromise.catch(function () {
                                        var _a, _b;
                                        // Automatic playback failed.
                                        // Waiting for the audio engine to be unlocked by user click on unmute
                                        (_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.lock();
                                        if (_this.loop || _this.autoplay) {
                                            (_b = Engine.audioEngine) === null || _b === void 0 ? void 0 : _b.onAudioUnlockedObservable.addOnce(function () {
                                                tryToPlay_1();
                                            });
                                        }
                                    });
                                }
                            }
                            else {
                                if (_this.loop || _this.autoplay) {
                                    (_b = Engine.audioEngine) === null || _b === void 0 ? void 0 : _b.onAudioUnlockedObservable.addOnce(function () {
                                        tryToPlay_1();
                                    });
                                }
                            }
                        };
                        tryToPlay_1();
                    }
                }
                else {
                    var tryToPlay_2 = function () {
                        var _a, _b, _c;
                        if ((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.audioContext) {
                            length = length || _this._length;
                            offset = offset || _this._offset;
                            if (_this._soundSource) {
                                var oldSource_1 = _this._soundSource;
                                oldSource_1.onended = function () {
                                    oldSource_1.disconnect();
                                };
                            }
                            _this._soundSource = (_b = Engine.audioEngine) === null || _b === void 0 ? void 0 : _b.audioContext.createBufferSource();
                            if (_this._soundSource && _this._inputAudioNode) {
                                _this._soundSource.buffer = _this._audioBuffer;
                                _this._soundSource.connect(_this._inputAudioNode);
                                _this._soundSource.loop = _this.loop;
                                if (offset !== undefined) {
                                    _this._soundSource.loopStart = offset;
                                }
                                if (length !== undefined) {
                                    _this._soundSource.loopEnd = (offset | 0) + length;
                                }
                                _this._soundSource.playbackRate.value = _this._playbackRate;
                                _this._soundSource.onended = function () {
                                    _this._onended();
                                };
                                startTime_1 = time ? ((_c = Engine.audioEngine) === null || _c === void 0 ? void 0 : _c.audioContext.currentTime) + time : Engine.audioEngine.audioContext.currentTime;
                                var actualOffset = _this.isPaused ? _this._startOffset % _this._soundSource.buffer.duration : offset ? offset : 0;
                                _this._soundSource.start(startTime_1, actualOffset, _this.loop ? undefined : length);
                            }
                        }
                    };
                    if (((_d = Engine.audioEngine) === null || _d === void 0 ? void 0 : _d.audioContext.state) === "suspended") {
                        // Wait a bit for FF as context seems late to be ready.
                        setTimeout(function () {
                            var _a;
                            if (((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.audioContext.state) === "suspended") {
                                // Automatic playback failed.
                                // Waiting for the audio engine to be unlocked by user click on unmute
                                Engine.audioEngine.lock();
                                if (_this.loop || _this.autoplay) {
                                    Engine.audioEngine.onAudioUnlockedObservable.addOnce(function () {
                                        tryToPlay_2();
                                    });
                                }
                            }
                            else {
                                tryToPlay_2();
                            }
                        }, 500);
                    }
                    else {
                        tryToPlay_2();
                    }
                }
                this._startTime = startTime_1;
                this.isPlaying = true;
                this.isPaused = false;
            }
            catch (ex) {
                Logger.Error("Error while trying to play audio: " + this.name + ", " + ex.message);
            }
        }
    };
    Sound.prototype._onended = function () {
        this.isPlaying = false;
        this._startOffset = 0;
        if (this.onended) {
            this.onended();
        }
        this.onEndedObservable.notifyObservers(this);
    };
    /**
     * Stop the sound
     * @param time (optional) Stop the sound after X seconds. Stop immediately (0) by default.
     */
    Sound.prototype.stop = function (time) {
        var _this = this;
        var _a;
        if (this.isPlaying) {
            if (this._streaming) {
                if (this._htmlAudioElement) {
                    this._htmlAudioElement.pause();
                    // Test needed for Firefox or it will generate an Invalid State Error
                    if (this._htmlAudioElement.currentTime > 0) {
                        this._htmlAudioElement.currentTime = 0;
                    }
                }
                else {
                    this._streamingSource.disconnect();
                }
                this.isPlaying = false;
            }
            else if (((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.audioContext) && this._soundSource) {
                var stopTime = time ? Engine.audioEngine.audioContext.currentTime + time : undefined;
                this._soundSource.stop(stopTime);
                if (stopTime === undefined) {
                    this.isPlaying = false;
                    this._soundSource.onended = function () { return void 0; };
                }
                else {
                    this._soundSource.onended = function () {
                        _this.isPlaying = false;
                    };
                }
                if (!this.isPaused) {
                    this._startOffset = 0;
                }
            }
        }
    };
    /**
     * Put the sound in pause
     */
    Sound.prototype.pause = function () {
        var _a;
        if (this.isPlaying) {
            this.isPaused = true;
            if (this._streaming) {
                if (this._htmlAudioElement) {
                    this._htmlAudioElement.pause();
                }
                else {
                    this._streamingSource.disconnect();
                }
                this.isPlaying = false;
            }
            else if ((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.audioContext) {
                this.stop(0);
                this._startOffset += Engine.audioEngine.audioContext.currentTime - this._startTime;
            }
        }
    };
    /**
     * Sets a dedicated volume for this sounds
     * @param newVolume Define the new volume of the sound
     * @param time Define time for gradual change to new volume
     */
    Sound.prototype.setVolume = function (newVolume, time) {
        var _a;
        if (((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.canUseWebAudio) && this._soundGain) {
            if (time && Engine.audioEngine.audioContext) {
                this._soundGain.gain.cancelScheduledValues(Engine.audioEngine.audioContext.currentTime);
                this._soundGain.gain.setValueAtTime(this._soundGain.gain.value, Engine.audioEngine.audioContext.currentTime);
                this._soundGain.gain.linearRampToValueAtTime(newVolume, Engine.audioEngine.audioContext.currentTime + time);
            }
            else {
                this._soundGain.gain.value = newVolume;
            }
        }
        this._volume = newVolume;
    };
    /**
     * Set the sound play back rate
     * @param newPlaybackRate Define the playback rate the sound should be played at
     */
    Sound.prototype.setPlaybackRate = function (newPlaybackRate) {
        this._playbackRate = newPlaybackRate;
        if (this.isPlaying) {
            if (this._streaming && this._htmlAudioElement) {
                this._htmlAudioElement.playbackRate = this._playbackRate;
            }
            else if (this._soundSource) {
                this._soundSource.playbackRate.value = this._playbackRate;
            }
        }
    };
    /**
     * Gets the volume of the sound.
     * @returns the volume of the sound
     */
    Sound.prototype.getVolume = function () {
        return this._volume;
    };
    /**
     * Attach the sound to a dedicated mesh
     * @param transformNode The transform node to connect the sound with
     * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music#attaching-a-sound-to-a-mesh
     */
    Sound.prototype.attachToMesh = function (transformNode) {
        var _this = this;
        if (this._connectedTransformNode && this._registerFunc) {
            this._connectedTransformNode.unregisterAfterWorldMatrixUpdate(this._registerFunc);
            this._registerFunc = null;
        }
        this._connectedTransformNode = transformNode;
        if (!this._spatialSound) {
            this._spatialSound = true;
            this._createSpatialParameters();
            if (this.isPlaying && this.loop) {
                this.stop();
                this.play(0, this._offset, this._length);
            }
        }
        this._onRegisterAfterWorldMatrixUpdate(this._connectedTransformNode);
        this._registerFunc = function (transformNode) { return _this._onRegisterAfterWorldMatrixUpdate(transformNode); };
        this._connectedTransformNode.registerAfterWorldMatrixUpdate(this._registerFunc);
    };
    /**
     * Detach the sound from the previously attached mesh
     * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music#attaching-a-sound-to-a-mesh
     */
    Sound.prototype.detachFromMesh = function () {
        if (this._connectedTransformNode && this._registerFunc) {
            this._connectedTransformNode.unregisterAfterWorldMatrixUpdate(this._registerFunc);
            this._registerFunc = null;
            this._connectedTransformNode = null;
        }
    };
    Sound.prototype._onRegisterAfterWorldMatrixUpdate = function (node) {
        var _a;
        if (!node.getBoundingInfo) {
            this.setPosition(node.absolutePosition);
        }
        else {
            var mesh = node;
            var boundingInfo = mesh.getBoundingInfo();
            this.setPosition(boundingInfo.boundingSphere.centerWorld);
        }
        if (((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.canUseWebAudio) && this._isDirectional && this.isPlaying) {
            this._updateDirection();
        }
    };
    /**
     * Clone the current sound in the scene.
     * @returns the new sound clone
     */
    Sound.prototype.clone = function () {
        var _this = this;
        if (!this._streaming) {
            var setBufferAndRun_1 = function () {
                if (_this._isReadyToPlay) {
                    clonedSound_1._audioBuffer = _this.getAudioBuffer();
                    clonedSound_1._isReadyToPlay = true;
                    if (clonedSound_1.autoplay) {
                        clonedSound_1.play(0, _this._offset, _this._length);
                    }
                }
                else {
                    window.setTimeout(setBufferAndRun_1, 300);
                }
            };
            var currentOptions = {
                autoplay: this.autoplay,
                loop: this.loop,
                volume: this._volume,
                spatialSound: this._spatialSound,
                maxDistance: this.maxDistance,
                useCustomAttenuation: this.useCustomAttenuation,
                rolloffFactor: this.rolloffFactor,
                refDistance: this.refDistance,
                distanceModel: this.distanceModel,
            };
            var clonedSound_1 = new Sound(this.name + "_cloned", new ArrayBuffer(0), this._scene, null, currentOptions);
            if (this.useCustomAttenuation) {
                clonedSound_1.setAttenuationFunction(this._customAttenuationFunction);
            }
            clonedSound_1.setPosition(this._position);
            clonedSound_1.setPlaybackRate(this._playbackRate);
            setBufferAndRun_1();
            return clonedSound_1;
        }
        // Can't clone a streaming sound
        else {
            return null;
        }
    };
    /**
     * Gets the current underlying audio buffer containing the data
     * @returns the audio buffer
     */
    Sound.prototype.getAudioBuffer = function () {
        return this._audioBuffer;
    };
    /**
     * Gets the WebAudio AudioBufferSourceNode, lets you keep track of and stop instances of this Sound.
     * @returns the source node
     */
    Sound.prototype.getSoundSource = function () {
        return this._soundSource;
    };
    /**
     * Gets the WebAudio GainNode, gives you precise control over the gain of instances of this Sound.
     * @returns the gain node
     */
    Sound.prototype.getSoundGain = function () {
        return this._soundGain;
    };
    /**
     * Serializes the Sound in a JSON representation
     * @returns the JSON representation of the sound
     */
    Sound.prototype.serialize = function () {
        var serializationObject = {
            name: this.name,
            url: this.name,
            autoplay: this.autoplay,
            loop: this.loop,
            volume: this._volume,
            spatialSound: this._spatialSound,
            maxDistance: this.maxDistance,
            rolloffFactor: this.rolloffFactor,
            refDistance: this.refDistance,
            distanceModel: this.distanceModel,
            playbackRate: this._playbackRate,
            panningModel: this._panningModel,
            soundTrackId: this.soundTrackId,
            metadata: this.metadata,
        };
        if (this._spatialSound) {
            if (this._connectedTransformNode) {
                serializationObject.connectedMeshId = this._connectedTransformNode.id;
            }
            serializationObject.position = this._position.asArray();
            serializationObject.refDistance = this.refDistance;
            serializationObject.distanceModel = this.distanceModel;
            serializationObject.isDirectional = this._isDirectional;
            serializationObject.localDirectionToMesh = this._localDirection.asArray();
            serializationObject.coneInnerAngle = this._coneInnerAngle;
            serializationObject.coneOuterAngle = this._coneOuterAngle;
            serializationObject.coneOuterGain = this._coneOuterGain;
        }
        return serializationObject;
    };
    /**
     * Parse a JSON representation of a sound to instantiate in a given scene
     * @param parsedSound Define the JSON representation of the sound (usually coming from the serialize method)
     * @param scene Define the scene the new parsed sound should be created in
     * @param rootUrl Define the rooturl of the load in case we need to fetch relative dependencies
     * @param sourceSound Define a sound place holder if do not need to instantiate a new one
     * @returns the newly parsed sound
     */
    Sound.Parse = function (parsedSound, scene, rootUrl, sourceSound) {
        var soundName = parsedSound.name;
        var soundUrl;
        if (parsedSound.url) {
            soundUrl = rootUrl + parsedSound.url;
        }
        else {
            soundUrl = rootUrl + soundName;
        }
        var options = {
            autoplay: parsedSound.autoplay,
            loop: parsedSound.loop,
            volume: parsedSound.volume,
            spatialSound: parsedSound.spatialSound,
            maxDistance: parsedSound.maxDistance,
            rolloffFactor: parsedSound.rolloffFactor,
            refDistance: parsedSound.refDistance,
            distanceModel: parsedSound.distanceModel,
            playbackRate: parsedSound.playbackRate,
        };
        var newSound;
        if (!sourceSound) {
            newSound = new Sound(soundName, soundUrl, scene, function () {
                scene._removePendingData(newSound);
            }, options);
            scene._addPendingData(newSound);
        }
        else {
            var setBufferAndRun_2 = function () {
                if (sourceSound._isReadyToPlay) {
                    newSound._audioBuffer = sourceSound.getAudioBuffer();
                    newSound._isReadyToPlay = true;
                    if (newSound.autoplay) {
                        newSound.play(0, newSound._offset, newSound._length);
                    }
                }
                else {
                    window.setTimeout(setBufferAndRun_2, 300);
                }
            };
            newSound = new Sound(soundName, new ArrayBuffer(0), scene, null, options);
            setBufferAndRun_2();
        }
        if (parsedSound.position) {
            var soundPosition = Vector3.FromArray(parsedSound.position);
            newSound.setPosition(soundPosition);
        }
        if (parsedSound.isDirectional) {
            newSound.setDirectionalCone(parsedSound.coneInnerAngle || 360, parsedSound.coneOuterAngle || 360, parsedSound.coneOuterGain || 0);
            if (parsedSound.localDirectionToMesh) {
                var localDirectionToMesh = Vector3.FromArray(parsedSound.localDirectionToMesh);
                newSound.setLocalDirectionToMesh(localDirectionToMesh);
            }
        }
        if (parsedSound.connectedMeshId) {
            var connectedMesh = scene.getMeshById(parsedSound.connectedMeshId);
            if (connectedMesh) {
                newSound.attachToMesh(connectedMesh);
            }
        }
        if (parsedSound.metadata) {
            newSound.metadata = parsedSound.metadata;
        }
        return newSound;
    };
    /**
     * @param _
     * @hidden
     */
    Sound._SceneComponentInitialization = function (_) {
        throw _WarnImport("AudioSceneComponent");
    };
    return Sound;
}());
export { Sound };
//# sourceMappingURL=sound.js.map