import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
import { InputBlock } from "./Input/inputBlock.js";
/**
 * Block used to rotate a 2d vector by a given angle
 */
var Rotate2dBlock = /** @class */ (function (_super) {
    __extends(Rotate2dBlock, _super);
    /**
     * Creates a new Rotate2dBlock
     * @param name defines the block name
     */
    function Rotate2dBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("input", NodeMaterialBlockConnectionPointTypes.Vector2);
        _this.registerInput("angle", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Vector2);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    Rotate2dBlock.prototype.getClassName = function () {
        return "Rotate2dBlock";
    };
    Object.defineProperty(Rotate2dBlock.prototype, "input", {
        /**
         * Gets the input vector
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rotate2dBlock.prototype, "angle", {
        /**
         * Gets the input angle
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rotate2dBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Rotate2dBlock.prototype.autoConfigure = function () {
        if (!this.angle.isConnected) {
            var angleInput = new InputBlock("angle");
            angleInput.value = 0;
            angleInput.output.connectTo(this.angle);
        }
    };
    Rotate2dBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        var angle = this.angle;
        var input = this.input;
        state.compilationString +=
            this._declareOutput(output, state) +
                " = vec2(cos(".concat(angle.associatedVariableName, ") * ").concat(input.associatedVariableName, ".x - sin(").concat(angle.associatedVariableName, ") * ").concat(input.associatedVariableName, ".y, sin(").concat(angle.associatedVariableName, ") * ").concat(input.associatedVariableName, ".x + cos(").concat(angle.associatedVariableName, ") * ").concat(input.associatedVariableName, ".y);\r\n");
        return this;
    };
    return Rotate2dBlock;
}(NodeMaterialBlock));
export { Rotate2dBlock };
RegisterClass("BABYLON.Rotate2dBlock", Rotate2dBlock);
//# sourceMappingURL=rotate2dBlock.js.map