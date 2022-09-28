import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
/**
 * Block used to make gl_FragCoord available
 */
var FragCoordBlock = /** @class */ (function (_super) {
    __extends(FragCoordBlock, _super);
    /**
     * Creates a new FragCoordBlock
     * @param name defines the block name
     */
    function FragCoordBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Fragment) || this;
        _this.registerOutput("xy", NodeMaterialBlockConnectionPointTypes.Vector2, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("xyz", NodeMaterialBlockConnectionPointTypes.Vector3, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("xyzw", NodeMaterialBlockConnectionPointTypes.Vector4, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("x", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("y", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("z", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("w", NodeMaterialBlockConnectionPointTypes.Float, NodeMaterialBlockTargets.Fragment);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    FragCoordBlock.prototype.getClassName = function () {
        return "FragCoordBlock";
    };
    Object.defineProperty(FragCoordBlock.prototype, "xy", {
        /**
         * Gets the xy component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FragCoordBlock.prototype, "xyz", {
        /**
         * Gets the xyz component
         */
        get: function () {
            return this._outputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FragCoordBlock.prototype, "xyzw", {
        /**
         * Gets the xyzw component
         */
        get: function () {
            return this._outputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FragCoordBlock.prototype, "x", {
        /**
         * Gets the x component
         */
        get: function () {
            return this._outputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FragCoordBlock.prototype, "y", {
        /**
         * Gets the y component
         */
        get: function () {
            return this._outputs[4];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FragCoordBlock.prototype, "z", {
        /**
         * Gets the z component
         */
        get: function () {
            return this._outputs[5];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FragCoordBlock.prototype, "output", {
        /**
         * Gets the w component
         */
        get: function () {
            return this._outputs[6];
        },
        enumerable: false,
        configurable: true
    });
    // eslint-disable-next-line @typescript-eslint/naming-convention
    FragCoordBlock.prototype.writeOutputs = function (state) {
        var code = "";
        for (var _i = 0, _a = this._outputs; _i < _a.length; _i++) {
            var output = _a[_i];
            if (output.hasEndpoints) {
                code += "".concat(this._declareOutput(output, state), " = gl_FragCoord.").concat(output.name, ";\r\n");
            }
        }
        return code;
    };
    FragCoordBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        if (state.target === NodeMaterialBlockTargets.Vertex) {
            throw "FragCoordBlock must only be used in a fragment shader";
        }
        state.compilationString += this.writeOutputs(state);
        return this;
    };
    return FragCoordBlock;
}(NodeMaterialBlock));
export { FragCoordBlock };
RegisterClass("BABYLON.FragCoordBlock", FragCoordBlock);
//# sourceMappingURL=fragCoordBlock.js.map