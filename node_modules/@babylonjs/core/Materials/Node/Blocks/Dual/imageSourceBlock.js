import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialConnectionPointDirection } from "../../nodeMaterialBlockConnectionPoint.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { Texture } from "../../../Textures/texture.js";

import { NodeMaterial } from "../../nodeMaterial.js";
import { NodeMaterialConnectionPointCustomObject } from "../../nodeMaterialConnectionPointCustomObject.js";
import { EngineStore } from "../../../../Engines/engineStore.js";
/**
 * Block used to provide an image for a TextureBlock
 */
var ImageSourceBlock = /** @class */ (function (_super) {
    __extends(ImageSourceBlock, _super);
    /**
     * Creates a new ImageSourceBlock
     * @param name defines the block name
     */
    function ImageSourceBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.VertexAndFragment) || this;
        _this.registerOutput("source", NodeMaterialBlockConnectionPointTypes.Object, NodeMaterialBlockTargets.VertexAndFragment, new NodeMaterialConnectionPointCustomObject("source", _this, NodeMaterialConnectionPointDirection.Output, ImageSourceBlock, "ImageSourceBlock"));
        return _this;
    }
    Object.defineProperty(ImageSourceBlock.prototype, "texture", {
        /**
         * Gets or sets the texture associated with the node
         */
        get: function () {
            return this._texture;
        },
        set: function (texture) {
            var _this = this;
            var _a;
            if (this._texture === texture) {
                return;
            }
            var scene = (_a = texture === null || texture === void 0 ? void 0 : texture.getScene()) !== null && _a !== void 0 ? _a : EngineStore.LastCreatedScene;
            if (!texture && scene) {
                scene.markAllMaterialsAsDirty(1, function (mat) {
                    return mat.hasTexture(_this._texture);
                });
            }
            this._texture = texture;
            if (texture && scene) {
                scene.markAllMaterialsAsDirty(1, function (mat) {
                    return mat.hasTexture(texture);
                });
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ImageSourceBlock.prototype, "samplerName", {
        /**
         * Gets the sampler name associated with this image source
         */
        get: function () {
            return this._samplerName;
        },
        enumerable: false,
        configurable: true
    });
    ImageSourceBlock.prototype.bind = function (effect) {
        if (!this.texture) {
            return;
        }
        effect.setTexture(this._samplerName, this.texture);
    };
    ImageSourceBlock.prototype.isReady = function () {
        if (this.texture && !this.texture.isReadyOrNotBlocking()) {
            return false;
        }
        return true;
    };
    /**
     * Gets the current class name
     * @returns the class name
     */
    ImageSourceBlock.prototype.getClassName = function () {
        return "ImageSourceBlock";
    };
    Object.defineProperty(ImageSourceBlock.prototype, "source", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    ImageSourceBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        if (state.target === NodeMaterialBlockTargets.Vertex) {
            this._samplerName = state._getFreeVariableName(this.name + "Sampler");
            // Declarations
            state.sharedData.blockingBlocks.push(this);
            state.sharedData.textureBlocks.push(this);
            state.sharedData.bindableBlocks.push(this);
        }
        state._emit2DSampler(this._samplerName);
        return this;
    };
    ImageSourceBlock.prototype._dumpPropertiesCode = function () {
        var codeString = _super.prototype._dumpPropertiesCode.call(this);
        if (!this.texture) {
            return codeString;
        }
        codeString += "".concat(this._codeVariableName, ".texture = new BABYLON.Texture(\"").concat(this.texture.name, "\", null, ").concat(this.texture.noMipmap, ", ").concat(this.texture.invertY, ", ").concat(this.texture.samplingMode, ");\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.wrapU = ").concat(this.texture.wrapU, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.wrapV = ").concat(this.texture.wrapV, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.uAng = ").concat(this.texture.uAng, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.vAng = ").concat(this.texture.vAng, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.wAng = ").concat(this.texture.wAng, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.uOffset = ").concat(this.texture.uOffset, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.vOffset = ").concat(this.texture.vOffset, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.uScale = ").concat(this.texture.uScale, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.vScale = ").concat(this.texture.vScale, ";\r\n");
        codeString += "".concat(this._codeVariableName, ".texture.coordinatesMode = ").concat(this.texture.coordinatesMode, ";\r\n");
        return codeString;
    };
    ImageSourceBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        if (this.texture && !this.texture.isRenderTarget && this.texture.getClassName() !== "VideoTexture") {
            serializationObject.texture = this.texture.serialize();
        }
        return serializationObject;
    };
    ImageSourceBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        if (serializationObject.texture && !NodeMaterial.IgnoreTexturesAtLoadTime && serializationObject.texture.url !== undefined) {
            rootUrl = serializationObject.texture.url.indexOf("data:") === 0 ? "" : rootUrl;
            this.texture = Texture.Parse(serializationObject.texture, scene, rootUrl);
        }
    };
    return ImageSourceBlock;
}(NodeMaterialBlock));
export { ImageSourceBlock };
RegisterClass("BABYLON.ImageSourceBlock", ImageSourceBlock);
//# sourceMappingURL=imageSourceBlock.js.map