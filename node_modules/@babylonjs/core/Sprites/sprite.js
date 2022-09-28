import { __extends } from "tslib";
import { Vector3 } from "../Maths/math.vector.js";
import { Color4 } from "../Maths/math.color.js";
import { Observable } from "../Misc/observable.js";
import { ThinSprite } from "./thinSprite.js";
/**
 * Class used to represent a sprite
 * @see https://doc.babylonjs.com/babylon101/sprites
 */
var Sprite = /** @class */ (function (_super) {
    __extends(Sprite, _super);
    /**
     * Creates a new Sprite
     * @param name defines the name
     * @param manager defines the manager
     */
    function Sprite(
    /** defines the name */
    name, manager) {
        var _this = _super.call(this) || this;
        _this.name = name;
        /** Gets the list of attached animations */
        _this.animations = new Array();
        /** Gets or sets a boolean indicating if the sprite can be picked */
        _this.isPickable = false;
        /** Gets or sets a boolean indicating that sprite texture alpha will be used for precise picking (false by default) */
        _this.useAlphaForPicking = false;
        /**
         * An event triggered when the control has been disposed
         */
        _this.onDisposeObservable = new Observable();
        _this._onAnimationEnd = null;
        _this._endAnimation = function () {
            if (_this._onAnimationEnd) {
                _this._onAnimationEnd();
            }
            if (_this.disposeWhenFinishedAnimating) {
                _this.dispose();
            }
        };
        _this.color = new Color4(1.0, 1.0, 1.0, 1.0);
        _this.position = Vector3.Zero();
        _this._manager = manager;
        _this._manager.sprites.push(_this);
        _this.uniqueId = _this._manager.scene.getUniqueId();
        return _this;
    }
    Object.defineProperty(Sprite.prototype, "size", {
        /**
         * Gets or sets the sprite size
         */
        get: function () {
            return this.width;
        },
        set: function (value) {
            this.width = value;
            this.height = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "manager", {
        /**
         * Gets the manager of this sprite
         */
        get: function () {
            return this._manager;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the string "Sprite"
     * @returns "Sprite"
     */
    Sprite.prototype.getClassName = function () {
        return "Sprite";
    };
    Object.defineProperty(Sprite.prototype, "fromIndex", {
        /** Gets or sets the initial key for the animation (setting it will restart the animation)  */
        get: function () {
            return this._fromIndex;
        },
        set: function (value) {
            this.playAnimation(value, this._toIndex, this._loopAnimation, this._delay, this._onAnimationEnd);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "toIndex", {
        /** Gets or sets the end key for the animation (setting it will restart the animation)  */
        get: function () {
            return this._toIndex;
        },
        set: function (value) {
            this.playAnimation(this._fromIndex, value, this._loopAnimation, this._delay, this._onAnimationEnd);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "loopAnimation", {
        /** Gets or sets a boolean indicating if the animation is looping (setting it will restart the animation)  */
        get: function () {
            return this._loopAnimation;
        },
        set: function (value) {
            this.playAnimation(this._fromIndex, this._toIndex, value, this._delay, this._onAnimationEnd);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Sprite.prototype, "delay", {
        /** Gets or sets the delay between cell changes (setting it will restart the animation)  */
        get: function () {
            return Math.max(this._delay, 1);
        },
        set: function (value) {
            this.playAnimation(this._fromIndex, this._toIndex, this._loopAnimation, value, this._onAnimationEnd);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Starts an animation
     * @param from defines the initial key
     * @param to defines the end key
     * @param loop defines if the animation must loop
     * @param delay defines the start delay (in ms)
     * @param onAnimationEnd defines a callback to call when animation ends
     */
    Sprite.prototype.playAnimation = function (from, to, loop, delay, onAnimationEnd) {
        if (onAnimationEnd === void 0) { onAnimationEnd = null; }
        this._onAnimationEnd = onAnimationEnd;
        _super.prototype.playAnimation.call(this, from, to, loop, delay, this._endAnimation);
    };
    /** Release associated resources */
    Sprite.prototype.dispose = function () {
        for (var i = 0; i < this._manager.sprites.length; i++) {
            if (this._manager.sprites[i] == this) {
                this._manager.sprites.splice(i, 1);
            }
        }
        // Callback
        this.onDisposeObservable.notifyObservers(this);
        this.onDisposeObservable.clear();
    };
    /**
     * Serializes the sprite to a JSON object
     * @returns the JSON object
     */
    Sprite.prototype.serialize = function () {
        var serializationObject = {};
        serializationObject.name = this.name;
        serializationObject.position = this.position.asArray();
        serializationObject.color = this.color.asArray();
        serializationObject.width = this.width;
        serializationObject.height = this.height;
        serializationObject.angle = this.angle;
        serializationObject.cellIndex = this.cellIndex;
        serializationObject.cellRef = this.cellRef;
        serializationObject.invertU = this.invertU;
        serializationObject.invertV = this.invertV;
        serializationObject.disposeWhenFinishedAnimating = this.disposeWhenFinishedAnimating;
        serializationObject.isPickable = this.isPickable;
        serializationObject.isVisible = this.isVisible;
        serializationObject.useAlphaForPicking = this.useAlphaForPicking;
        serializationObject.animationStarted = this.animationStarted;
        serializationObject.fromIndex = this.fromIndex;
        serializationObject.toIndex = this.toIndex;
        serializationObject.loopAnimation = this.loopAnimation;
        serializationObject.delay = this.delay;
        return serializationObject;
    };
    /**
     * Parses a JSON object to create a new sprite
     * @param parsedSprite The JSON object to parse
     * @param manager defines the hosting manager
     * @returns the new sprite
     */
    Sprite.Parse = function (parsedSprite, manager) {
        var sprite = new Sprite(parsedSprite.name, manager);
        sprite.position = Vector3.FromArray(parsedSprite.position);
        sprite.color = Color4.FromArray(parsedSprite.color);
        sprite.width = parsedSprite.width;
        sprite.height = parsedSprite.height;
        sprite.angle = parsedSprite.angle;
        sprite.cellIndex = parsedSprite.cellIndex;
        sprite.cellRef = parsedSprite.cellRef;
        sprite.invertU = parsedSprite.invertU;
        sprite.invertV = parsedSprite.invertV;
        sprite.disposeWhenFinishedAnimating = parsedSprite.disposeWhenFinishedAnimating;
        sprite.isPickable = parsedSprite.isPickable;
        sprite.isVisible = parsedSprite.isVisible;
        sprite.useAlphaForPicking = parsedSprite.useAlphaForPicking;
        sprite.fromIndex = parsedSprite.fromIndex;
        sprite.toIndex = parsedSprite.toIndex;
        sprite.loopAnimation = parsedSprite.loopAnimation;
        sprite.delay = parsedSprite.delay;
        if (parsedSprite.animationStarted) {
            sprite.playAnimation(sprite.fromIndex, sprite.toIndex, sprite.loopAnimation, sprite.delay);
        }
        return sprite;
    };
    return Sprite;
}(ThinSprite));
export { Sprite };
//# sourceMappingURL=sprite.js.map