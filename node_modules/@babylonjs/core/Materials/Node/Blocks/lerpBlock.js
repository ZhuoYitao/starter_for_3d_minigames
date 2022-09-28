import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to lerp between 2 values
 */
var LerpBlock = /** @class */ (function (_super) {
    __extends(LerpBlock, _super);
    /**
     * Creates a new LerpBlock
     * @param name defines the block name
     */
    function LerpBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("left", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerInput("right", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerInput("gradient", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.BasedOnInput);
        _this._outputs[0]._typeConnectionSource = _this._inputs[0];
        _this._linkConnectionTypes(0, 1);
        _this._linkConnectionTypes(1, 2, true);
        _this._inputs[2].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Float);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    LerpBlock.prototype.getClassName = function () {
        return "LerpBlock";
    };
    Object.defineProperty(LerpBlock.prototype, "left", {
        /**
         * Gets the left operand input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LerpBlock.prototype, "right", {
        /**
         * Gets the right operand input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LerpBlock.prototype, "gradient", {
        /**
         * Gets the gradient operand input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LerpBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    LerpBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        state.compilationString +=
            this._declareOutput(output, state) + " = mix(".concat(this.left.associatedVariableName, " , ").concat(this.right.associatedVariableName, ", ").concat(this.gradient.associatedVariableName, ");\r\n");
        return this;
    };
    return LerpBlock;
}(NodeMaterialBlock));
export { LerpBlock };
RegisterClass("BABYLON.LerpBlock", LerpBlock);
//# sourceMappingURL=lerpBlock.js.map