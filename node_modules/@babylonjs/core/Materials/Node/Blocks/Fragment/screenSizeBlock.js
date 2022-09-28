import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
/**
 * Block used to get the screen sizes
 */
var ScreenSizeBlock = /** @class */ (function (_super) {
    __extends(ScreenSizeBlock, _super);
    /**
     * Creates a new ScreenSizeBlock
     * @param name defines the block name
     */
    function ScreenSizeBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Fragment) || this;
        _this.registerOutput("xy", NodeMaterialBlockConnectionPointTypes.Vector2, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("x", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("y", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Fragment);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    ScreenSizeBlock.prototype.getClassName = function () {
        return "ScreenSizeBlock";
    };
    Object.defineProperty(ScreenSizeBlock.prototype, "xy", {
        /**
         * Gets the xy component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScreenSizeBlock.prototype, "x", {
        /**
         * Gets the x component
         */
        get: function () {
            return this._outputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScreenSizeBlock.prototype, "y", {
        /**
         * Gets the y component
         */
        get: function () {
            return this._outputs[2];
        },
        enumerable: false,
        configurable: true
    });
    ScreenSizeBlock.prototype.bind = function (effect) {
        var engine = this._scene.getEngine();
        effect.setFloat2(this._varName, engine.getRenderWidth(), engine.getRenderHeight());
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ScreenSizeBlock.prototype.writeOutputs = function (state, varName) {
        var code = "";
        for (var _i = 0, _a = this._outputs; _i < _a.length; _i++) {
            var output = _a[_i];
            if (output.hasEndpoints) {
                code += "".concat(this._declareOutput(output, state), " = ").concat(varName, ".").concat(output.name, ";\r\n");
            }
        }
        return code;
    };
    ScreenSizeBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        this._scene = state.sharedData.scene;
        if (state.target === NodeMaterialBlockTargets.Vertex) {
            throw "ScreenSizeBlock must only be used in a fragment shader";
        }
        state.sharedData.bindableBlocks.push(this);
        this._varName = state._getFreeVariableName("screenSize");
        state._emitUniformFromString(this._varName, "vec2");
        state.compilationString += this.writeOutputs(state, this._varName);
        return this;
    };
    return ScreenSizeBlock;
}(NodeMaterialBlock));
export { ScreenSizeBlock };
RegisterClass("BABYLON.ScreenSizeBlock", ScreenSizeBlock);
//# sourceMappingURL=screenSizeBlock.js.map