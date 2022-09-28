import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialConnectionPointDirection } from "../../nodeMaterialBlockConnectionPoint.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { InputBlock } from "../Input/inputBlock.js";
import { NodeMaterialConnectionPointCustomObject } from "../../nodeMaterialConnectionPointCustomObject.js";
import { PBRIridescenceConfiguration } from "../../../../Materials/PBR/pbrIridescenceConfiguration.js";
/**
 * Block used to implement the iridescence module of the PBR material
 */
var IridescenceBlock = /** @class */ (function (_super) {
    __extends(IridescenceBlock, _super);
    /**
     * Create a new IridescenceBlock
     * @param name defines the block name
     */
    function IridescenceBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Fragment) || this;
        _this._isUnique = true;
        _this.registerInput("intensity", NodeMaterialBlockConnectionPointTypes.Float, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("indexOfRefraction", NodeMaterialBlockConnectionPointTypes.Float, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("thickness", NodeMaterialBlockConnectionPointTypes.Float, true, NodeMaterialBlockTargets.Fragment);
        _this.registerOutput("iridescence", NodeMaterialBlockConnectionPointTypes.Object, NodeMaterialBlockTargets.Fragment, new NodeMaterialConnectionPointCustomObject("iridescence", _this, NodeMaterialConnectionPointDirection.Output, IridescenceBlock, "IridescenceBlock"));
        return _this;
    }
    /**
     * Initialize the block and prepare the context for build
     * @param state defines the state that will be used for the build
     */
    IridescenceBlock.prototype.initialize = function (state) {
        state._excludeVariableName("iridescenceOut");
        state._excludeVariableName("vIridescenceParams");
    };
    /**
     * Gets the current class name
     * @returns the class name
     */
    IridescenceBlock.prototype.getClassName = function () {
        return "IridescenceBlock";
    };
    Object.defineProperty(IridescenceBlock.prototype, "intensity", {
        /**
         * Gets the intensity input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IridescenceBlock.prototype, "indexOfRefraction", {
        /**
         * Gets the indexOfRefraction input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IridescenceBlock.prototype, "thickness", {
        /**
         * Gets the thickness input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IridescenceBlock.prototype, "iridescence", {
        /**
         * Gets the iridescence object output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    IridescenceBlock.prototype.autoConfigure = function () {
        if (!this.intensity.isConnected) {
            var intensityInput = new InputBlock("Iridescence intensity", NodeMaterialBlockTargets.Fragment, NodeMaterialBlockConnectionPointTypes.Float);
            intensityInput.value = 1;
            intensityInput.output.connectTo(this.intensity);
            var indexOfRefractionInput = new InputBlock("Iridescence ior", NodeMaterialBlockTargets.Fragment, NodeMaterialBlockConnectionPointTypes.Float);
            indexOfRefractionInput.value = 1.3;
            indexOfRefractionInput.output.connectTo(this.indexOfRefraction);
            var thicknessInput = new InputBlock("Iridescence thickness", NodeMaterialBlockTargets.Fragment, NodeMaterialBlockConnectionPointTypes.Float);
            thicknessInput.value = 400;
            thicknessInput.output.connectTo(this.thickness);
        }
    };
    IridescenceBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines) {
        _super.prototype.prepareDefines.call(this, mesh, nodeMaterial, defines);
        defines.setValue("IRIDESCENCE", true, true);
        defines.setValue("IRIDESCENCE_TEXTURE", false, true);
        defines.setValue("IRIDESCENCE_THICKNESS_TEXTURE", false, true);
    };
    /**
     * Gets the main code of the block (fragment side)
     * @param iridescenceBlock instance of a IridescenceBlock or null if the code must be generated without an active iridescence module
     * @returns the shader code
     */
    IridescenceBlock.GetCode = function (iridescenceBlock) {
        var code = "";
        var intensityName = (iridescenceBlock === null || iridescenceBlock === void 0 ? void 0 : iridescenceBlock.intensity.isConnected) ? iridescenceBlock.intensity.associatedVariableName : "1.";
        var indexOfRefraction = (iridescenceBlock === null || iridescenceBlock === void 0 ? void 0 : iridescenceBlock.indexOfRefraction.isConnected)
            ? iridescenceBlock.indexOfRefraction.associatedVariableName
            : PBRIridescenceConfiguration._DefaultIndexOfRefraction;
        var thickness = (iridescenceBlock === null || iridescenceBlock === void 0 ? void 0 : iridescenceBlock.thickness.isConnected) ? iridescenceBlock.thickness.associatedVariableName : PBRIridescenceConfiguration._DefaultMaximumThickness;
        code += "iridescenceOutParams iridescenceOut;\n\n        #ifdef IRIDESCENCE\n            iridescenceBlock(\n                vec4(".concat(intensityName, ", ").concat(indexOfRefraction, ", 1., ").concat(thickness, "),\n                NdotV,\n                specularEnvironmentR0,\n                #ifdef CLEARCOAT\n                    NdotVUnclamped,\n                #endif\n                iridescenceOut\n            );\n\n            float iridescenceIntensity = iridescenceOut.iridescenceIntensity;\n            specularEnvironmentR0 = iridescenceOut.specularEnvironmentR0;\n        #endif\r\n");
        return code;
    };
    IridescenceBlock.prototype._buildBlock = function (state) {
        if (state.target === NodeMaterialBlockTargets.Fragment) {
            state.sharedData.bindableBlocks.push(this);
            state.sharedData.blocksWithDefines.push(this);
        }
        return this;
    };
    IridescenceBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        return serializationObject;
    };
    IridescenceBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
    };
    return IridescenceBlock;
}(NodeMaterialBlock));
export { IridescenceBlock };
RegisterClass("BABYLON.IridescenceBlock", IridescenceBlock);
//# sourceMappingURL=iridescenceBlock.js.map