import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialSystemValues } from "../../Enums/nodeMaterialSystemValues.js";
import { InputBlock } from "../Input/inputBlock.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
/**
 * Block used to add support for instances
 * @see https://doc.babylonjs.com/how_to/how_to_use_instances
 */
var InstancesBlock = /** @class */ (function (_super) {
    __extends(InstancesBlock, _super);
    /**
     * Creates a new InstancesBlock
     * @param name defines the block name
     */
    function InstancesBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Vertex) || this;
        _this.registerInput("world0", NodeMaterialBlockConnectionPointTypes.Vector4);
        _this.registerInput("world1", NodeMaterialBlockConnectionPointTypes.Vector4);
        _this.registerInput("world2", NodeMaterialBlockConnectionPointTypes.Vector4);
        _this.registerInput("world3", NodeMaterialBlockConnectionPointTypes.Vector4);
        _this.registerInput("world", NodeMaterialBlockConnectionPointTypes.Matrix, true);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Matrix);
        _this.registerOutput("instanceID", NodeMaterialBlockConnectionPointTypes.Float);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    InstancesBlock.prototype.getClassName = function () {
        return "InstancesBlock";
    };
    Object.defineProperty(InstancesBlock.prototype, "world0", {
        /**
         * Gets the first world row input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InstancesBlock.prototype, "world1", {
        /**
         * Gets the second world row input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InstancesBlock.prototype, "world2", {
        /**
         * Gets the third world row input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InstancesBlock.prototype, "world3", {
        /**
         * Gets the forth world row input component
         */
        get: function () {
            return this._inputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InstancesBlock.prototype, "world", {
        /**
         * Gets the world input component
         */
        get: function () {
            return this._inputs[4];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InstancesBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InstancesBlock.prototype, "instanceID", {
        /**
         * Gets the instanceID component
         */
        get: function () {
            return this._outputs[1];
        },
        enumerable: false,
        configurable: true
    });
    InstancesBlock.prototype.autoConfigure = function (material) {
        if (!this.world0.connectedPoint) {
            var world0Input = material.getInputBlockByPredicate(function (b) { return b.isAttribute && b.name === "world0"; });
            if (!world0Input) {
                world0Input = new InputBlock("world0");
                world0Input.setAsAttribute("world0");
            }
            world0Input.output.connectTo(this.world0);
        }
        if (!this.world1.connectedPoint) {
            var world1Input = material.getInputBlockByPredicate(function (b) { return b.isAttribute && b.name === "world1"; });
            if (!world1Input) {
                world1Input = new InputBlock("world1");
                world1Input.setAsAttribute("world1");
            }
            world1Input.output.connectTo(this.world1);
        }
        if (!this.world2.connectedPoint) {
            var world2Input = material.getInputBlockByPredicate(function (b) { return b.isAttribute && b.name === "world2"; });
            if (!world2Input) {
                world2Input = new InputBlock("world2");
                world2Input.setAsAttribute("world2");
            }
            world2Input.output.connectTo(this.world2);
        }
        if (!this.world3.connectedPoint) {
            var world3Input = material.getInputBlockByPredicate(function (b) { return b.isAttribute && b.name === "world3"; });
            if (!world3Input) {
                world3Input = new InputBlock("world3");
                world3Input.setAsAttribute("world3");
            }
            world3Input.output.connectTo(this.world3);
        }
        if (!this.world.connectedPoint) {
            var worldInput = material.getInputBlockByPredicate(function (b) { return b.isAttribute && b.name === "world"; });
            if (!worldInput) {
                worldInput = new InputBlock("world");
                worldInput.setAsSystemValue(NodeMaterialSystemValues.World);
            }
            worldInput.output.connectTo(this.world);
        }
        this.world.define = "!INSTANCES || THIN_INSTANCES";
    };
    InstancesBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines, useInstances, subMesh) {
        if (useInstances === void 0) { useInstances = false; }
        var changed = false;
        if (defines["INSTANCES"] !== useInstances) {
            defines.setValue("INSTANCES", useInstances);
            changed = true;
        }
        if (subMesh && defines["THIN_INSTANCES"] !== !!(subMesh === null || subMesh === void 0 ? void 0 : subMesh.getRenderingMesh().hasThinInstances)) {
            defines.setValue("THIN_INSTANCES", !!(subMesh === null || subMesh === void 0 ? void 0 : subMesh.getRenderingMesh().hasThinInstances));
            changed = true;
        }
        if (changed) {
            defines.markAsUnprocessed();
        }
    };
    InstancesBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var engine = state.sharedData.scene.getEngine();
        // Register for defines
        state.sharedData.blocksWithDefines.push(this);
        // Emit code
        var output = this._outputs[0];
        var instanceID = this._outputs[1];
        var world0 = this.world0;
        var world1 = this.world1;
        var world2 = this.world2;
        var world3 = this.world3;
        state.compilationString += "#ifdef INSTANCES\r\n";
        state.compilationString +=
            this._declareOutput(output, state) +
                " = mat4(".concat(world0.associatedVariableName, ", ").concat(world1.associatedVariableName, ", ").concat(world2.associatedVariableName, ", ").concat(world3.associatedVariableName, ");\r\n");
        state.compilationString += "#ifdef THIN_INSTANCES\r\n";
        state.compilationString += "".concat(output.associatedVariableName, " = ").concat(this.world.associatedVariableName, " * ").concat(output.associatedVariableName, ";\r\n");
        state.compilationString += "#endif\r\n";
        if (engine._caps.canUseGLInstanceID) {
            state.compilationString += this._declareOutput(instanceID, state) + " = float(gl_InstanceID);\r\n";
        }
        else {
            state.compilationString += this._declareOutput(instanceID, state) + " = 0.0;\r\n";
        }
        state.compilationString += "#else\r\n";
        state.compilationString += this._declareOutput(output, state) + " = ".concat(this.world.associatedVariableName, ";\r\n");
        state.compilationString += this._declareOutput(instanceID, state) + " = 0.0;\r\n";
        state.compilationString += "#endif\r\n";
        return this;
    };
    return InstancesBlock;
}(NodeMaterialBlock));
export { InstancesBlock };
RegisterClass("BABYLON.InstancesBlock", InstancesBlock);
//# sourceMappingURL=instancesBlock.js.map