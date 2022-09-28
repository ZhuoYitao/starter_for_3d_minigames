import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to desaturate a color
 */
var DesaturateBlock = /** @class */ (function (_super) {
    __extends(DesaturateBlock, _super);
    /**
     * Creates a new DesaturateBlock
     * @param name defines the block name
     */
    function DesaturateBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("color", NodeMaterialBlockConnectionPointTypes.Color3);
        _this.registerInput("level", NodeMaterialBlockConnectionPointTypes.Float);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Color3);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    DesaturateBlock.prototype.getClassName = function () {
        return "DesaturateBlock";
    };
    Object.defineProperty(DesaturateBlock.prototype, "color", {
        /**
         * Gets the color operand input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DesaturateBlock.prototype, "level", {
        /**
         * Gets the level operand input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DesaturateBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    DesaturateBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        var color = this.color;
        var colorName = color.associatedVariableName;
        var tempMin = state._getFreeVariableName("colorMin");
        var tempMax = state._getFreeVariableName("colorMax");
        var tempMerge = state._getFreeVariableName("colorMerge");
        state.compilationString += "float ".concat(tempMin, " = min(min(").concat(colorName, ".x, ").concat(colorName, ".y), ").concat(colorName, ".z);\r\n");
        state.compilationString += "float ".concat(tempMax, " = max(max(").concat(colorName, ".x, ").concat(colorName, ".y), ").concat(colorName, ".z);\r\n");
        state.compilationString += "float ".concat(tempMerge, " = 0.5 * (").concat(tempMin, " + ").concat(tempMax, ");\r\n");
        state.compilationString +=
            this._declareOutput(output, state) + " = mix(".concat(colorName, ", vec3(").concat(tempMerge, ", ").concat(tempMerge, ", ").concat(tempMerge, "), ").concat(this.level.associatedVariableName, ");\r\n");
        return this;
    };
    return DesaturateBlock;
}(NodeMaterialBlock));
export { DesaturateBlock };
RegisterClass("BABYLON.DesaturateBlock", DesaturateBlock);
//# sourceMappingURL=desaturateBlock.js.map