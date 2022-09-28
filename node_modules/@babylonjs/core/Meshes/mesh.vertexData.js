import { __decorate, __generator } from "tslib";
import { Vector3, Vector4, TmpVectors } from "../Maths/math.vector.js";
import { VertexBuffer } from "../Buffers/buffer.js";
import { _WarnImport } from "../Misc/devTools.js";
import { Color4 } from "../Maths/math.color.js";
import { Logger } from "../Misc/logger.js";
import { nativeOverride } from "../Misc/decorators.js";
import { makeSyncFunction, runCoroutineSync } from "../Misc/coroutine.js";
import { RuntimeError, ErrorCodes } from "../Misc/error.js";
/**
 * This class contains the various kinds of data on every vertex of a mesh used in determining its shape and appearance
 */
var VertexData = /** @class */ (function () {
    function VertexData() {
        this._applyTo = makeSyncFunction(this._applyToCoroutine.bind(this));
    }
    /**
     * Uses the passed data array to set the set the values for the specified kind of data
     * @param data a linear array of floating numbers
     * @param kind the type of data that is being set, eg positions, colors etc
     */
    VertexData.prototype.set = function (data, kind) {
        if (!data.length) {
            Logger.Warn("Setting vertex data kind '".concat(kind, "' with an empty array"));
        }
        switch (kind) {
            case VertexBuffer.PositionKind:
                this.positions = data;
                break;
            case VertexBuffer.NormalKind:
                this.normals = data;
                break;
            case VertexBuffer.TangentKind:
                this.tangents = data;
                break;
            case VertexBuffer.UVKind:
                this.uvs = data;
                break;
            case VertexBuffer.UV2Kind:
                this.uvs2 = data;
                break;
            case VertexBuffer.UV3Kind:
                this.uvs3 = data;
                break;
            case VertexBuffer.UV4Kind:
                this.uvs4 = data;
                break;
            case VertexBuffer.UV5Kind:
                this.uvs5 = data;
                break;
            case VertexBuffer.UV6Kind:
                this.uvs6 = data;
                break;
            case VertexBuffer.ColorKind:
                this.colors = data;
                break;
            case VertexBuffer.MatricesIndicesKind:
                this.matricesIndices = data;
                break;
            case VertexBuffer.MatricesWeightsKind:
                this.matricesWeights = data;
                break;
            case VertexBuffer.MatricesIndicesExtraKind:
                this.matricesIndicesExtra = data;
                break;
            case VertexBuffer.MatricesWeightsExtraKind:
                this.matricesWeightsExtra = data;
                break;
        }
    };
    /**
     * Associates the vertexData to the passed Mesh.
     * Sets it as updatable or not (default `false`)
     * @param mesh the mesh the vertexData is applied to
     * @param updatable when used and having the value true allows new data to update the vertexData
     * @returns the VertexData
     */
    VertexData.prototype.applyToMesh = function (mesh, updatable) {
        this._applyTo(mesh, updatable, false);
        return this;
    };
    /**
     * Associates the vertexData to the passed Geometry.
     * Sets it as updatable or not (default `false`)
     * @param geometry the geometry the vertexData is applied to
     * @param updatable when used and having the value true allows new data to update the vertexData
     * @returns VertexData
     */
    VertexData.prototype.applyToGeometry = function (geometry, updatable) {
        this._applyTo(geometry, updatable, false);
        return this;
    };
    /**
     * Updates the associated mesh
     * @param mesh the mesh to be updated
     * @returns VertexData
     */
    VertexData.prototype.updateMesh = function (mesh) {
        this._update(mesh);
        return this;
    };
    /**
     * Updates the associated geometry
     * @param geometry the geometry to be updated
     * @returns VertexData.
     */
    VertexData.prototype.updateGeometry = function (geometry) {
        this._update(geometry);
        return this;
    };
    /**
     * @param meshOrGeometry
     * @param updatable
     * @param isAsync
     * @hidden
     */
    VertexData.prototype._applyToCoroutine = function (meshOrGeometry, updatable, isAsync) {
        if (updatable === void 0) { updatable = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!this.positions) return [3 /*break*/, 2];
                    meshOrGeometry.setVerticesData(VertexBuffer.PositionKind, this.positions, updatable);
                    if (!isAsync) return [3 /*break*/, 2];
                    return [4 /*yield*/];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (!this.normals) return [3 /*break*/, 4];
                    meshOrGeometry.setVerticesData(VertexBuffer.NormalKind, this.normals, updatable);
                    if (!isAsync) return [3 /*break*/, 4];
                    return [4 /*yield*/];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    if (!this.tangents) return [3 /*break*/, 6];
                    meshOrGeometry.setVerticesData(VertexBuffer.TangentKind, this.tangents, updatable);
                    if (!isAsync) return [3 /*break*/, 6];
                    return [4 /*yield*/];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    if (!this.uvs) return [3 /*break*/, 8];
                    meshOrGeometry.setVerticesData(VertexBuffer.UVKind, this.uvs, updatable);
                    if (!isAsync) return [3 /*break*/, 8];
                    return [4 /*yield*/];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    if (!this.uvs2) return [3 /*break*/, 10];
                    meshOrGeometry.setVerticesData(VertexBuffer.UV2Kind, this.uvs2, updatable);
                    if (!isAsync) return [3 /*break*/, 10];
                    return [4 /*yield*/];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10:
                    if (!this.uvs3) return [3 /*break*/, 12];
                    meshOrGeometry.setVerticesData(VertexBuffer.UV3Kind, this.uvs3, updatable);
                    if (!isAsync) return [3 /*break*/, 12];
                    return [4 /*yield*/];
                case 11:
                    _a.sent();
                    _a.label = 12;
                case 12:
                    if (!this.uvs4) return [3 /*break*/, 14];
                    meshOrGeometry.setVerticesData(VertexBuffer.UV4Kind, this.uvs4, updatable);
                    if (!isAsync) return [3 /*break*/, 14];
                    return [4 /*yield*/];
                case 13:
                    _a.sent();
                    _a.label = 14;
                case 14:
                    if (!this.uvs5) return [3 /*break*/, 16];
                    meshOrGeometry.setVerticesData(VertexBuffer.UV5Kind, this.uvs5, updatable);
                    if (!isAsync) return [3 /*break*/, 16];
                    return [4 /*yield*/];
                case 15:
                    _a.sent();
                    _a.label = 16;
                case 16:
                    if (!this.uvs6) return [3 /*break*/, 18];
                    meshOrGeometry.setVerticesData(VertexBuffer.UV6Kind, this.uvs6, updatable);
                    if (!isAsync) return [3 /*break*/, 18];
                    return [4 /*yield*/];
                case 17:
                    _a.sent();
                    _a.label = 18;
                case 18:
                    if (!this.colors) return [3 /*break*/, 20];
                    meshOrGeometry.setVerticesData(VertexBuffer.ColorKind, this.colors, updatable);
                    if (!isAsync) return [3 /*break*/, 20];
                    return [4 /*yield*/];
                case 19:
                    _a.sent();
                    _a.label = 20;
                case 20:
                    if (!this.matricesIndices) return [3 /*break*/, 22];
                    meshOrGeometry.setVerticesData(VertexBuffer.MatricesIndicesKind, this.matricesIndices, updatable);
                    if (!isAsync) return [3 /*break*/, 22];
                    return [4 /*yield*/];
                case 21:
                    _a.sent();
                    _a.label = 22;
                case 22:
                    if (!this.matricesWeights) return [3 /*break*/, 24];
                    meshOrGeometry.setVerticesData(VertexBuffer.MatricesWeightsKind, this.matricesWeights, updatable);
                    if (!isAsync) return [3 /*break*/, 24];
                    return [4 /*yield*/];
                case 23:
                    _a.sent();
                    _a.label = 24;
                case 24:
                    if (!this.matricesIndicesExtra) return [3 /*break*/, 26];
                    meshOrGeometry.setVerticesData(VertexBuffer.MatricesIndicesExtraKind, this.matricesIndicesExtra, updatable);
                    if (!isAsync) return [3 /*break*/, 26];
                    return [4 /*yield*/];
                case 25:
                    _a.sent();
                    _a.label = 26;
                case 26:
                    if (!this.matricesWeightsExtra) return [3 /*break*/, 28];
                    meshOrGeometry.setVerticesData(VertexBuffer.MatricesWeightsExtraKind, this.matricesWeightsExtra, updatable);
                    if (!isAsync) return [3 /*break*/, 28];
                    return [4 /*yield*/];
                case 27:
                    _a.sent();
                    _a.label = 28;
                case 28:
                    if (!this.indices) return [3 /*break*/, 31];
                    meshOrGeometry.setIndices(this.indices, null, updatable);
                    if (!isAsync) return [3 /*break*/, 30];
                    return [4 /*yield*/];
                case 29:
                    _a.sent();
                    _a.label = 30;
                case 30: return [3 /*break*/, 32];
                case 31:
                    meshOrGeometry.setIndices([], null);
                    _a.label = 32;
                case 32: return [2 /*return*/, this];
            }
        });
    };
    VertexData.prototype._update = function (meshOrGeometry, updateExtends, makeItUnique) {
        if (this.positions) {
            meshOrGeometry.updateVerticesData(VertexBuffer.PositionKind, this.positions, updateExtends, makeItUnique);
        }
        if (this.normals) {
            meshOrGeometry.updateVerticesData(VertexBuffer.NormalKind, this.normals, updateExtends, makeItUnique);
        }
        if (this.tangents) {
            meshOrGeometry.updateVerticesData(VertexBuffer.TangentKind, this.tangents, updateExtends, makeItUnique);
        }
        if (this.uvs) {
            meshOrGeometry.updateVerticesData(VertexBuffer.UVKind, this.uvs, updateExtends, makeItUnique);
        }
        if (this.uvs2) {
            meshOrGeometry.updateVerticesData(VertexBuffer.UV2Kind, this.uvs2, updateExtends, makeItUnique);
        }
        if (this.uvs3) {
            meshOrGeometry.updateVerticesData(VertexBuffer.UV3Kind, this.uvs3, updateExtends, makeItUnique);
        }
        if (this.uvs4) {
            meshOrGeometry.updateVerticesData(VertexBuffer.UV4Kind, this.uvs4, updateExtends, makeItUnique);
        }
        if (this.uvs5) {
            meshOrGeometry.updateVerticesData(VertexBuffer.UV5Kind, this.uvs5, updateExtends, makeItUnique);
        }
        if (this.uvs6) {
            meshOrGeometry.updateVerticesData(VertexBuffer.UV6Kind, this.uvs6, updateExtends, makeItUnique);
        }
        if (this.colors) {
            meshOrGeometry.updateVerticesData(VertexBuffer.ColorKind, this.colors, updateExtends, makeItUnique);
        }
        if (this.matricesIndices) {
            meshOrGeometry.updateVerticesData(VertexBuffer.MatricesIndicesKind, this.matricesIndices, updateExtends, makeItUnique);
        }
        if (this.matricesWeights) {
            meshOrGeometry.updateVerticesData(VertexBuffer.MatricesWeightsKind, this.matricesWeights, updateExtends, makeItUnique);
        }
        if (this.matricesIndicesExtra) {
            meshOrGeometry.updateVerticesData(VertexBuffer.MatricesIndicesExtraKind, this.matricesIndicesExtra, updateExtends, makeItUnique);
        }
        if (this.matricesWeightsExtra) {
            meshOrGeometry.updateVerticesData(VertexBuffer.MatricesWeightsExtraKind, this.matricesWeightsExtra, updateExtends, makeItUnique);
        }
        if (this.indices) {
            meshOrGeometry.setIndices(this.indices, null);
        }
        return this;
    };
    VertexData._TransformVector3Coordinates = function (coordinates, transformation, offset, length) {
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = coordinates.length; }
        var coordinate = TmpVectors.Vector3[0];
        var transformedCoordinate = TmpVectors.Vector3[1];
        for (var index = offset; index < offset + length; index += 3) {
            Vector3.FromArrayToRef(coordinates, index, coordinate);
            Vector3.TransformCoordinatesToRef(coordinate, transformation, transformedCoordinate);
            coordinates[index] = transformedCoordinate.x;
            coordinates[index + 1] = transformedCoordinate.y;
            coordinates[index + 2] = transformedCoordinate.z;
        }
    };
    VertexData._TransformVector3Normals = function (normals, transformation, offset, length) {
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = normals.length; }
        var normal = TmpVectors.Vector3[0];
        var transformedNormal = TmpVectors.Vector3[1];
        for (var index = offset; index < offset + length; index += 3) {
            Vector3.FromArrayToRef(normals, index, normal);
            Vector3.TransformNormalToRef(normal, transformation, transformedNormal);
            normals[index] = transformedNormal.x;
            normals[index + 1] = transformedNormal.y;
            normals[index + 2] = transformedNormal.z;
        }
    };
    VertexData._TransformVector4Normals = function (normals, transformation, offset, length) {
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = normals.length; }
        var normal = TmpVectors.Vector4[0];
        var transformedNormal = TmpVectors.Vector4[1];
        for (var index = offset; index < offset + length; index += 4) {
            Vector4.FromArrayToRef(normals, index, normal);
            Vector4.TransformNormalToRef(normal, transformation, transformedNormal);
            normals[index] = transformedNormal.x;
            normals[index + 1] = transformedNormal.y;
            normals[index + 2] = transformedNormal.z;
            normals[index + 3] = transformedNormal.w;
        }
    };
    VertexData._FlipFaces = function (indices, offset, length) {
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = indices.length; }
        for (var index = offset; index < offset + length; index += 3) {
            var tmp = indices[index + 1];
            indices[index + 1] = indices[index + 2];
            indices[index + 2] = tmp;
        }
    };
    /**
     * Transforms each position and each normal of the vertexData according to the passed Matrix
     * @param matrix the transforming matrix
     * @returns the VertexData
     */
    VertexData.prototype.transform = function (matrix) {
        var flip = matrix.determinant() < 0;
        if (this.positions) {
            VertexData._TransformVector3Coordinates(this.positions, matrix);
        }
        if (this.normals) {
            VertexData._TransformVector3Normals(this.normals, matrix);
        }
        if (this.tangents) {
            VertexData._TransformVector4Normals(this.tangents, matrix);
        }
        if (flip && this.indices) {
            VertexData._FlipFaces(this.indices);
        }
        return this;
    };
    /**
     * Merges the passed VertexData into the current one
     * @param others the VertexData to be merged into the current one
     * @param use32BitsIndices defines a boolean indicating if indices must be store in a 32 bits array
     * @param forceCloneIndices defines a boolean indicating if indices are forced to be cloned
     * @returns the modified VertexData
     */
    VertexData.prototype.merge = function (others, use32BitsIndices, forceCloneIndices) {
        if (use32BitsIndices === void 0) { use32BitsIndices = false; }
        if (forceCloneIndices === void 0) { forceCloneIndices = false; }
        var vertexDatas = Array.isArray(others) ? others.map(function (other) { return [other, undefined]; }) : [[others, undefined]];
        return runCoroutineSync(this._mergeCoroutine(undefined, vertexDatas, use32BitsIndices, false, forceCloneIndices));
    };
    /**
     * @param transform
     * @param vertexDatas
     * @param use32BitsIndices
     * @param isAsync
     * @param forceCloneIndices
     * @hidden
     */
    VertexData.prototype._mergeCoroutine = function (transform, vertexDatas, use32BitsIndices, isAsync, forceCloneIndices) {
        var others, _i, others_1, other, totalIndices, sliceIndices, indices, indicesOffset, temp, positionsOffset, _a, vertexDatas_1, _b, other, transform_1, index;
        var _this = this;
        var _c, _d, _e, _f;
        if (use32BitsIndices === void 0) { use32BitsIndices = false; }
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    this._validate();
                    others = vertexDatas.map(function (vertexData) { return vertexData[0]; });
                    for (_i = 0, others_1 = others; _i < others_1.length; _i++) {
                        other = others_1[_i];
                        other._validate();
                        if (!this.normals !== !other.normals ||
                            !this.tangents !== !other.tangents ||
                            !this.uvs !== !other.uvs ||
                            !this.uvs2 !== !other.uvs2 ||
                            !this.uvs3 !== !other.uvs3 ||
                            !this.uvs4 !== !other.uvs4 ||
                            !this.uvs5 !== !other.uvs5 ||
                            !this.uvs6 !== !other.uvs6 ||
                            !this.colors !== !other.colors ||
                            !this.matricesIndices !== !other.matricesIndices ||
                            !this.matricesWeights !== !other.matricesWeights ||
                            !this.matricesIndicesExtra !== !other.matricesIndicesExtra ||
                            !this.matricesWeightsExtra !== !other.matricesWeightsExtra) {
                            throw new Error("Cannot merge vertex data that do not have the same set of attributes");
                        }
                    }
                    totalIndices = others.reduce(function (indexSum, vertexData) { var _a, _b; return indexSum + ((_b = (_a = vertexData.indices) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0); }, (_d = (_c = this.indices) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0);
                    sliceIndices = forceCloneIndices || others.some(function (vertexData) { return vertexData.indices === _this.indices; });
                    indices = sliceIndices ? (_e = this.indices) === null || _e === void 0 ? void 0 : _e.slice() : this.indices;
                    if (!(totalIndices > 0)) return [3 /*break*/, 4];
                    indicesOffset = (_f = indices === null || indices === void 0 ? void 0 : indices.length) !== null && _f !== void 0 ? _f : 0;
                    if (!indices) {
                        indices = new Array(totalIndices);
                    }
                    if (indices.length !== totalIndices) {
                        if (Array.isArray(indices)) {
                            indices.length = totalIndices;
                        }
                        else {
                            temp = use32BitsIndices || indices instanceof Uint32Array ? new Uint32Array(totalIndices) : new Uint16Array(totalIndices);
                            temp.set(indices);
                            indices = temp;
                        }
                        if (transform && transform.determinant() < 0) {
                            VertexData._FlipFaces(indices, 0, indicesOffset);
                        }
                    }
                    positionsOffset = this.positions ? this.positions.length / 3 : 0;
                    _a = 0, vertexDatas_1 = vertexDatas;
                    _g.label = 1;
                case 1:
                    if (!(_a < vertexDatas_1.length)) return [3 /*break*/, 4];
                    _b = vertexDatas_1[_a], other = _b[0], transform_1 = _b[1];
                    if (!other.indices) return [3 /*break*/, 3];
                    for (index = 0; index < other.indices.length; index++) {
                        indices[indicesOffset + index] = other.indices[index] + positionsOffset;
                    }
                    if (transform_1 && transform_1.determinant() < 0) {
                        VertexData._FlipFaces(indices, indicesOffset, other.indices.length);
                    }
                    // The call to _validate already checked for positions
                    positionsOffset += other.positions.length / 3;
                    indicesOffset += other.indices.length;
                    if (!isAsync) return [3 /*break*/, 3];
                    return [4 /*yield*/];
                case 2:
                    _g.sent();
                    _g.label = 3;
                case 3:
                    _a++;
                    return [3 /*break*/, 1];
                case 4:
                    this.indices = indices;
                    this.positions = VertexData._MergeElement(VertexBuffer.PositionKind, this.positions, transform, vertexDatas.map(function (other) { return [other[0].positions, other[1]]; }));
                    if (!isAsync) return [3 /*break*/, 6];
                    return [4 /*yield*/];
                case 5:
                    _g.sent();
                    _g.label = 6;
                case 6:
                    this.normals = VertexData._MergeElement(VertexBuffer.NormalKind, this.normals, transform, vertexDatas.map(function (other) { return [other[0].normals, other[1]]; }));
                    if (!isAsync) return [3 /*break*/, 8];
                    return [4 /*yield*/];
                case 7:
                    _g.sent();
                    _g.label = 8;
                case 8:
                    this.tangents = VertexData._MergeElement(VertexBuffer.TangentKind, this.tangents, transform, vertexDatas.map(function (other) { return [other[0].tangents, other[1]]; }));
                    if (!isAsync) return [3 /*break*/, 10];
                    return [4 /*yield*/];
                case 9:
                    _g.sent();
                    _g.label = 10;
                case 10:
                    this.uvs = VertexData._MergeElement(VertexBuffer.UVKind, this.uvs, transform, vertexDatas.map(function (other) { return [other[0].uvs, other[1]]; }));
                    if (!isAsync) return [3 /*break*/, 12];
                    return [4 /*yield*/];
                case 11:
                    _g.sent();
                    _g.label = 12;
                case 12:
                    this.uvs2 = VertexData._MergeElement(VertexBuffer.UV2Kind, this.uvs2, transform, vertexDatas.map(function (other) { return [other[0].uvs2, other[1]]; }));
                    if (!isAsync) return [3 /*break*/, 14];
                    return [4 /*yield*/];
                case 13:
                    _g.sent();
                    _g.label = 14;
                case 14:
                    this.uvs3 = VertexData._MergeElement(VertexBuffer.UV3Kind, this.uvs3, transform, vertexDatas.map(function (other) { return [other[0].uvs3, other[1]]; }));
                    if (!isAsync) return [3 /*break*/, 16];
                    return [4 /*yield*/];
                case 15:
                    _g.sent();
                    _g.label = 16;
                case 16:
                    this.uvs4 = VertexData._MergeElement(VertexBuffer.UV4Kind, this.uvs4, transform, vertexDatas.map(function (other) { return [other[0].uvs4, other[1]]; }));
                    if (!isAsync) return [3 /*break*/, 18];
                    return [4 /*yield*/];
                case 17:
                    _g.sent();
                    _g.label = 18;
                case 18:
                    this.uvs5 = VertexData._MergeElement(VertexBuffer.UV5Kind, this.uvs5, transform, vertexDatas.map(function (other) { return [other[0].uvs5, other[1]]; }));
                    if (!isAsync) return [3 /*break*/, 20];
                    return [4 /*yield*/];
                case 19:
                    _g.sent();
                    _g.label = 20;
                case 20:
                    this.uvs6 = VertexData._MergeElement(VertexBuffer.UV6Kind, this.uvs6, transform, vertexDatas.map(function (other) { return [other[0].uvs6, other[1]]; }));
                    if (!isAsync) return [3 /*break*/, 22];
                    return [4 /*yield*/];
                case 21:
                    _g.sent();
                    _g.label = 22;
                case 22:
                    this.colors = VertexData._MergeElement(VertexBuffer.ColorKind, this.colors, transform, vertexDatas.map(function (other) { return [other[0].colors, other[1]]; }));
                    if (!isAsync) return [3 /*break*/, 24];
                    return [4 /*yield*/];
                case 23:
                    _g.sent();
                    _g.label = 24;
                case 24:
                    this.matricesIndices = VertexData._MergeElement(VertexBuffer.MatricesIndicesKind, this.matricesIndices, transform, vertexDatas.map(function (other) { return [other[0].matricesIndices, other[1]]; }));
                    if (!isAsync) return [3 /*break*/, 26];
                    return [4 /*yield*/];
                case 25:
                    _g.sent();
                    _g.label = 26;
                case 26:
                    this.matricesWeights = VertexData._MergeElement(VertexBuffer.MatricesWeightsKind, this.matricesWeights, transform, vertexDatas.map(function (other) { return [other[0].matricesWeights, other[1]]; }));
                    if (!isAsync) return [3 /*break*/, 28];
                    return [4 /*yield*/];
                case 27:
                    _g.sent();
                    _g.label = 28;
                case 28:
                    this.matricesIndicesExtra = VertexData._MergeElement(VertexBuffer.MatricesIndicesExtraKind, this.matricesIndicesExtra, transform, vertexDatas.map(function (other) { return [other[0].matricesIndicesExtra, other[1]]; }));
                    if (!isAsync) return [3 /*break*/, 30];
                    return [4 /*yield*/];
                case 29:
                    _g.sent();
                    _g.label = 30;
                case 30:
                    this.matricesWeightsExtra = VertexData._MergeElement(VertexBuffer.MatricesWeightsExtraKind, this.matricesWeightsExtra, transform, vertexDatas.map(function (other) { return [other[0].matricesWeightsExtra, other[1]]; }));
                    return [2 /*return*/, this];
            }
        });
    };
    VertexData._MergeElement = function (kind, source, transform, others) {
        var nonNullOthers = others.filter(function (other) { return other[0] !== null && other[0] !== undefined; });
        // If there is no source to copy and no other non-null sources then skip this element.
        if (!source && nonNullOthers.length == 0) {
            return source;
        }
        if (!source) {
            return this._MergeElement(kind, nonNullOthers[0][0], nonNullOthers[0][1], nonNullOthers.slice(1));
        }
        var len = nonNullOthers.reduce(function (sumLen, elements) { return sumLen + elements[0].length; }, source.length);
        var transformRange = kind === VertexBuffer.PositionKind
            ? VertexData._TransformVector3Coordinates
            : kind === VertexBuffer.NormalKind
                ? VertexData._TransformVector3Normals
                : kind === VertexBuffer.TangentKind
                    ? VertexData._TransformVector4Normals
                    : function () { };
        if (source instanceof Float32Array) {
            // use non-loop method when the source is Float32Array
            var ret32 = new Float32Array(len);
            ret32.set(source);
            transform && transformRange(ret32, transform, 0, source.length);
            var offset = source.length;
            for (var _i = 0, nonNullOthers_1 = nonNullOthers; _i < nonNullOthers_1.length; _i++) {
                var _a = nonNullOthers_1[_i], vertexData = _a[0], transform_2 = _a[1];
                ret32.set(vertexData, offset);
                transform_2 && transformRange(ret32, transform_2, offset, vertexData.length);
                offset += vertexData.length;
            }
            return ret32;
        }
        else {
            // don't use concat as it is super slow, just loop for other cases
            var ret = new Array(len);
            for (var i = 0; i < source.length; i++) {
                ret[i] = source[i];
            }
            transform && transformRange(ret, transform, 0, source.length);
            var offset = source.length;
            for (var _b = 0, nonNullOthers_2 = nonNullOthers; _b < nonNullOthers_2.length; _b++) {
                var _c = nonNullOthers_2[_b], vertexData = _c[0], transform_3 = _c[1];
                for (var i = 0; i < vertexData.length; i++) {
                    ret[offset + i] = vertexData[i];
                }
                transform_3 && transformRange(ret, transform_3, offset, vertexData.length);
                offset += vertexData.length;
            }
            return ret;
        }
    };
    VertexData.prototype._validate = function () {
        if (!this.positions) {
            throw new RuntimeError("Positions are required", ErrorCodes.MeshInvalidPositionsError);
        }
        var getElementCount = function (kind, values) {
            var stride = VertexBuffer.DeduceStride(kind);
            if (values.length % stride !== 0) {
                throw new Error("The " + kind + "s array count must be a multiple of " + stride);
            }
            return values.length / stride;
        };
        var positionsElementCount = getElementCount(VertexBuffer.PositionKind, this.positions);
        var validateElementCount = function (kind, values) {
            var elementCount = getElementCount(kind, values);
            if (elementCount !== positionsElementCount) {
                throw new Error("The " + kind + "s element count (" + elementCount + ") does not match the positions count (" + positionsElementCount + ")");
            }
        };
        if (this.normals) {
            validateElementCount(VertexBuffer.NormalKind, this.normals);
        }
        if (this.tangents) {
            validateElementCount(VertexBuffer.TangentKind, this.tangents);
        }
        if (this.uvs) {
            validateElementCount(VertexBuffer.UVKind, this.uvs);
        }
        if (this.uvs2) {
            validateElementCount(VertexBuffer.UV2Kind, this.uvs2);
        }
        if (this.uvs3) {
            validateElementCount(VertexBuffer.UV3Kind, this.uvs3);
        }
        if (this.uvs4) {
            validateElementCount(VertexBuffer.UV4Kind, this.uvs4);
        }
        if (this.uvs5) {
            validateElementCount(VertexBuffer.UV5Kind, this.uvs5);
        }
        if (this.uvs6) {
            validateElementCount(VertexBuffer.UV6Kind, this.uvs6);
        }
        if (this.colors) {
            validateElementCount(VertexBuffer.ColorKind, this.colors);
        }
        if (this.matricesIndices) {
            validateElementCount(VertexBuffer.MatricesIndicesKind, this.matricesIndices);
        }
        if (this.matricesWeights) {
            validateElementCount(VertexBuffer.MatricesWeightsKind, this.matricesWeights);
        }
        if (this.matricesIndicesExtra) {
            validateElementCount(VertexBuffer.MatricesIndicesExtraKind, this.matricesIndicesExtra);
        }
        if (this.matricesWeightsExtra) {
            validateElementCount(VertexBuffer.MatricesWeightsExtraKind, this.matricesWeightsExtra);
        }
    };
    /**
     * Serializes the VertexData
     * @returns a serialized object
     */
    VertexData.prototype.serialize = function () {
        var serializationObject = {};
        if (this.positions) {
            serializationObject.positions = this.positions;
        }
        if (this.normals) {
            serializationObject.normals = this.normals;
        }
        if (this.tangents) {
            serializationObject.tangents = this.tangents;
        }
        if (this.uvs) {
            serializationObject.uvs = this.uvs;
        }
        if (this.uvs2) {
            serializationObject.uvs2 = this.uvs2;
        }
        if (this.uvs3) {
            serializationObject.uvs3 = this.uvs3;
        }
        if (this.uvs4) {
            serializationObject.uvs4 = this.uvs4;
        }
        if (this.uvs5) {
            serializationObject.uvs5 = this.uvs5;
        }
        if (this.uvs6) {
            serializationObject.uvs6 = this.uvs6;
        }
        if (this.colors) {
            serializationObject.colors = this.colors;
        }
        if (this.matricesIndices) {
            serializationObject.matricesIndices = this.matricesIndices;
            serializationObject.matricesIndices._isExpanded = true;
        }
        if (this.matricesWeights) {
            serializationObject.matricesWeights = this.matricesWeights;
        }
        if (this.matricesIndicesExtra) {
            serializationObject.matricesIndicesExtra = this.matricesIndicesExtra;
            serializationObject.matricesIndicesExtra._isExpanded = true;
        }
        if (this.matricesWeightsExtra) {
            serializationObject.matricesWeightsExtra = this.matricesWeightsExtra;
        }
        serializationObject.indices = this.indices;
        return serializationObject;
    };
    // Statics
    /**
     * Extracts the vertexData from a mesh
     * @param mesh the mesh from which to extract the VertexData
     * @param copyWhenShared defines if the VertexData must be cloned when shared between multiple meshes, optional, default false
     * @param forceCopy indicating that the VertexData must be cloned, optional, default false
     * @returns the object VertexData associated to the passed mesh
     */
    VertexData.ExtractFromMesh = function (mesh, copyWhenShared, forceCopy) {
        return VertexData._ExtractFrom(mesh, copyWhenShared, forceCopy);
    };
    /**
     * Extracts the vertexData from the geometry
     * @param geometry the geometry from which to extract the VertexData
     * @param copyWhenShared defines if the VertexData must be cloned when the geometry is shared between multiple meshes, optional, default false
     * @param forceCopy indicating that the VertexData must be cloned, optional, default false
     * @returns the object VertexData associated to the passed mesh
     */
    VertexData.ExtractFromGeometry = function (geometry, copyWhenShared, forceCopy) {
        return VertexData._ExtractFrom(geometry, copyWhenShared, forceCopy);
    };
    VertexData._ExtractFrom = function (meshOrGeometry, copyWhenShared, forceCopy) {
        var result = new VertexData();
        if (meshOrGeometry.isVerticesDataPresent(VertexBuffer.PositionKind)) {
            result.positions = meshOrGeometry.getVerticesData(VertexBuffer.PositionKind, copyWhenShared, forceCopy);
        }
        if (meshOrGeometry.isVerticesDataPresent(VertexBuffer.NormalKind)) {
            result.normals = meshOrGeometry.getVerticesData(VertexBuffer.NormalKind, copyWhenShared, forceCopy);
        }
        if (meshOrGeometry.isVerticesDataPresent(VertexBuffer.TangentKind)) {
            result.tangents = meshOrGeometry.getVerticesData(VertexBuffer.TangentKind, copyWhenShared, forceCopy);
        }
        if (meshOrGeometry.isVerticesDataPresent(VertexBuffer.UVKind)) {
            result.uvs = meshOrGeometry.getVerticesData(VertexBuffer.UVKind, copyWhenShared, forceCopy);
        }
        if (meshOrGeometry.isVerticesDataPresent(VertexBuffer.UV2Kind)) {
            result.uvs2 = meshOrGeometry.getVerticesData(VertexBuffer.UV2Kind, copyWhenShared, forceCopy);
        }
        if (meshOrGeometry.isVerticesDataPresent(VertexBuffer.UV3Kind)) {
            result.uvs3 = meshOrGeometry.getVerticesData(VertexBuffer.UV3Kind, copyWhenShared, forceCopy);
        }
        if (meshOrGeometry.isVerticesDataPresent(VertexBuffer.UV4Kind)) {
            result.uvs4 = meshOrGeometry.getVerticesData(VertexBuffer.UV4Kind, copyWhenShared, forceCopy);
        }
        if (meshOrGeometry.isVerticesDataPresent(VertexBuffer.UV5Kind)) {
            result.uvs5 = meshOrGeometry.getVerticesData(VertexBuffer.UV5Kind, copyWhenShared, forceCopy);
        }
        if (meshOrGeometry.isVerticesDataPresent(VertexBuffer.UV6Kind)) {
            result.uvs6 = meshOrGeometry.getVerticesData(VertexBuffer.UV6Kind, copyWhenShared, forceCopy);
        }
        if (meshOrGeometry.isVerticesDataPresent(VertexBuffer.ColorKind)) {
            result.colors = meshOrGeometry.getVerticesData(VertexBuffer.ColorKind, copyWhenShared, forceCopy);
        }
        if (meshOrGeometry.isVerticesDataPresent(VertexBuffer.MatricesIndicesKind)) {
            result.matricesIndices = meshOrGeometry.getVerticesData(VertexBuffer.MatricesIndicesKind, copyWhenShared, forceCopy);
        }
        if (meshOrGeometry.isVerticesDataPresent(VertexBuffer.MatricesWeightsKind)) {
            result.matricesWeights = meshOrGeometry.getVerticesData(VertexBuffer.MatricesWeightsKind, copyWhenShared, forceCopy);
        }
        if (meshOrGeometry.isVerticesDataPresent(VertexBuffer.MatricesIndicesExtraKind)) {
            result.matricesIndicesExtra = meshOrGeometry.getVerticesData(VertexBuffer.MatricesIndicesExtraKind, copyWhenShared, forceCopy);
        }
        if (meshOrGeometry.isVerticesDataPresent(VertexBuffer.MatricesWeightsExtraKind)) {
            result.matricesWeightsExtra = meshOrGeometry.getVerticesData(VertexBuffer.MatricesWeightsExtraKind, copyWhenShared, forceCopy);
        }
        result.indices = meshOrGeometry.getIndices(copyWhenShared, forceCopy);
        return result;
    };
    /**
     * Creates the VertexData for a Ribbon
     * @param options an object used to set the following optional parameters for the ribbon, required but can be empty
     * * pathArray array of paths, each of which an array of successive Vector3
     * * closeArray creates a seam between the first and the last paths of the pathArray, optional, default false
     * * closePath creates a seam between the first and the last points of each path of the path array, optional, default false
     * * offset a positive integer, only used when pathArray contains a single path (offset = 10 means the point 1 is joined to the point 11), default rounded half size of the pathArray length
     * * sideOrientation optional and takes the values : Mesh.FRONTSIDE (default), Mesh.BACKSIDE or Mesh.DOUBLESIDE
     * * frontUvs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the front side, optional, default vector4 (0, 0, 1, 1)
     * * backUVs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the back side, optional, default vector4 (0, 0, 1, 1)
     * * invertUV swaps in the U and V coordinates when applying a texture, optional, default false
     * * uvs a linear array, of length 2 * number of vertices, of custom UV values, optional
     * * colors a linear array, of length 4 * number of vertices, of custom color values, optional
     * @param options.pathArray
     * @param options.closeArray
     * @param options.closePath
     * @param options.offset
     * @param options.sideOrientation
     * @param options.frontUVs
     * @param options.backUVs
     * @param options.invertUV
     * @param options.uvs
     * @param options.colors
     * @returns the VertexData of the ribbon
     * @deprecated use CreateRibbonVertexData instead
     */
    VertexData.CreateRibbon = function (options) {
        throw _WarnImport("ribbonBuilder");
    };
    /**
     * Creates the VertexData for a box
     * @param options an object used to set the following optional parameters for the box, required but can be empty
     * * size sets the width, height and depth of the box to the value of size, optional default 1
     * * width sets the width (x direction) of the box, overwrites the width set by size, optional, default size
     * * height sets the height (y direction) of the box, overwrites the height set by size, optional, default size
     * * depth sets the depth (z direction) of the box, overwrites the depth set by size, optional, default size
     * * faceUV an array of 6 Vector4 elements used to set different images to each box side
     * * faceColors an array of 6 Color3 elements used to set different colors to each box side
     * * sideOrientation optional and takes the values : Mesh.FRONTSIDE (default), Mesh.BACKSIDE or Mesh.DOUBLESIDE
     * * frontUvs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the front side, optional, default vector4 (0, 0, 1, 1)
     * * backUVs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the back side, optional, default vector4 (0, 0, 1, 1)
     * @param options.size
     * @param options.width
     * @param options.height
     * @param options.depth
     * @param options.faceUV
     * @param options.faceColors
     * @param options.sideOrientation
     * @param options.frontUVs
     * @param options.backUVs
     * @returns the VertexData of the box
     * @deprecated Please use CreateBoxVertexData from the BoxBuilder file instead
     */
    VertexData.CreateBox = function (options) {
        throw _WarnImport("boxBuilder");
    };
    /**
     * Creates the VertexData for a tiled box
     * @param options an object used to set the following optional parameters for the box, required but can be empty
     * * faceTiles sets the pattern, tile size and number of tiles for a face
     * * faceUV an array of 6 Vector4 elements used to set different images to each box side
     * * faceColors an array of 6 Color3 elements used to set different colors to each box side
     * * sideOrientation optional and takes the values : Mesh.FRONTSIDE (default), Mesh.BACKSIDE or Mesh.DOUBLESIDE
     * @param options.pattern
     * @param options.width
     * @param options.height
     * @param options.depth
     * @param options.tileSize
     * @param options.tileWidth
     * @param options.tileHeight
     * @param options.alignHorizontal
     * @param options.alignVertical
     * @param options.faceUV
     * @param options.faceColors
     * @param options.sideOrientation
     * @returns the VertexData of the box
     * @deprecated Please use CreateTiledBoxVertexData instead
     */
    VertexData.CreateTiledBox = function (options) {
        throw _WarnImport("tiledBoxBuilder");
    };
    /**
     * Creates the VertexData for a tiled plane
     * @param options an object used to set the following optional parameters for the box, required but can be empty
     * * pattern a limited pattern arrangement depending on the number
     * * tileSize sets the width, height and depth of the tile to the value of size, optional default 1
     * * tileWidth sets the width (x direction) of the tile, overwrites the width set by size, optional, default size
     * * tileHeight sets the height (y direction) of the tile, overwrites the height set by size, optional, default size
     * * sideOrientation optional and takes the values : Mesh.FRONTSIDE (default), Mesh.BACKSIDE or Mesh.DOUBLESIDE
     * * frontUvs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the front side, optional, default vector4 (0, 0, 1, 1)
     * * backUVs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the back side, optional, default vector4 (0, 0, 1, 1)
     * @param options.pattern
     * @param options.tileSize
     * @param options.tileWidth
     * @param options.tileHeight
     * @param options.size
     * @param options.width
     * @param options.height
     * @param options.alignHorizontal
     * @param options.alignVertical
     * @param options.sideOrientation
     * @param options.frontUVs
     * @param options.backUVs
     * @returns the VertexData of the tiled plane
     * @deprecated use CreateTiledPlaneVertexData instead
     */
    VertexData.CreateTiledPlane = function (options) {
        throw _WarnImport("tiledPlaneBuilder");
    };
    /**
     * Creates the VertexData for an ellipsoid, defaults to a sphere
     * @param options an object used to set the following optional parameters for the box, required but can be empty
     * * segments sets the number of horizontal strips optional, default 32
     * * diameter sets the axes dimensions, diameterX, diameterY and diameterZ to the value of diameter, optional default 1
     * * diameterX sets the diameterX (x direction) of the ellipsoid, overwrites the diameterX set by diameter, optional, default diameter
     * * diameterY sets the diameterY (y direction) of the ellipsoid, overwrites the diameterY set by diameter, optional, default diameter
     * * diameterZ sets the diameterZ (z direction) of the ellipsoid, overwrites the diameterZ set by diameter, optional, default diameter
     * * arc a number from 0 to 1, to create an unclosed ellipsoid based on the fraction of the circumference (latitude) given by the arc value, optional, default 1
     * * slice a number from 0 to 1, to create an unclosed ellipsoid based on the fraction of the height (latitude) given by the arc value, optional, default 1
     * * sideOrientation optional and takes the values : Mesh.FRONTSIDE (default), Mesh.BACKSIDE or Mesh.DOUBLESIDE
     * * frontUvs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the front side, optional, default vector4 (0, 0, 1, 1)
     * * backUVs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the back side, optional, default vector4 (0, 0, 1, 1)
     * @param options.segments
     * @param options.diameter
     * @param options.diameterX
     * @param options.diameterY
     * @param options.diameterZ
     * @param options.arc
     * @param options.slice
     * @param options.sideOrientation
     * @param options.frontUVs
     * @param options.backUVs
     * @returns the VertexData of the ellipsoid
     * @deprecated use CreateSphereVertexData instead
     */
    VertexData.CreateSphere = function (options) {
        throw _WarnImport("sphereBuilder");
    };
    /**
     * Creates the VertexData for a cylinder, cone or prism
     * @param options an object used to set the following optional parameters for the box, required but can be empty
     * * height sets the height (y direction) of the cylinder, optional, default 2
     * * diameterTop sets the diameter of the top of the cone, overwrites diameter,  optional, default diameter
     * * diameterBottom sets the diameter of the bottom of the cone, overwrites diameter,  optional, default diameter
     * * diameter sets the diameter of the top and bottom of the cone, optional default 1
     * * tessellation the number of prism sides, 3 for a triangular prism, optional, default 24
     * * subdivisions` the number of rings along the cylinder height, optional, default 1
     * * arc a number from 0 to 1, to create an unclosed cylinder based on the fraction of the circumference given by the arc value, optional, default 1
     * * faceColors an array of Color3 elements used to set different colors to the top, rings and bottom respectively
     * * faceUV an array of Vector4 elements used to set different images to the top, rings and bottom respectively
     * * hasRings when true makes each subdivision independently treated as a face for faceUV and faceColors, optional, default false
     * * enclose when true closes an open cylinder by adding extra flat faces between the height axis and vertical edges, think cut cake
     * * sideOrientation optional and takes the values : Mesh.FRONTSIDE (default), Mesh.BACKSIDE or Mesh.DOUBLESIDE
     * * frontUvs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the front side, optional, default vector4 (0, 0, 1, 1)
     * * backUVs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the back side, optional, default vector4 (0, 0, 1, 1)
     * @param options.height
     * @param options.diameterTop
     * @param options.diameterBottom
     * @param options.diameter
     * @param options.tessellation
     * @param options.subdivisions
     * @param options.arc
     * @param options.faceColors
     * @param options.faceUV
     * @param options.hasRings
     * @param options.enclose
     * @param options.sideOrientation
     * @param options.frontUVs
     * @param options.backUVs
     * @returns the VertexData of the cylinder, cone or prism
     * @deprecated please use CreateCylinderVertexData instead
     */
    VertexData.CreateCylinder = function (options) {
        throw _WarnImport("cylinderBuilder");
    };
    /**
     * Creates the VertexData for a torus
     * @param options an object used to set the following optional parameters for the box, required but can be empty
     * * diameter the diameter of the torus, optional default 1
     * * thickness the diameter of the tube forming the torus, optional default 0.5
     * * tessellation the number of prism sides, 3 for a triangular prism, optional, default 24
     * * sideOrientation optional and takes the values : Mesh.FRONTSIDE (default), Mesh.BACKSIDE or Mesh.DOUBLESIDE
     * * frontUvs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the front side, optional, default vector4 (0, 0, 1, 1)
     * * backUVs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the back side, optional, default vector4 (0, 0, 1, 1)
     * @param options.diameter
     * @param options.thickness
     * @param options.tessellation
     * @param options.sideOrientation
     * @param options.frontUVs
     * @param options.backUVs
     * @returns the VertexData of the torus
     * @deprecated use CreateTorusVertexData instead
     */
    VertexData.CreateTorus = function (options) {
        throw _WarnImport("torusBuilder");
    };
    /**
     * Creates the VertexData of the LineSystem
     * @param options an object used to set the following optional parameters for the LineSystem, required but can be empty
     *  - lines an array of lines, each line being an array of successive Vector3
     *  - colors an array of line colors, each of the line colors being an array of successive Color4, one per line point
     * @param options.lines
     * @param options.colors
     * @returns the VertexData of the LineSystem
     * @deprecated use CreateLineSystemVertexData instead
     */
    VertexData.CreateLineSystem = function (options) {
        throw _WarnImport("linesBuilder");
    };
    /**
     * Create the VertexData for a DashedLines
     * @param options an object used to set the following optional parameters for the DashedLines, required but can be empty
     *  - points an array successive Vector3
     *  - dashSize the size of the dashes relative to the dash number, optional, default 3
     *  - gapSize the size of the gap between two successive dashes relative to the dash number, optional, default 1
     *  - dashNb the intended total number of dashes, optional, default 200
     * @param options.points
     * @param options.dashSize
     * @param options.gapSize
     * @param options.dashNb
     * @returns the VertexData for the DashedLines
     * @deprecated use CreateDashedLinesVertexData instead
     */
    VertexData.CreateDashedLines = function (options) {
        throw _WarnImport("linesBuilder");
    };
    /**
     * Creates the VertexData for a Ground
     * @param options an object used to set the following optional parameters for the Ground, required but can be empty
     *  - width the width (x direction) of the ground, optional, default 1
     *  - height the height (z direction) of the ground, optional, default 1
     *  - subdivisions the number of subdivisions per side, optional, default 1
     * @param options.width
     * @param options.height
     * @param options.subdivisions
     * @param options.subdivisionsX
     * @param options.subdivisionsY
     * @returns the VertexData of the Ground
     * @deprecated Please use CreateGroundVertexData instead
     */
    VertexData.CreateGround = function (options) {
        throw _WarnImport("groundBuilder");
    };
    /**
     * Creates the VertexData for a TiledGround by subdividing the ground into tiles
     * @param options an object used to set the following optional parameters for the Ground, required but can be empty
     * * xmin the ground minimum X coordinate, optional, default -1
     * * zmin the ground minimum Z coordinate, optional, default -1
     * * xmax the ground maximum X coordinate, optional, default 1
     * * zmax the ground maximum Z coordinate, optional, default 1
     * * subdivisions a javascript object {w: positive integer, h: positive integer}, `w` and `h` are the numbers of subdivisions on the ground width and height creating 'tiles', default {w: 6, h: 6}
     * * precision a javascript object {w: positive integer, h: positive integer}, `w` and `h` are the numbers of subdivisions on the tile width and height, default {w: 2, h: 2}
     * @param options.xmin
     * @param options.zmin
     * @param options.xmax
     * @param options.zmax
     * @param options.subdivisions
     * @param options.subdivisions.w
     * @param options.subdivisions.h
     * @param options.precision
     * @param options.precision.w
     * @param options.precision.h
     * @returns the VertexData of the TiledGround
     * @deprecated use CreateTiledGroundVertexData instead
     */
    VertexData.CreateTiledGround = function (options) {
        throw _WarnImport("groundBuilder");
    };
    /**
     * Creates the VertexData of the Ground designed from a heightmap
     * @param options an object used to set the following parameters for the Ground, required and provided by CreateGroundFromHeightMap
     * * width the width (x direction) of the ground
     * * height the height (z direction) of the ground
     * * subdivisions the number of subdivisions per side
     * * minHeight the minimum altitude on the ground, optional, default 0
     * * maxHeight the maximum altitude on the ground, optional default 1
     * * colorFilter the filter to apply to the image pixel colors to compute the height, optional Color3, default (0.3, 0.59, 0.11)
     * * buffer the array holding the image color data
     * * bufferWidth the width of image
     * * bufferHeight the height of image
     * * alphaFilter Remove any data where the alpha channel is below this value, defaults 0 (all data visible)
     * @param options.width
     * @param options.height
     * @param options.subdivisions
     * @param options.minHeight
     * @param options.maxHeight
     * @param options.colorFilter
     * @param options.buffer
     * @param options.bufferWidth
     * @param options.bufferHeight
     * @param options.alphaFilter
     * @returns the VertexData of the Ground designed from a heightmap
     * @deprecated use CreateGroundFromHeightMapVertexData instead
     */
    VertexData.CreateGroundFromHeightMap = function (options) {
        throw _WarnImport("groundBuilder");
    };
    /**
     * Creates the VertexData for a Plane
     * @param options an object used to set the following optional parameters for the plane, required but can be empty
     * * size sets the width and height of the plane to the value of size, optional default 1
     * * width sets the width (x direction) of the plane, overwrites the width set by size, optional, default size
     * * height sets the height (y direction) of the plane, overwrites the height set by size, optional, default size
     * * sideOrientation optional and takes the values : Mesh.FRONTSIDE (default), Mesh.BACKSIDE or Mesh.DOUBLESIDE
     * * frontUvs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the front side, optional, default vector4 (0, 0, 1, 1)
     * * backUVs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the back side, optional, default vector4 (0, 0, 1, 1)
     * @param options.size
     * @param options.width
     * @param options.height
     * @param options.sideOrientation
     * @param options.frontUVs
     * @param options.backUVs
     * @returns the VertexData of the box
     * @deprecated use CreatePlaneVertexData instead
     */
    VertexData.CreatePlane = function (options) {
        throw _WarnImport("planeBuilder");
    };
    /**
     * Creates the VertexData of the Disc or regular Polygon
     * @param options an object used to set the following optional parameters for the disc, required but can be empty
     * * radius the radius of the disc, optional default 0.5
     * * tessellation the number of polygon sides, optional, default 64
     * * arc a number from 0 to 1, to create an unclosed polygon based on the fraction of the circumference given by the arc value, optional, default 1
     * * sideOrientation optional and takes the values : Mesh.FRONTSIDE (default), Mesh.BACKSIDE or Mesh.DOUBLESIDE
     * * frontUvs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the front side, optional, default vector4 (0, 0, 1, 1)
     * * backUVs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the back side, optional, default vector4 (0, 0, 1, 1)
     * @param options.radius
     * @param options.tessellation
     * @param options.arc
     * @param options.sideOrientation
     * @param options.frontUVs
     * @param options.backUVs
     * @returns the VertexData of the box
     * @deprecated use CreateDiscVertexData instead
     */
    VertexData.CreateDisc = function (options) {
        throw _WarnImport("discBuilder");
    };
    /**
     * Creates the VertexData for an irregular Polygon in the XoZ plane using a mesh built by polygonTriangulation.build()
     * All parameters are provided by CreatePolygon as needed
     * @param polygon a mesh built from polygonTriangulation.build()
     * @param sideOrientation takes the values Mesh.FRONTSIDE (default), Mesh.BACKSIDE or Mesh.DOUBLESIDE
     * @param fUV an array of Vector4 elements used to set different images to the top, rings and bottom respectively
     * @param fColors an array of Color3 elements used to set different colors to the top, rings and bottom respectively
     * @param frontUVs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the front side, optional, default vector4 (0, 0, 1, 1)
     * @param backUVs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the back side, optional, default vector4 (0, 0, 1, 1)
     * @param wrap a boolean, default false, when true and fUVs used texture is wrapped around all sides, when false texture is applied side
     * @returns the VertexData of the Polygon
     * @deprecated use CreatePolygonVertexData instead
     */
    VertexData.CreatePolygon = function (polygon, sideOrientation, fUV, fColors, frontUVs, backUVs, wrap) {
        throw _WarnImport("polygonBuilder");
    };
    /**
     * Creates the VertexData of the IcoSphere
     * @param options an object used to set the following optional parameters for the IcoSphere, required but can be empty
     * * radius the radius of the IcoSphere, optional default 1
     * * radiusX allows stretching in the x direction, optional, default radius
     * * radiusY allows stretching in the y direction, optional, default radius
     * * radiusZ allows stretching in the z direction, optional, default radius
     * * flat when true creates a flat shaded mesh, optional, default true
     * * subdivisions increasing the subdivisions increases the number of faces, optional, default 4
     * * sideOrientation optional and takes the values : Mesh.FRONTSIDE (default), Mesh.BACKSIDE or Mesh.DOUBLESIDE
     * * frontUvs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the front side, optional, default vector4 (0, 0, 1, 1)
     * * backUVs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the back side, optional, default vector4 (0, 0, 1, 1)
     * @param options.radius
     * @param options.radiusX
     * @param options.radiusY
     * @param options.radiusZ
     * @param options.flat
     * @param options.subdivisions
     * @param options.sideOrientation
     * @param options.frontUVs
     * @param options.backUVs
     * @returns the VertexData of the IcoSphere
     * @deprecated use CreateIcoSphereVertexData instead
     */
    VertexData.CreateIcoSphere = function (options) {
        throw _WarnImport("icoSphereBuilder");
    };
    // inspired from // http://stemkoski.github.io/Three.js/Polyhedra.html
    /**
     * Creates the VertexData for a Polyhedron
     * @param options an object used to set the following optional parameters for the polyhedron, required but can be empty
     * * type provided types are:
     *  * 0 : Tetrahedron, 1 : Octahedron, 2 : Dodecahedron, 3 : Icosahedron, 4 : Rhombicuboctahedron, 5 : Triangular Prism, 6 : Pentagonal Prism, 7 : Hexagonal Prism, 8 : Square Pyramid (J1)
     *  * 9 : Pentagonal Pyramid (J2), 10 : Triangular Dipyramid (J12), 11 : Pentagonal Dipyramid (J13), 12 : Elongated Square Dipyramid (J15), 13 : Elongated Pentagonal Dipyramid (J16), 14 : Elongated Pentagonal Cupola (J20)
     * * size the size of the IcoSphere, optional default 1
     * * sizeX allows stretching in the x direction, optional, default size
     * * sizeY allows stretching in the y direction, optional, default size
     * * sizeZ allows stretching in the z direction, optional, default size
     * * custom a number that overwrites the type to create from an extended set of polyhedron from https://www.babylonjs-playground.com/#21QRSK#15 with minimised editor
     * * faceUV an array of Vector4 elements used to set different images to the top, rings and bottom respectively
     * * faceColors an array of Color3 elements used to set different colors to the top, rings and bottom respectively
     * * flat when true creates a flat shaded mesh, optional, default true
     * * subdivisions increasing the subdivisions increases the number of faces, optional, default 4
     * * sideOrientation optional and takes the values : Mesh.FRONTSIDE (default), Mesh.BACKSIDE or Mesh.DOUBLESIDE
     * * frontUvs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the front side, optional, default vector4 (0, 0, 1, 1)
     * * backUVs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the back side, optional, default vector4 (0, 0, 1, 1)
     * @param options.type
     * @param options.size
     * @param options.sizeX
     * @param options.sizeY
     * @param options.sizeZ
     * @param options.custom
     * @param options.faceUV
     * @param options.faceColors
     * @param options.flat
     * @param options.sideOrientation
     * @param options.frontUVs
     * @param options.backUVs
     * @returns the VertexData of the Polyhedron
     * @deprecated use CreatePolyhedronVertexData instead
     */
    VertexData.CreatePolyhedron = function (options) {
        throw _WarnImport("polyhedronBuilder");
    };
    /**
     * Creates the VertexData for a Capsule, inspired from https://github.com/maximeq/three-js-capsule-geometry/blob/master/src/CapsuleBufferGeometry.js
     * @param options an object used to set the following optional parameters for the capsule, required but can be empty
     * @returns the VertexData of the Capsule
     * @deprecated Please use CreateCapsuleVertexData from the capsuleBuilder file instead
     */
    VertexData.CreateCapsule = function (options) {
        if (options === void 0) { options = {
            orientation: Vector3.Up(),
            subdivisions: 2,
            tessellation: 16,
            height: 1,
            radius: 0.25,
            capSubdivisions: 6,
        }; }
        throw _WarnImport("capsuleBuilder");
    };
    // based on http://code.google.com/p/away3d/source/browse/trunk/fp10/Away3D/src/away3d/primitives/TorusKnot.as?spec=svn2473&r=2473
    /**
     * Creates the VertexData for a TorusKnot
     * @param options an object used to set the following optional parameters for the TorusKnot, required but can be empty
     * * radius the radius of the torus knot, optional, default 2
     * * tube the thickness of the tube, optional, default 0.5
     * * radialSegments the number of sides on each tube segments, optional, default 32
     * * tubularSegments the number of tubes to decompose the knot into, optional, default 32
     * * p the number of windings around the z axis, optional,  default 2
     * * q the number of windings around the x axis, optional,  default 3
     * * sideOrientation optional and takes the values : Mesh.FRONTSIDE (default), Mesh.BACKSIDE or Mesh.DOUBLESIDE
     * * frontUvs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the front side, optional, default vector4 (0, 0, 1, 1)
     * * backUVs only usable when you create a double-sided mesh, used to choose what parts of the texture image to crop and apply on the back side, optional, default vector4 (0, 0, 1, 1)
     * @param options.radius
     * @param options.tube
     * @param options.radialSegments
     * @param options.tubularSegments
     * @param options.p
     * @param options.q
     * @param options.sideOrientation
     * @param options.frontUVs
     * @param options.backUVs
     * @returns the VertexData of the Torus Knot
     * @deprecated use CreateTorusKnotVertexData instead
     */
    VertexData.CreateTorusKnot = function (options) {
        throw _WarnImport("torusKnotBuilder");
    };
    // Tools
    /**
     * Compute normals for given positions and indices
     * @param positions an array of vertex positions, [...., x, y, z, ......]
     * @param indices an array of indices in groups of three for each triangular facet, [...., i, j, k, ......]
     * @param normals an array of vertex normals, [...., x, y, z, ......]
     * @param options an object used to set the following optional parameters for the TorusKnot, optional
     * * facetNormals : optional array of facet normals (vector3)
     * * facetPositions : optional array of facet positions (vector3)
     * * facetPartitioning : optional partitioning array. facetPositions is required for facetPartitioning computation
     * * ratio : optional partitioning ratio / bounding box, required for facetPartitioning computation
     * * bInfo : optional bounding info, required for facetPartitioning computation
     * * bbSize : optional bounding box size data, required for facetPartitioning computation
     * * subDiv : optional partitioning data about subdivisions on  each axis (int), required for facetPartitioning computation
     * * useRightHandedSystem: optional boolean to for right handed system computation
     * * depthSort : optional boolean to enable the facet depth sort computation
     * * distanceTo : optional Vector3 to compute the facet depth from this location
     * * depthSortedFacets : optional array of depthSortedFacets to store the facet distances from the reference location
     * @param options.facetNormals
     * @param options.facetPositions
     * @param options.facetPartitioning
     * @param options.ratio
     * @param options.bInfo
     * @param options.bbSize
     * @param options.subDiv
     * @param options.useRightHandedSystem
     * @param options.depthSort
     * @param options.distanceTo
     * @param options.depthSortedFacets
     */
    VertexData.ComputeNormals = function (positions, indices, normals, options) {
        // temporary scalar variables
        var index = 0; // facet index
        var p1p2x = 0.0; // p1p2 vector x coordinate
        var p1p2y = 0.0; // p1p2 vector y coordinate
        var p1p2z = 0.0; // p1p2 vector z coordinate
        var p3p2x = 0.0; // p3p2 vector x coordinate
        var p3p2y = 0.0; // p3p2 vector y coordinate
        var p3p2z = 0.0; // p3p2 vector z coordinate
        var faceNormalx = 0.0; // facet normal x coordinate
        var faceNormaly = 0.0; // facet normal y coordinate
        var faceNormalz = 0.0; // facet normal z coordinate
        var length = 0.0; // facet normal length before normalization
        var v1x = 0; // vector1 x index in the positions array
        var v1y = 0; // vector1 y index in the positions array
        var v1z = 0; // vector1 z index in the positions array
        var v2x = 0; // vector2 x index in the positions array
        var v2y = 0; // vector2 y index in the positions array
        var v2z = 0; // vector2 z index in the positions array
        var v3x = 0; // vector3 x index in the positions array
        var v3y = 0; // vector3 y index in the positions array
        var v3z = 0; // vector3 z index in the positions array
        var computeFacetNormals = false;
        var computeFacetPositions = false;
        var computeFacetPartitioning = false;
        var computeDepthSort = false;
        var faceNormalSign = 1;
        var ratio = 0;
        var distanceTo = null;
        if (options) {
            computeFacetNormals = options.facetNormals ? true : false;
            computeFacetPositions = options.facetPositions ? true : false;
            computeFacetPartitioning = options.facetPartitioning ? true : false;
            faceNormalSign = options.useRightHandedSystem === true ? -1 : 1;
            ratio = options.ratio || 0;
            computeDepthSort = options.depthSort ? true : false;
            distanceTo = options.distanceTo;
            if (computeDepthSort) {
                if (distanceTo === undefined) {
                    distanceTo = Vector3.Zero();
                }
            }
        }
        // facetPartitioning reinit if needed
        var xSubRatio = 0;
        var ySubRatio = 0;
        var zSubRatio = 0;
        var subSq = 0;
        if (computeFacetPartitioning && options && options.bbSize) {
            //let bbSizeMax = options.bbSize.x > options.bbSize.y ? options.bbSize.x : options.bbSize.y;
            //bbSizeMax = bbSizeMax > options.bbSize.z ? bbSizeMax : options.bbSize.z;
            xSubRatio = (options.subDiv.X * ratio) / options.bbSize.x;
            ySubRatio = (options.subDiv.Y * ratio) / options.bbSize.y;
            zSubRatio = (options.subDiv.Z * ratio) / options.bbSize.z;
            subSq = options.subDiv.max * options.subDiv.max;
            options.facetPartitioning.length = 0;
        }
        // reset the normals
        for (index = 0; index < positions.length; index++) {
            normals[index] = 0.0;
        }
        // Loop : 1 indice triplet = 1 facet
        var nbFaces = (indices.length / 3) | 0;
        for (index = 0; index < nbFaces; index++) {
            // get the indexes of the coordinates of each vertex of the facet
            v1x = indices[index * 3] * 3;
            v1y = v1x + 1;
            v1z = v1x + 2;
            v2x = indices[index * 3 + 1] * 3;
            v2y = v2x + 1;
            v2z = v2x + 2;
            v3x = indices[index * 3 + 2] * 3;
            v3y = v3x + 1;
            v3z = v3x + 2;
            p1p2x = positions[v1x] - positions[v2x]; // compute two vectors per facet : p1p2 and p3p2
            p1p2y = positions[v1y] - positions[v2y];
            p1p2z = positions[v1z] - positions[v2z];
            p3p2x = positions[v3x] - positions[v2x];
            p3p2y = positions[v3y] - positions[v2y];
            p3p2z = positions[v3z] - positions[v2z];
            // compute the face normal with the cross product
            faceNormalx = faceNormalSign * (p1p2y * p3p2z - p1p2z * p3p2y);
            faceNormaly = faceNormalSign * (p1p2z * p3p2x - p1p2x * p3p2z);
            faceNormalz = faceNormalSign * (p1p2x * p3p2y - p1p2y * p3p2x);
            // normalize this normal and store it in the array facetData
            length = Math.sqrt(faceNormalx * faceNormalx + faceNormaly * faceNormaly + faceNormalz * faceNormalz);
            length = length === 0 ? 1.0 : length;
            faceNormalx /= length;
            faceNormaly /= length;
            faceNormalz /= length;
            if (computeFacetNormals && options) {
                options.facetNormals[index].x = faceNormalx;
                options.facetNormals[index].y = faceNormaly;
                options.facetNormals[index].z = faceNormalz;
            }
            if (computeFacetPositions && options) {
                // compute and the facet barycenter coordinates in the array facetPositions
                options.facetPositions[index].x = (positions[v1x] + positions[v2x] + positions[v3x]) / 3.0;
                options.facetPositions[index].y = (positions[v1y] + positions[v2y] + positions[v3y]) / 3.0;
                options.facetPositions[index].z = (positions[v1z] + positions[v2z] + positions[v3z]) / 3.0;
            }
            if (computeFacetPartitioning && options) {
                // store the facet indexes in arrays in the main facetPartitioning array :
                // compute each facet vertex (+ facet barycenter) index in the partiniong array
                var ox = Math.floor((options.facetPositions[index].x - options.bInfo.minimum.x * ratio) * xSubRatio);
                var oy = Math.floor((options.facetPositions[index].y - options.bInfo.minimum.y * ratio) * ySubRatio);
                var oz = Math.floor((options.facetPositions[index].z - options.bInfo.minimum.z * ratio) * zSubRatio);
                var b1x = Math.floor((positions[v1x] - options.bInfo.minimum.x * ratio) * xSubRatio);
                var b1y = Math.floor((positions[v1y] - options.bInfo.minimum.y * ratio) * ySubRatio);
                var b1z = Math.floor((positions[v1z] - options.bInfo.minimum.z * ratio) * zSubRatio);
                var b2x = Math.floor((positions[v2x] - options.bInfo.minimum.x * ratio) * xSubRatio);
                var b2y = Math.floor((positions[v2y] - options.bInfo.minimum.y * ratio) * ySubRatio);
                var b2z = Math.floor((positions[v2z] - options.bInfo.minimum.z * ratio) * zSubRatio);
                var b3x = Math.floor((positions[v3x] - options.bInfo.minimum.x * ratio) * xSubRatio);
                var b3y = Math.floor((positions[v3y] - options.bInfo.minimum.y * ratio) * ySubRatio);
                var b3z = Math.floor((positions[v3z] - options.bInfo.minimum.z * ratio) * zSubRatio);
                var block_idx_v1 = b1x + options.subDiv.max * b1y + subSq * b1z;
                var block_idx_v2 = b2x + options.subDiv.max * b2y + subSq * b2z;
                var block_idx_v3 = b3x + options.subDiv.max * b3y + subSq * b3z;
                var block_idx_o = ox + options.subDiv.max * oy + subSq * oz;
                options.facetPartitioning[block_idx_o] = options.facetPartitioning[block_idx_o] ? options.facetPartitioning[block_idx_o] : new Array();
                options.facetPartitioning[block_idx_v1] = options.facetPartitioning[block_idx_v1] ? options.facetPartitioning[block_idx_v1] : new Array();
                options.facetPartitioning[block_idx_v2] = options.facetPartitioning[block_idx_v2] ? options.facetPartitioning[block_idx_v2] : new Array();
                options.facetPartitioning[block_idx_v3] = options.facetPartitioning[block_idx_v3] ? options.facetPartitioning[block_idx_v3] : new Array();
                // push each facet index in each block containing the vertex
                options.facetPartitioning[block_idx_v1].push(index);
                if (block_idx_v2 != block_idx_v1) {
                    options.facetPartitioning[block_idx_v2].push(index);
                }
                if (!(block_idx_v3 == block_idx_v2 || block_idx_v3 == block_idx_v1)) {
                    options.facetPartitioning[block_idx_v3].push(index);
                }
                if (!(block_idx_o == block_idx_v1 || block_idx_o == block_idx_v2 || block_idx_o == block_idx_v3)) {
                    options.facetPartitioning[block_idx_o].push(index);
                }
            }
            if (computeDepthSort && options && options.facetPositions) {
                var dsf = options.depthSortedFacets[index];
                dsf.ind = index * 3;
                dsf.sqDistance = Vector3.DistanceSquared(options.facetPositions[index], distanceTo);
            }
            // compute the normals anyway
            normals[v1x] += faceNormalx; // accumulate all the normals per face
            normals[v1y] += faceNormaly;
            normals[v1z] += faceNormalz;
            normals[v2x] += faceNormalx;
            normals[v2y] += faceNormaly;
            normals[v2z] += faceNormalz;
            normals[v3x] += faceNormalx;
            normals[v3y] += faceNormaly;
            normals[v3z] += faceNormalz;
        }
        // last normalization of each normal
        for (index = 0; index < normals.length / 3; index++) {
            faceNormalx = normals[index * 3];
            faceNormaly = normals[index * 3 + 1];
            faceNormalz = normals[index * 3 + 2];
            length = Math.sqrt(faceNormalx * faceNormalx + faceNormaly * faceNormaly + faceNormalz * faceNormalz);
            length = length === 0 ? 1.0 : length;
            faceNormalx /= length;
            faceNormaly /= length;
            faceNormalz /= length;
            normals[index * 3] = faceNormalx;
            normals[index * 3 + 1] = faceNormaly;
            normals[index * 3 + 2] = faceNormalz;
        }
    };
    /**
     * @param sideOrientation
     * @param positions
     * @param indices
     * @param normals
     * @param uvs
     * @param frontUVs
     * @param backUVs
     * @hidden
     */
    VertexData._ComputeSides = function (sideOrientation, positions, indices, normals, uvs, frontUVs, backUVs) {
        var li = indices.length;
        var ln = normals.length;
        var i;
        var n;
        sideOrientation = sideOrientation || VertexData.DEFAULTSIDE;
        switch (sideOrientation) {
            case VertexData.FRONTSIDE:
                // nothing changed
                break;
            case VertexData.BACKSIDE:
                // indices
                for (i = 0; i < li; i += 3) {
                    var tmp = indices[i];
                    indices[i] = indices[i + 2];
                    indices[i + 2] = tmp;
                }
                // normals
                for (n = 0; n < ln; n++) {
                    normals[n] = -normals[n];
                }
                break;
            case VertexData.DOUBLESIDE: {
                // positions
                var lp = positions.length;
                var l = lp / 3;
                for (var p = 0; p < lp; p++) {
                    positions[lp + p] = positions[p];
                }
                // indices
                for (i = 0; i < li; i += 3) {
                    indices[i + li] = indices[i + 2] + l;
                    indices[i + 1 + li] = indices[i + 1] + l;
                    indices[i + 2 + li] = indices[i] + l;
                }
                // normals
                for (n = 0; n < ln; n++) {
                    normals[ln + n] = -normals[n];
                }
                // uvs
                var lu = uvs.length;
                var u = 0;
                for (u = 0; u < lu; u++) {
                    uvs[u + lu] = uvs[u];
                }
                frontUVs = frontUVs ? frontUVs : new Vector4(0.0, 0.0, 1.0, 1.0);
                backUVs = backUVs ? backUVs : new Vector4(0.0, 0.0, 1.0, 1.0);
                u = 0;
                for (i = 0; i < lu / 2; i++) {
                    uvs[u] = frontUVs.x + (frontUVs.z - frontUVs.x) * uvs[u];
                    uvs[u + 1] = frontUVs.y + (frontUVs.w - frontUVs.y) * uvs[u + 1];
                    uvs[u + lu] = backUVs.x + (backUVs.z - backUVs.x) * uvs[u + lu];
                    uvs[u + lu + 1] = backUVs.y + (backUVs.w - backUVs.y) * uvs[u + lu + 1];
                    u += 2;
                }
                break;
            }
        }
    };
    /**
     * Applies VertexData created from the imported parameters to the geometry
     * @param parsedVertexData the parsed data from an imported file
     * @param geometry the geometry to apply the VertexData to
     */
    VertexData.ImportVertexData = function (parsedVertexData, geometry) {
        var vertexData = new VertexData();
        // positions
        var positions = parsedVertexData.positions;
        if (positions) {
            vertexData.set(positions, VertexBuffer.PositionKind);
        }
        // normals
        var normals = parsedVertexData.normals;
        if (normals) {
            vertexData.set(normals, VertexBuffer.NormalKind);
        }
        // tangents
        var tangents = parsedVertexData.tangents;
        if (tangents) {
            vertexData.set(tangents, VertexBuffer.TangentKind);
        }
        // uvs
        var uvs = parsedVertexData.uvs;
        if (uvs) {
            vertexData.set(uvs, VertexBuffer.UVKind);
        }
        // uv2s
        var uv2s = parsedVertexData.uv2s;
        if (uv2s) {
            vertexData.set(uv2s, VertexBuffer.UV2Kind);
        }
        // uv3s
        var uv3s = parsedVertexData.uv3s;
        if (uv3s) {
            vertexData.set(uv3s, VertexBuffer.UV3Kind);
        }
        // uv4s
        var uv4s = parsedVertexData.uv4s;
        if (uv4s) {
            vertexData.set(uv4s, VertexBuffer.UV4Kind);
        }
        // uv5s
        var uv5s = parsedVertexData.uv5s;
        if (uv5s) {
            vertexData.set(uv5s, VertexBuffer.UV5Kind);
        }
        // uv6s
        var uv6s = parsedVertexData.uv6s;
        if (uv6s) {
            vertexData.set(uv6s, VertexBuffer.UV6Kind);
        }
        // colors
        var colors = parsedVertexData.colors;
        if (colors) {
            vertexData.set(Color4.CheckColors4(colors, positions.length / 3), VertexBuffer.ColorKind);
        }
        // matricesIndices
        var matricesIndices = parsedVertexData.matricesIndices;
        if (matricesIndices) {
            vertexData.set(matricesIndices, VertexBuffer.MatricesIndicesKind);
        }
        // matricesWeights
        var matricesWeights = parsedVertexData.matricesWeights;
        if (matricesWeights) {
            vertexData.set(matricesWeights, VertexBuffer.MatricesWeightsKind);
        }
        // indices
        var indices = parsedVertexData.indices;
        if (indices) {
            vertexData.indices = indices;
        }
        geometry.setAllVerticesData(vertexData, parsedVertexData.updatable);
    };
    /**
     * Mesh side orientation : usually the external or front surface
     */
    VertexData.FRONTSIDE = 0;
    /**
     * Mesh side orientation : usually the internal or back surface
     */
    VertexData.BACKSIDE = 1;
    /**
     * Mesh side orientation : both internal and external or front and back surfaces
     */
    VertexData.DOUBLESIDE = 2;
    /**
     * Mesh side orientation : by default, `FRONTSIDE`
     */
    VertexData.DEFAULTSIDE = 0;
    __decorate([
        nativeOverride.filter(function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var coordinates = _a[0];
            return !Array.isArray(coordinates);
        })
    ], VertexData, "_TransformVector3Coordinates", null);
    __decorate([
        nativeOverride.filter(function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var normals = _a[0];
            return !Array.isArray(normals);
        })
    ], VertexData, "_TransformVector3Normals", null);
    __decorate([
        nativeOverride.filter(function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var normals = _a[0];
            return !Array.isArray(normals);
        })
    ], VertexData, "_TransformVector4Normals", null);
    __decorate([
        nativeOverride.filter(function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var indices = _a[0];
            return !Array.isArray(indices);
        })
    ], VertexData, "_FlipFaces", null);
    return VertexData;
}());
export { VertexData };
//# sourceMappingURL=mesh.vertexData.js.map