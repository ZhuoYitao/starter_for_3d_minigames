import { __awaiter, __generator } from "tslib";
import { RawTexture } from "../Materials/Textures/rawTexture.js";
import { Texture } from "../Materials/Textures/texture.js";
import { EncodeArrayBufferToBase64, DecodeBase64ToBinary } from "../Misc/stringTools.js";

/**
 * Class to bake vertex animation textures.
 * @since 5.0
 */
var VertexAnimationBaker = /** @class */ (function () {
    /**
     * Create a new VertexAnimationBaker object which can help baking animations into a texture.
     * @param scene Defines the scene the VAT belongs to
     * @param mesh Defines the mesh the VAT belongs to
     */
    function VertexAnimationBaker(scene, mesh) {
        this._scene = scene;
        this._mesh = mesh;
    }
    /**
     * Bakes the animation into the texture. This should be called once, when the
     * scene starts, so the VAT is generated and associated to the mesh.
     * @param ranges Defines the ranges in the animation that will be baked.
     * @returns The array of matrix transforms for each vertex (columns) and frame (rows), as a Float32Array.
     */
    VertexAnimationBaker.prototype.bakeVertexData = function (ranges) {
        return __awaiter(this, void 0, void 0, function () {
            var boneCount, frameCount, textureIndex, textureSize, vertexData, _i, ranges_1, range, frameIndex;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._mesh.skeleton) {
                            throw new Error("No skeleton in this mesh.");
                        }
                        boneCount = this._mesh.skeleton.bones.length;
                        frameCount = ranges.reduce(function (previous, current) { return previous + current.to - current.from + 1; }, 0);
                        if (isNaN(frameCount)) {
                            throw new Error("Invalid animation ranges.");
                        }
                        textureIndex = 0;
                        textureSize = (boneCount + 1) * 4 * 4 * frameCount;
                        vertexData = new Float32Array(textureSize);
                        this._scene.stopAnimation(this._mesh);
                        this._mesh.skeleton.returnToRest();
                        _i = 0, ranges_1 = ranges;
                        _a.label = 1;
                    case 1:
                        if (!(_i < ranges_1.length)) return [3 /*break*/, 6];
                        range = ranges_1[_i];
                        frameIndex = range.from;
                        _a.label = 2;
                    case 2:
                        if (!(frameIndex <= range.to)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._executeAnimationFrame(vertexData, frameIndex, textureIndex++)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        frameIndex++;
                        return [3 /*break*/, 2];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, vertexData];
                }
            });
        });
    };
    /**
     * Runs an animation frame and stores its vertex data
     *
     * @param vertexData The array to save data to.
     * @param frameIndex Current frame in the skeleton animation to render.
     * @param textureIndex Current index of the texture data.
     */
    VertexAnimationBaker.prototype._executeAnimationFrame = function (vertexData, frameIndex, textureIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, _reject) {
                        _this._scene.beginAnimation(_this._mesh.skeleton, frameIndex, frameIndex, false, 1.0, function () {
                            // generate matrices
                            var skeletonMatrices = _this._mesh.skeleton.getTransformMatrices(_this._mesh);
                            vertexData.set(skeletonMatrices, textureIndex * skeletonMatrices.length);
                            resolve();
                        });
                    })];
            });
        });
    };
    /**
     * Builds a vertex animation texture given the vertexData in an array.
     * @param vertexData The vertex animation data. You can generate it with bakeVertexData().
     * @returns The vertex animation texture to be used with BakedVertexAnimationManager.
     */
    VertexAnimationBaker.prototype.textureFromBakedVertexData = function (vertexData) {
        if (!this._mesh.skeleton) {
            throw new Error("No skeleton in this mesh.");
        }
        var boneCount = this._mesh.skeleton.bones.length;
        var texture = RawTexture.CreateRGBATexture(vertexData, (boneCount + 1) * 4, vertexData.length / ((boneCount + 1) * 4 * 4), this._scene, false, false, Texture.NEAREST_NEAREST, 1);
        texture.name = "VAT" + this._mesh.skeleton.name;
        return texture;
    };
    /**
     * Serializes our vertexData to an object, with a nice string for the vertexData.
     * @param vertexData The vertex array data.
     * @returns This object serialized to a JS dict.
     */
    VertexAnimationBaker.prototype.serializeBakedVertexDataToObject = function (vertexData) {
        if (!this._mesh.skeleton) {
            throw new Error("No skeleton in this mesh.");
        }
        // this converts the float array to a serialized base64 string, ~1.3x larger
        // than the original.
        var boneCount = this._mesh.skeleton.bones.length;
        var width = (boneCount + 1) * 4;
        var height = vertexData.length / ((boneCount + 1) * 4 * 4);
        var data = {
            vertexData: EncodeArrayBufferToBase64(vertexData),
            width: width,
            height: height,
        };
        return data;
    };
    /**
     * Loads previously baked data.
     * @param data The object as serialized by serializeBakedVertexDataToObject()
     * @returns The array of matrix transforms for each vertex (columns) and frame (rows), as a Float32Array.
     */
    VertexAnimationBaker.prototype.loadBakedVertexDataFromObject = function (data) {
        return new Float32Array(DecodeBase64ToBinary(data.vertexData));
    };
    /**
     * Serializes our vertexData to a JSON string, with a nice string for the vertexData.
     * Should be called right after bakeVertexData().
     * @param vertexData The vertex array data.
     * @returns This object serialized to a safe string.
     */
    VertexAnimationBaker.prototype.serializeBakedVertexDataToJSON = function (vertexData) {
        return JSON.stringify(this.serializeBakedVertexDataToObject(vertexData));
    };
    /**
     * Loads previously baked data in string format.
     * @param json The json string as serialized by serializeBakedVertexDataToJSON().
     * @returns The array of matrix transforms for each vertex (columns) and frame (rows), as a Float32Array.
     */
    VertexAnimationBaker.prototype.loadBakedVertexDataFromJSON = function (json) {
        return this.loadBakedVertexDataFromObject(JSON.parse(json));
    };
    return VertexAnimationBaker;
}());
export { VertexAnimationBaker };
//# sourceMappingURL=vertexAnimationBaker.js.map