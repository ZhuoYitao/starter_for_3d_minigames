import { __extends } from "tslib";
import { Vector3 } from "../Maths/math.vector.js";
import { VertexBuffer } from "../Buffers/buffer.js";
import { Mesh } from "../Meshes/mesh.js";
import { Color4 } from "../Maths/math.color.js";
import { Logger } from "../Misc/logger.js";
Mesh._GoldbergMeshParser = function (parsedMesh, scene) {
    return GoldbergMesh.Parse(parsedMesh, scene);
};
/**
 * Mesh for a Goldberg Polyhedron which is made from 12 pentagonal and the rest hexagonal faces
 * @see https://en.wikipedia.org/wiki/Goldberg_polyhedron
 */
var GoldbergMesh = /** @class */ (function (_super) {
    __extends(GoldbergMesh, _super);
    function GoldbergMesh() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Defines the specific Goldberg data used in this mesh construction.
         */
        _this.goldbergData = {
            faceColors: [],
            faceCenters: [],
            faceZaxis: [],
            faceXaxis: [],
            faceYaxis: [],
            nbSharedFaces: 0,
            nbUnsharedFaces: 0,
            nbFaces: 0,
            nbFacesAtPole: 0,
            adjacentFaces: [],
        };
        return _this;
    }
    /**
     * Gets the related Goldberg face from pole infos
     * @param poleOrShared Defines the pole index or the shared face index if the fromPole parameter is passed in
     * @param fromPole Defines an optional pole index to find the related info from
     * @returns the goldberg face number
     */
    GoldbergMesh.prototype.relatedGoldbergFace = function (poleOrShared, fromPole) {
        if (fromPole === void 0) {
            if (poleOrShared > this.goldbergData.nbUnsharedFaces - 1) {
                Logger.Warn("Maximum number of unshared faces used");
                poleOrShared = this.goldbergData.nbUnsharedFaces - 1;
            }
            return this.goldbergData.nbUnsharedFaces + poleOrShared;
        }
        if (poleOrShared > 11) {
            Logger.Warn("Last pole used");
            poleOrShared = 11;
        }
        if (fromPole > this.goldbergData.nbFacesAtPole - 1) {
            Logger.Warn("Maximum number of faces at a pole used");
            fromPole = this.goldbergData.nbFacesAtPole - 1;
        }
        return 12 + poleOrShared * this.goldbergData.nbFacesAtPole + fromPole;
    };
    GoldbergMesh.prototype._changeGoldbergFaceColors = function (colorRange) {
        for (var i = 0; i < colorRange.length; i++) {
            var min = colorRange[i][0];
            var max = colorRange[i][1];
            var col = colorRange[i][2];
            for (var f = min; f < max + 1; f++) {
                this.goldbergData.faceColors[f] = col;
            }
        }
        var newCols = [];
        for (var f = 0; f < 12; f++) {
            for (var i = 0; i < 5; i++) {
                newCols.push(this.goldbergData.faceColors[f].r, this.goldbergData.faceColors[f].g, this.goldbergData.faceColors[f].b, this.goldbergData.faceColors[f].a);
            }
        }
        for (var f = 12; f < this.goldbergData.faceColors.length; f++) {
            for (var i = 0; i < 6; i++) {
                newCols.push(this.goldbergData.faceColors[f].r, this.goldbergData.faceColors[f].g, this.goldbergData.faceColors[f].b, this.goldbergData.faceColors[f].a);
            }
        }
        return newCols;
    };
    /**
     * Set new goldberg face colors
     * @param colorRange the new color to apply to the mesh
     */
    GoldbergMesh.prototype.setGoldbergFaceColors = function (colorRange) {
        var newCols = this._changeGoldbergFaceColors(colorRange);
        this.setVerticesData(VertexBuffer.ColorKind, newCols);
    };
    /**
     * Updates new goldberg face colors
     * @param colorRange the new color to apply to the mesh
     */
    GoldbergMesh.prototype.updateGoldbergFaceColors = function (colorRange) {
        var newCols = this._changeGoldbergFaceColors(colorRange);
        this.updateVerticesData(VertexBuffer.ColorKind, newCols);
    };
    GoldbergMesh.prototype._changeGoldbergFaceUVs = function (uvRange) {
        var uvs = this.getVerticesData(VertexBuffer.UVKind);
        for (var i = 0; i < uvRange.length; i++) {
            var min = uvRange[i][0];
            var max = uvRange[i][1];
            var center = uvRange[i][2];
            var radius = uvRange[i][3];
            var angle = uvRange[i][4];
            var points5 = [];
            var points6 = [];
            var u = void 0;
            var v = void 0;
            for (var p = 0; p < 5; p++) {
                u = center.x + radius * Math.cos(angle + (p * Math.PI) / 2.5);
                v = center.y + radius * Math.sin(angle + (p * Math.PI) / 2.5);
                if (u < 0) {
                    u = 0;
                }
                if (u > 1) {
                    u = 1;
                }
                points5.push(u, v);
            }
            for (var p = 0; p < 6; p++) {
                u = center.x + radius * Math.cos(angle + (p * Math.PI) / 3);
                v = center.y + radius * Math.sin(angle + (p * Math.PI) / 3);
                if (u < 0) {
                    u = 0;
                }
                if (u > 1) {
                    u = 1;
                }
                points6.push(u, v);
            }
            for (var f = min; f < Math.min(12, max + 1); f++) {
                for (var p = 0; p < 5; p++) {
                    uvs[10 * f + 2 * p] = points5[2 * p];
                    uvs[10 * f + 2 * p + 1] = points5[2 * p + 1];
                }
            }
            for (var f = Math.max(12, min); f < max + 1; f++) {
                for (var p = 0; p < 6; p++) {
                    //120 + 12 * (f - 12) = 12 * f - 24
                    uvs[12 * f - 24 + 2 * p] = points6[2 * p];
                    uvs[12 * f - 23 + 2 * p] = points6[2 * p + 1];
                }
            }
        }
        return uvs;
    };
    /**
     * set new goldberg face UVs
     * @param uvRange the new UVs to apply to the mesh
     */
    GoldbergMesh.prototype.setGoldbergFaceUVs = function (uvRange) {
        var newUVs = this._changeGoldbergFaceUVs(uvRange);
        this.setVerticesData(VertexBuffer.UVKind, newUVs);
    };
    /**
     * Updates new goldberg face UVs
     * @param uvRange the new UVs to apply to the mesh
     */
    GoldbergMesh.prototype.updateGoldbergFaceUVs = function (uvRange) {
        var newUVs = this._changeGoldbergFaceUVs(uvRange);
        this.updateVerticesData(VertexBuffer.UVKind, newUVs);
    };
    /**
     * Places a mesh on a particular face of the goldberg polygon
     * @param mesh Defines the mesh to position
     * @param face Defines the face to position onto
     * @param position Defines the position relative to the face we are positioning the mesh onto
     */
    GoldbergMesh.prototype.placeOnGoldbergFaceAt = function (mesh, face, position) {
        var orientation = Vector3.RotationFromAxis(this.goldbergData.faceXaxis[face], this.goldbergData.faceYaxis[face], this.goldbergData.faceZaxis[face]);
        mesh.rotation = orientation;
        mesh.position = this.goldbergData.faceCenters[face]
            .add(this.goldbergData.faceXaxis[face].scale(position.x))
            .add(this.goldbergData.faceYaxis[face].scale(position.y))
            .add(this.goldbergData.faceZaxis[face].scale(position.z));
    };
    /**
     * Serialize current mesh
     * @param serializationObject defines the object which will receive the serialization data
     */
    GoldbergMesh.prototype.serialize = function (serializationObject) {
        _super.prototype.serialize.call(this, serializationObject);
        serializationObject.type = "GoldbergMesh";
        var goldbergData = {};
        goldbergData.adjacentFaces = this.goldbergData.adjacentFaces;
        goldbergData.nbSharedFaces = this.goldbergData.nbSharedFaces;
        goldbergData.nbUnsharedFaces = this.goldbergData.nbUnsharedFaces;
        goldbergData.nbFaces = this.goldbergData.nbFaces;
        goldbergData.nbFacesAtPole = this.goldbergData.nbFacesAtPole;
        if (this.goldbergData.faceColors) {
            goldbergData.faceColors = [];
            for (var _i = 0, _a = this.goldbergData.faceColors; _i < _a.length; _i++) {
                var color = _a[_i];
                goldbergData.faceColors.push(color.asArray());
            }
        }
        if (this.goldbergData.faceCenters) {
            goldbergData.faceCenters = [];
            for (var _b = 0, _c = this.goldbergData.faceCenters; _b < _c.length; _b++) {
                var vector = _c[_b];
                goldbergData.faceCenters.push(vector.asArray());
            }
        }
        if (this.goldbergData.faceZaxis) {
            goldbergData.faceZaxis = [];
            for (var _d = 0, _e = this.goldbergData.faceZaxis; _d < _e.length; _d++) {
                var vector = _e[_d];
                goldbergData.faceZaxis.push(vector.asArray());
            }
        }
        if (this.goldbergData.faceYaxis) {
            goldbergData.faceYaxis = [];
            for (var _f = 0, _g = this.goldbergData.faceYaxis; _f < _g.length; _f++) {
                var vector = _g[_f];
                goldbergData.faceYaxis.push(vector.asArray());
            }
        }
        if (this.goldbergData.faceXaxis) {
            goldbergData.faceXaxis = [];
            for (var _h = 0, _j = this.goldbergData.faceXaxis; _h < _j.length; _h++) {
                var vector = _j[_h];
                goldbergData.faceXaxis.push(vector.asArray());
            }
        }
        serializationObject.goldbergData = goldbergData;
    };
    /**
     * Parses a serialized goldberg mesh
     * @param parsedMesh the serialized mesh
     * @param scene the scene to create the goldberg mesh in
     * @returns the created goldberg mesh
     */
    GoldbergMesh.Parse = function (parsedMesh, scene) {
        var goldbergData = parsedMesh.goldbergData;
        goldbergData.faceColors = goldbergData.faceColors.map(function (el) { return Color4.FromArray(el); });
        goldbergData.faceCenters = goldbergData.faceCenters.map(function (el) { return Vector3.FromArray(el); });
        goldbergData.faceZaxis = goldbergData.faceZaxis.map(function (el) { return Vector3.FromArray(el); });
        goldbergData.faceXaxis = goldbergData.faceXaxis.map(function (el) { return Vector3.FromArray(el); });
        goldbergData.faceYaxis = goldbergData.faceYaxis.map(function (el) { return Vector3.FromArray(el); });
        var goldberg = new GoldbergMesh(parsedMesh.name, scene);
        goldberg.goldbergData = goldbergData;
        return goldberg;
    };
    return GoldbergMesh;
}(Mesh));
export { GoldbergMesh };
//# sourceMappingURL=goldbergMesh.js.map