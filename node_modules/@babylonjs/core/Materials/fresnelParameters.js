import { DeepCopier } from "../Misc/deepCopier.js";
import { Color3 } from "../Maths/math.color.js";
import { Engine } from "../Engines/engine.js";
import { SerializationHelper } from "../Misc/decorators.js";

/**
 * This represents all the required information to add a fresnel effect on a material:
 * @see https://doc.babylonjs.com/divingDeeper/materials/using/fresnelParameters
 */
var FresnelParameters = /** @class */ (function () {
    /**
     * Creates a new FresnelParameters object.
     *
     * @param options provide your own settings to optionally to override defaults
     */
    function FresnelParameters(options) {
        if (options === void 0) { options = {}; }
        this._isEnabled = true;
        this.bias = options.bias === undefined ? 0 : options.bias;
        this.power = options.power === undefined ? 1 : options.power;
        this.leftColor = options.leftColor || Color3.White();
        this.rightColor = options.rightColor || Color3.Black();
        if (options.isEnabled === false) {
            this.isEnabled = false;
        }
    }
    Object.defineProperty(FresnelParameters.prototype, "isEnabled", {
        /**
         * Define if the fresnel effect is enable or not.
         */
        get: function () {
            return this._isEnabled;
        },
        set: function (value) {
            if (this._isEnabled === value) {
                return;
            }
            this._isEnabled = value;
            Engine.MarkAllMaterialsAsDirty(4 | 16);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Clones the current fresnel and its values
     * @returns a clone fresnel configuration
     */
    FresnelParameters.prototype.clone = function () {
        var newFresnelParameters = new FresnelParameters();
        DeepCopier.DeepCopy(this, newFresnelParameters);
        return newFresnelParameters;
    };
    /**
     * Determines equality between FresnelParameters objects
     * @param otherFresnelParameters defines the second operand
     * @returns true if the power, bias, leftColor, rightColor and isEnabled values are equal to the given ones
     */
    FresnelParameters.prototype.equals = function (otherFresnelParameters) {
        return (otherFresnelParameters &&
            this.bias === otherFresnelParameters.bias &&
            this.power === otherFresnelParameters.power &&
            this.leftColor.equals(otherFresnelParameters.leftColor) &&
            this.rightColor.equals(otherFresnelParameters.rightColor) &&
            this.isEnabled === otherFresnelParameters.isEnabled);
    };
    /**
     * Serializes the current fresnel parameters to a JSON representation.
     * @return the JSON serialization
     */
    FresnelParameters.prototype.serialize = function () {
        return {
            isEnabled: this.isEnabled,
            leftColor: this.leftColor.asArray(),
            rightColor: this.rightColor.asArray(),
            bias: this.bias,
            power: this.power,
        };
    };
    /**
     * Parse a JSON object and deserialize it to a new Fresnel parameter object.
     * @param parsedFresnelParameters Define the JSON representation
     * @returns the parsed parameters
     */
    FresnelParameters.Parse = function (parsedFresnelParameters) {
        return new FresnelParameters({
            isEnabled: parsedFresnelParameters.isEnabled,
            leftColor: Color3.FromArray(parsedFresnelParameters.leftColor),
            rightColor: Color3.FromArray(parsedFresnelParameters.rightColor),
            bias: parsedFresnelParameters.bias,
            power: parsedFresnelParameters.power || 1.0,
        });
    };
    return FresnelParameters;
}());
export { FresnelParameters };
// References the dependencies.
SerializationHelper._FresnelParametersParser = FresnelParameters.Parse;
//# sourceMappingURL=fresnelParameters.js.map