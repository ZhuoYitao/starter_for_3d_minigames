import { Animation } from "./animation.js";
import { Observable } from "../Misc/observable.js";
import { EngineStore } from "../Engines/engineStore.js";
import { Tags } from "../Misc/tags.js";
/**
 * This class defines the direct association between an animation and a target
 */
var TargetedAnimation = /** @class */ (function () {
    function TargetedAnimation() {
    }
    /**
     * Returns the string "TargetedAnimation"
     * @returns "TargetedAnimation"
     */
    TargetedAnimation.prototype.getClassName = function () {
        return "TargetedAnimation";
    };
    /**
     * Serialize the object
     * @returns the JSON object representing the current entity
     */
    TargetedAnimation.prototype.serialize = function () {
        var serializationObject = {};
        serializationObject.animation = this.animation.serialize();
        serializationObject.targetId = this.target.id;
        return serializationObject;
    };
    return TargetedAnimation;
}());
export { TargetedAnimation };
/**
 * Use this class to create coordinated animations on multiple targets
 */
var AnimationGroup = /** @class */ (function () {
    /**
     * Instantiates a new Animation Group.
     * This helps managing several animations at once.
     * @see https://doc.babylonjs.com/divingDeeper/animation/groupAnimations
     * @param name Defines the name of the group
     * @param scene Defines the scene the group belongs to
     */
    function AnimationGroup(
    /** The name of the animation group */
    name, scene) {
        if (scene === void 0) { scene = null; }
        this.name = name;
        this._targetedAnimations = new Array();
        this._animatables = new Array();
        this._from = Number.MAX_VALUE;
        this._to = -Number.MAX_VALUE;
        this._speedRatio = 1;
        this._loopAnimation = false;
        this._isAdditive = false;
        /** @hidden */
        this._parentContainer = null;
        /**
         * This observable will notify when one animation have ended
         */
        this.onAnimationEndObservable = new Observable();
        /**
         * Observer raised when one animation loops
         */
        this.onAnimationLoopObservable = new Observable();
        /**
         * Observer raised when all animations have looped
         */
        this.onAnimationGroupLoopObservable = new Observable();
        /**
         * This observable will notify when all animations have ended.
         */
        this.onAnimationGroupEndObservable = new Observable();
        /**
         * This observable will notify when all animations have paused.
         */
        this.onAnimationGroupPauseObservable = new Observable();
        /**
         * This observable will notify when all animations are playing.
         */
        this.onAnimationGroupPlayObservable = new Observable();
        /**
         * Gets or sets an object used to store user defined information for the node
         */
        this.metadata = null;
        this._scene = scene || EngineStore.LastCreatedScene;
        this.uniqueId = this._scene.getUniqueId();
        this._scene.addAnimationGroup(this);
    }
    Object.defineProperty(AnimationGroup.prototype, "from", {
        /**
         * Gets the first frame
         */
        get: function () {
            return this._from;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnimationGroup.prototype, "to", {
        /**
         * Gets the last frame
         */
        get: function () {
            return this._to;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnimationGroup.prototype, "isStarted", {
        /**
         * Define if the animations are started
         */
        get: function () {
            return this._isStarted;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnimationGroup.prototype, "isPlaying", {
        /**
         * Gets a value indicating that the current group is playing
         */
        get: function () {
            return this._isStarted && !this._isPaused;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnimationGroup.prototype, "speedRatio", {
        /**
         * Gets or sets the speed ratio to use for all animations
         */
        get: function () {
            return this._speedRatio;
        },
        /**
         * Gets or sets the speed ratio to use for all animations
         */
        set: function (value) {
            if (this._speedRatio === value) {
                return;
            }
            this._speedRatio = value;
            for (var index = 0; index < this._animatables.length; index++) {
                var animatable = this._animatables[index];
                animatable.speedRatio = this._speedRatio;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnimationGroup.prototype, "loopAnimation", {
        /**
         * Gets or sets if all animations should loop or not
         */
        get: function () {
            return this._loopAnimation;
        },
        set: function (value) {
            if (this._loopAnimation === value) {
                return;
            }
            this._loopAnimation = value;
            for (var index = 0; index < this._animatables.length; index++) {
                var animatable = this._animatables[index];
                animatable.loopAnimation = this._loopAnimation;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnimationGroup.prototype, "isAdditive", {
        /**
         * Gets or sets if all animations should be evaluated additively
         */
        get: function () {
            return this._isAdditive;
        },
        set: function (value) {
            if (this._isAdditive === value) {
                return;
            }
            this._isAdditive = value;
            for (var index = 0; index < this._animatables.length; index++) {
                var animatable = this._animatables[index];
                animatable.isAdditive = this._isAdditive;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnimationGroup.prototype, "targetedAnimations", {
        /**
         * Gets the targeted animations for this animation group
         */
        get: function () {
            return this._targetedAnimations;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnimationGroup.prototype, "animatables", {
        /**
         * returning the list of animatables controlled by this animation group.
         */
        get: function () {
            return this._animatables;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnimationGroup.prototype, "children", {
        /**
         * Gets the list of target animations
         */
        get: function () {
            return this._targetedAnimations;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Add an animation (with its target) in the group
     * @param animation defines the animation we want to add
     * @param target defines the target of the animation
     * @returns the TargetedAnimation object
     */
    AnimationGroup.prototype.addTargetedAnimation = function (animation, target) {
        var targetedAnimation = new TargetedAnimation();
        targetedAnimation.animation = animation;
        targetedAnimation.target = target;
        var keys = animation.getKeys();
        if (this._from > keys[0].frame) {
            this._from = keys[0].frame;
        }
        if (this._to < keys[keys.length - 1].frame) {
            this._to = keys[keys.length - 1].frame;
        }
        this._targetedAnimations.push(targetedAnimation);
        return targetedAnimation;
    };
    /**
     * This function will normalize every animation in the group to make sure they all go from beginFrame to endFrame
     * It can add constant keys at begin or end
     * @param beginFrame defines the new begin frame for all animations or the smallest begin frame of all animations if null (defaults to null)
     * @param endFrame defines the new end frame for all animations or the largest end frame of all animations if null (defaults to null)
     * @returns the animation group
     */
    AnimationGroup.prototype.normalize = function (beginFrame, endFrame) {
        if (beginFrame === void 0) { beginFrame = null; }
        if (endFrame === void 0) { endFrame = null; }
        if (beginFrame == null) {
            beginFrame = this._from;
        }
        if (endFrame == null) {
            endFrame = this._to;
        }
        for (var index = 0; index < this._targetedAnimations.length; index++) {
            var targetedAnimation = this._targetedAnimations[index];
            var keys = targetedAnimation.animation.getKeys();
            var startKey = keys[0];
            var endKey = keys[keys.length - 1];
            if (startKey.frame > beginFrame) {
                var newKey = {
                    frame: beginFrame,
                    value: startKey.value,
                    inTangent: startKey.inTangent,
                    outTangent: startKey.outTangent,
                    interpolation: startKey.interpolation,
                };
                keys.splice(0, 0, newKey);
            }
            if (endKey.frame < endFrame) {
                var newKey = {
                    frame: endFrame,
                    value: endKey.value,
                    inTangent: endKey.inTangent,
                    outTangent: endKey.outTangent,
                    interpolation: endKey.interpolation,
                };
                keys.push(newKey);
            }
        }
        this._from = beginFrame;
        this._to = endFrame;
        return this;
    };
    AnimationGroup.prototype._processLoop = function (animatable, targetedAnimation, index) {
        var _this = this;
        animatable.onAnimationLoop = function () {
            _this.onAnimationLoopObservable.notifyObservers(targetedAnimation);
            if (_this._animationLoopFlags[index]) {
                return;
            }
            _this._animationLoopFlags[index] = true;
            _this._animationLoopCount++;
            if (_this._animationLoopCount === _this._targetedAnimations.length) {
                _this.onAnimationGroupLoopObservable.notifyObservers(_this);
                _this._animationLoopCount = 0;
                _this._animationLoopFlags = [];
            }
        };
    };
    /**
     * Start all animations on given targets
     * @param loop defines if animations must loop
     * @param speedRatio defines the ratio to apply to animation speed (1 by default)
     * @param from defines the from key (optional)
     * @param to defines the to key (optional)
     * @param isAdditive defines the additive state for the resulting animatables (optional)
     * @returns the current animation group
     */
    AnimationGroup.prototype.start = function (loop, speedRatio, from, to, isAdditive) {
        var _this = this;
        if (loop === void 0) { loop = false; }
        if (speedRatio === void 0) { speedRatio = 1; }
        if (this._isStarted || this._targetedAnimations.length === 0) {
            return this;
        }
        this._loopAnimation = loop;
        this._animationLoopCount = 0;
        this._animationLoopFlags = [];
        var _loop_1 = function (index) {
            var targetedAnimation = this_1._targetedAnimations[index];
            var animatable = this_1._scene.beginDirectAnimation(targetedAnimation.target, [targetedAnimation.animation], from !== undefined ? from : this_1._from, to !== undefined ? to : this_1._to, loop, speedRatio, undefined, undefined, isAdditive !== undefined ? isAdditive : this_1._isAdditive);
            animatable.onAnimationEnd = function () {
                _this.onAnimationEndObservable.notifyObservers(targetedAnimation);
                _this._checkAnimationGroupEnded(animatable);
            };
            this_1._processLoop(animatable, targetedAnimation, index);
            this_1._animatables.push(animatable);
        };
        var this_1 = this;
        for (var index = 0; index < this._targetedAnimations.length; index++) {
            _loop_1(index);
        }
        this._speedRatio = speedRatio;
        this._isStarted = true;
        this._isPaused = false;
        this.onAnimationGroupPlayObservable.notifyObservers(this);
        return this;
    };
    /**
     * Pause all animations
     * @returns the animation group
     */
    AnimationGroup.prototype.pause = function () {
        if (!this._isStarted) {
            return this;
        }
        this._isPaused = true;
        for (var index = 0; index < this._animatables.length; index++) {
            var animatable = this._animatables[index];
            animatable.pause();
        }
        this.onAnimationGroupPauseObservable.notifyObservers(this);
        return this;
    };
    /**
     * Play all animations to initial state
     * This function will start() the animations if they were not started or will restart() them if they were paused
     * @param loop defines if animations must loop
     * @returns the animation group
     */
    AnimationGroup.prototype.play = function (loop) {
        // only if all animatables are ready and exist
        if (this.isStarted && this._animatables.length === this._targetedAnimations.length) {
            if (loop !== undefined) {
                this.loopAnimation = loop;
            }
            this.restart();
        }
        else {
            this.stop();
            this.start(loop, this._speedRatio);
        }
        this._isPaused = false;
        return this;
    };
    /**
     * Reset all animations to initial state
     * @returns the animation group
     */
    AnimationGroup.prototype.reset = function () {
        if (!this._isStarted) {
            this.play();
            this.goToFrame(0);
            this.stop();
            return this;
        }
        for (var index = 0; index < this._animatables.length; index++) {
            var animatable = this._animatables[index];
            animatable.reset();
        }
        return this;
    };
    /**
     * Restart animations from key 0
     * @returns the animation group
     */
    AnimationGroup.prototype.restart = function () {
        if (!this._isStarted) {
            return this;
        }
        for (var index = 0; index < this._animatables.length; index++) {
            var animatable = this._animatables[index];
            animatable.restart();
        }
        this.onAnimationGroupPlayObservable.notifyObservers(this);
        return this;
    };
    /**
     * Stop all animations
     * @returns the animation group
     */
    AnimationGroup.prototype.stop = function () {
        if (!this._isStarted) {
            return this;
        }
        var list = this._animatables.slice();
        for (var index = 0; index < list.length; index++) {
            list[index].stop();
        }
        this._isStarted = false;
        return this;
    };
    /**
     * Set animation weight for all animatables
     * @param weight defines the weight to use
     * @return the animationGroup
     * @see https://doc.babylonjs.com/babylon101/animations#animation-weights
     */
    AnimationGroup.prototype.setWeightForAllAnimatables = function (weight) {
        for (var index = 0; index < this._animatables.length; index++) {
            var animatable = this._animatables[index];
            animatable.weight = weight;
        }
        return this;
    };
    /**
     * Synchronize and normalize all animatables with a source animatable
     * @param root defines the root animatable to synchronize with (null to stop synchronizing)
     * @return the animationGroup
     * @see https://doc.babylonjs.com/babylon101/animations#animation-weights
     */
    AnimationGroup.prototype.syncAllAnimationsWith = function (root) {
        for (var index = 0; index < this._animatables.length; index++) {
            var animatable = this._animatables[index];
            animatable.syncWith(root);
        }
        return this;
    };
    /**
     * Goes to a specific frame in this animation group
     * @param frame the frame number to go to
     * @return the animationGroup
     */
    AnimationGroup.prototype.goToFrame = function (frame) {
        if (!this._isStarted) {
            return this;
        }
        for (var index = 0; index < this._animatables.length; index++) {
            var animatable = this._animatables[index];
            animatable.goToFrame(frame);
        }
        return this;
    };
    /**
     * Dispose all associated resources
     */
    AnimationGroup.prototype.dispose = function () {
        this._targetedAnimations = [];
        this._animatables = [];
        // Remove from scene
        var index = this._scene.animationGroups.indexOf(this);
        if (index > -1) {
            this._scene.animationGroups.splice(index, 1);
        }
        if (this._parentContainer) {
            var index_1 = this._parentContainer.animationGroups.indexOf(this);
            if (index_1 > -1) {
                this._parentContainer.animationGroups.splice(index_1, 1);
            }
            this._parentContainer = null;
        }
        this.onAnimationEndObservable.clear();
        this.onAnimationGroupEndObservable.clear();
        this.onAnimationGroupPauseObservable.clear();
        this.onAnimationGroupPlayObservable.clear();
        this.onAnimationLoopObservable.clear();
        this.onAnimationGroupLoopObservable.clear();
    };
    AnimationGroup.prototype._checkAnimationGroupEnded = function (animatable) {
        // animatable should be taken out of the array
        var idx = this._animatables.indexOf(animatable);
        if (idx > -1) {
            this._animatables.splice(idx, 1);
        }
        // all animatables were removed? animation group ended!
        if (this._animatables.length === 0) {
            this._isStarted = false;
            this.onAnimationGroupEndObservable.notifyObservers(this);
        }
    };
    /**
     * Clone the current animation group and returns a copy
     * @param newName defines the name of the new group
     * @param targetConverter defines an optional function used to convert current animation targets to new ones
     * @param cloneAnimations defines if the animations should be cloned or referenced
     * @returns the new animation group
     */
    AnimationGroup.prototype.clone = function (newName, targetConverter, cloneAnimations) {
        if (cloneAnimations === void 0) { cloneAnimations = false; }
        var newGroup = new AnimationGroup(newName || this.name, this._scene);
        for (var _i = 0, _a = this._targetedAnimations; _i < _a.length; _i++) {
            var targetAnimation = _a[_i];
            newGroup.addTargetedAnimation(cloneAnimations ? targetAnimation.animation.clone() : targetAnimation.animation, targetConverter ? targetConverter(targetAnimation.target) : targetAnimation.target);
        }
        return newGroup;
    };
    /**
     * Serializes the animationGroup to an object
     * @returns Serialized object
     */
    AnimationGroup.prototype.serialize = function () {
        var serializationObject = {};
        serializationObject.name = this.name;
        serializationObject.from = this.from;
        serializationObject.to = this.to;
        serializationObject.targetedAnimations = [];
        for (var targetedAnimationIndex = 0; targetedAnimationIndex < this.targetedAnimations.length; targetedAnimationIndex++) {
            var targetedAnimation = this.targetedAnimations[targetedAnimationIndex];
            serializationObject.targetedAnimations[targetedAnimationIndex] = targetedAnimation.serialize();
        }
        if (Tags && Tags.HasTags(this)) {
            serializationObject.tags = Tags.GetTags(this);
        }
        // Metadata
        if (this.metadata) {
            serializationObject.metadata = this.metadata;
        }
        return serializationObject;
    };
    // Statics
    /**
     * Returns a new AnimationGroup object parsed from the source provided.
     * @param parsedAnimationGroup defines the source
     * @param scene defines the scene that will receive the animationGroup
     * @returns a new AnimationGroup
     */
    AnimationGroup.Parse = function (parsedAnimationGroup, scene) {
        var animationGroup = new AnimationGroup(parsedAnimationGroup.name, scene);
        for (var i = 0; i < parsedAnimationGroup.targetedAnimations.length; i++) {
            var targetedAnimation = parsedAnimationGroup.targetedAnimations[i];
            var animation = Animation.Parse(targetedAnimation.animation);
            var id = targetedAnimation.targetId;
            if (targetedAnimation.animation.property === "influence") {
                // morph target animation
                var morphTarget = scene.getMorphTargetById(id);
                if (morphTarget) {
                    animationGroup.addTargetedAnimation(animation, morphTarget);
                }
            }
            else {
                var targetNode = scene.getNodeById(id);
                if (targetNode != null) {
                    animationGroup.addTargetedAnimation(animation, targetNode);
                }
            }
        }
        if (parsedAnimationGroup.from !== null && parsedAnimationGroup.to !== null) {
            animationGroup.normalize(parsedAnimationGroup.from, parsedAnimationGroup.to);
        }
        if (Tags) {
            Tags.AddTagsTo(animationGroup, parsedAnimationGroup.tags);
        }
        if (parsedAnimationGroup.metadata !== undefined) {
            animationGroup.metadata = parsedAnimationGroup.metadata;
        }
        return animationGroup;
    };
    /**
     * Convert the keyframes for all animations belonging to the group to be relative to a given reference frame.
     * @param sourceAnimationGroup defines the AnimationGroup containing animations to convert
     * @param referenceFrame defines the frame that keyframes in the range will be relative to
     * @param range defines the name of the AnimationRange belonging to the animations in the group to convert
     * @param cloneOriginal defines whether or not to clone the group and convert the clone or convert the original group (default is false)
     * @param clonedName defines the name of the resulting cloned AnimationGroup if cloneOriginal is true
     * @returns a new AnimationGroup if cloneOriginal is true or the original AnimationGroup if cloneOriginal is false
     */
    AnimationGroup.MakeAnimationAdditive = function (sourceAnimationGroup, referenceFrame, range, cloneOriginal, clonedName) {
        if (referenceFrame === void 0) { referenceFrame = 0; }
        if (cloneOriginal === void 0) { cloneOriginal = false; }
        var animationGroup = sourceAnimationGroup;
        if (cloneOriginal) {
            animationGroup = sourceAnimationGroup.clone(clonedName || animationGroup.name);
        }
        var targetedAnimations = animationGroup.targetedAnimations;
        for (var index = 0; index < targetedAnimations.length; index++) {
            var targetedAnimation = targetedAnimations[index];
            Animation.MakeAnimationAdditive(targetedAnimation.animation, referenceFrame, range);
        }
        animationGroup.isAdditive = true;
        return animationGroup;
    };
    /**
     * Returns the string "AnimationGroup"
     * @returns "AnimationGroup"
     */
    AnimationGroup.prototype.getClassName = function () {
        return "AnimationGroup";
    };
    /**
     * Creates a detailed string about the object
     * @param fullDetails defines if the output string will support multiple levels of logging within scene loading
     * @returns a string representing the object
     */
    AnimationGroup.prototype.toString = function (fullDetails) {
        var ret = "Name: " + this.name;
        ret += ", type: " + this.getClassName();
        if (fullDetails) {
            ret += ", from: " + this._from;
            ret += ", to: " + this._to;
            ret += ", isStarted: " + this._isStarted;
            ret += ", speedRatio: " + this._speedRatio;
            ret += ", targetedAnimations length: " + this._targetedAnimations.length;
            ret += ", animatables length: " + this._animatables;
        }
        return ret;
    };
    return AnimationGroup;
}());
export { AnimationGroup };
//# sourceMappingURL=animationGroup.js.map