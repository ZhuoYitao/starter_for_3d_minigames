import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
import "../../../Shaders/ShadersInclude/helperFunctions.js";
/**
 * Block used to get a random number
 */
var RandomNumberBlock = /** @class */ (function (_super) {
    __extends(RandomNumberBlock, _super);
    /**
     * Creates a new RandomNumberBlock
     * @param name defines the block name
     */
    function RandomNumberBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("seed", NodeMaterialBlockConnectionPointTypes.Vector2);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Float);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector3);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector4);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Color3);
        _this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Color4);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    RandomNumberBlock.prototype.getClassName = function () {
        return "RandomNumberBlock";
    };
    Object.defineProperty(RandomNumberBlock.prototype, "seed", {
        /**
         * Gets the seed input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RandomNumberBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    RandomNumberBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        var comments = "//".concat(this.name);
        state._emitFunctionFromInclude("helperFunctions", comments);
        state.compilationString += this._declareOutput(output, state) + " = getRand(".concat(this.seed.associatedVariableName, ".xy);\r\n");
        return this;
    };
    return RandomNumberBlock;
}(NodeMaterialBlock));
export { RandomNumberBlock };
RegisterClass("BABYLON.RandomNumberBlock", RandomNumberBlock);
//# sourceMappingURL=randomNumberBlock.js.map