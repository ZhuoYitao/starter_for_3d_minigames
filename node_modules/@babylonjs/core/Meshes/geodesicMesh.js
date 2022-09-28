import { __extends } from "tslib";
import { Vector3, TmpVectors } from "../Maths/math.vector.js";
import { Scalar } from "../Maths/math.scalar.js";
import { PHI } from "../Maths/math.constants.js";
import { _IsoVector } from "../Maths/math.isovector.js";
/**
 * Class representing data for one face OAB of an equilateral icosahedron
 * When O is the isovector (0, 0), A is isovector (m, n)
 * @hidden
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
var _PrimaryIsoTriangle = /** @class */ (function () {
    function _PrimaryIsoTriangle() {
        this.cartesian = [];
        this.vertices = [];
        this.max = [];
        this.min = [];
        this.closestTo = [];
        this.innerFacets = [];
        this.isoVecsABOB = [];
        this.isoVecsOBOA = [];
        this.isoVecsBAOA = [];
        this.vertexTypes = [];
        // eslint-disable-next-line @typescript-eslint/naming-convention
        this.IDATA = new PolyhedronData("icosahedron", "Regular", [
            [0, PHI, -1],
            [-PHI, 1, 0],
            [-1, 0, -PHI],
            [1, 0, -PHI],
            [PHI, 1, 0],
            [0, PHI, 1],
            [-1, 0, PHI],
            [-PHI, -1, 0],
            [0, -PHI, -1],
            [PHI, -1, 0],
            [1, 0, PHI],
            [0, -PHI, 1],
        ], [
            [0, 2, 1],
            [0, 3, 2],
            [0, 4, 3],
            [0, 5, 4],
            [0, 1, 5],
            [7, 6, 1],
            [8, 7, 2],
            [9, 8, 3],
            [10, 9, 4],
            [6, 10, 5],
            [2, 7, 1],
            [3, 8, 2],
            [4, 9, 3],
            [5, 10, 4],
            [1, 6, 5],
            [11, 6, 7],
            [11, 7, 8],
            [11, 8, 9],
            [11, 9, 10],
            [11, 10, 6],
        ]);
    }
    /**
     * Creates the PrimaryIsoTriangle Triangle OAB
     * @param m an integer
     * @param n an integer
     */
    //operators
    _PrimaryIsoTriangle.prototype.setIndices = function () {
        var indexCount = 12; // 12 vertices already assigned
        var vecToidx = {}; //maps iso-vectors to indexCount;
        var m = this.m;
        var n = this.n;
        var g = m; // hcf of m, n when n != 0
        var m1 = 1;
        var n1 = 0;
        if (n !== 0) {
            g = Scalar.HCF(m, n);
        }
        m1 = m / g;
        n1 = n / g;
        var fr; //face to the right of current face
        var rot; //rotation about which vertex for fr
        var O;
        var A;
        var B;
        var oVec = _IsoVector.Zero();
        var aVec = new _IsoVector(m, n);
        var bVec = new _IsoVector(-n, m + n);
        var oaVec = _IsoVector.Zero();
        var abVec = _IsoVector.Zero();
        var obVec = _IsoVector.Zero();
        var verts = [];
        var idx;
        var idxR;
        var isoId;
        var isoIdR;
        var closestTo = [];
        var vDist = this.vertByDist;
        var matchIdx = function (f, fr, isoId, isoIdR) {
            idx = f + "|" + isoId;
            idxR = fr + "|" + isoIdR;
            if (!(idx in vecToidx || idxR in vecToidx)) {
                vecToidx[idx] = indexCount;
                vecToidx[idxR] = indexCount;
                indexCount++;
            }
            else if (idx in vecToidx && !(idxR in vecToidx)) {
                vecToidx[idxR] = vecToidx[idx];
            }
            else if (idxR in vecToidx && !(idx in vecToidx)) {
                vecToidx[idx] = vecToidx[idxR];
            }
            if (vDist[isoId][0] > 2) {
                closestTo[vecToidx[idx]] = [-vDist[isoId][0], vDist[isoId][1], vecToidx[idx]];
            }
            else {
                closestTo[vecToidx[idx]] = [verts[vDist[isoId][0]], vDist[isoId][1], vecToidx[idx]];
            }
        };
        this.IDATA.edgematch = [
            [1, "B"],
            [2, "B"],
            [3, "B"],
            [4, "B"],
            [0, "B"],
            [10, "O", 14, "A"],
            [11, "O", 10, "A"],
            [12, "O", 11, "A"],
            [13, "O", 12, "A"],
            [14, "O", 13, "A"],
            [0, "O"],
            [1, "O"],
            [2, "O"],
            [3, "O"],
            [4, "O"],
            [19, "B", 5, "A"],
            [15, "B", 6, "A"],
            [16, "B", 7, "A"],
            [17, "B", 8, "A"],
            [18, "B", 9, "A"],
        ];
        /***edges AB to OB***** rotation about B*/
        for (var f = 0; f < 20; f++) {
            //f current face
            verts = this.IDATA.face[f];
            O = verts[2];
            A = verts[1];
            B = verts[0];
            isoId = oVec.x + "|" + oVec.y;
            idx = f + "|" + isoId;
            if (!(idx in vecToidx)) {
                vecToidx[idx] = O;
                closestTo[O] = [verts[vDist[isoId][0]], vDist[isoId][1]];
            }
            isoId = aVec.x + "|" + aVec.y;
            idx = f + "|" + isoId;
            if (!(idx in vecToidx)) {
                vecToidx[idx] = A;
                closestTo[A] = [verts[vDist[isoId][0]], vDist[isoId][1]];
            }
            isoId = bVec.x + "|" + bVec.y;
            idx = f + "|" + isoId;
            if (!(idx in vecToidx)) {
                vecToidx[idx] = B;
                closestTo[B] = [verts[vDist[isoId][0]], vDist[isoId][1]];
            }
            //for edge vertices
            fr = this.IDATA.edgematch[f][0];
            rot = this.IDATA.edgematch[f][1];
            if (rot === "B") {
                for (var i = 1; i < g; i++) {
                    abVec.x = m - i * (m1 + n1);
                    abVec.y = n + i * m1;
                    obVec.x = -i * n1;
                    obVec.y = i * (m1 + n1);
                    isoId = abVec.x + "|" + abVec.y;
                    isoIdR = obVec.x + "|" + obVec.y;
                    matchIdx(f, fr, isoId, isoIdR);
                }
            }
            if (rot === "O") {
                for (var i = 1; i < g; i++) {
                    obVec.x = -i * n1;
                    obVec.y = i * (m1 + n1);
                    oaVec.x = i * m1;
                    oaVec.y = i * n1;
                    isoId = obVec.x + "|" + obVec.y;
                    isoIdR = oaVec.x + "|" + oaVec.y;
                    matchIdx(f, fr, isoId, isoIdR);
                }
            }
            fr = this.IDATA.edgematch[f][2];
            rot = this.IDATA.edgematch[f][3];
            if (rot && rot === "A") {
                for (var i = 1; i < g; i++) {
                    oaVec.x = i * m1;
                    oaVec.y = i * n1;
                    abVec.x = m - (g - i) * (m1 + n1); //reversed for BA
                    abVec.y = n + (g - i) * m1; //reversed for BA
                    isoId = oaVec.x + "|" + oaVec.y;
                    isoIdR = abVec.x + "|" + abVec.y;
                    matchIdx(f, fr, isoId, isoIdR);
                }
            }
            for (var i = 0; i < this.vertices.length; i++) {
                isoId = this.vertices[i].x + "|" + this.vertices[i].y;
                idx = f + "|" + isoId;
                if (!(idx in vecToidx)) {
                    vecToidx[idx] = indexCount++;
                    if (vDist[isoId][0] > 2) {
                        closestTo[vecToidx[idx]] = [-vDist[isoId][0], vDist[isoId][1], vecToidx[idx]];
                    }
                    else {
                        closestTo[vecToidx[idx]] = [verts[vDist[isoId][0]], vDist[isoId][1], vecToidx[idx]];
                    }
                }
            }
        }
        this.closestTo = closestTo;
        this.vecToidx = vecToidx;
    };
    _PrimaryIsoTriangle.prototype.calcCoeffs = function () {
        var m = this.m;
        var n = this.n;
        var thirdR3 = Math.sqrt(3) / 3;
        var LSQD = m * m + n * n + m * n;
        this.coau = (m + n) / LSQD;
        this.cobu = -n / LSQD;
        this.coav = (-thirdR3 * (m - n)) / LSQD;
        this.cobv = (thirdR3 * (2 * m + n)) / LSQD;
    };
    _PrimaryIsoTriangle.prototype.createInnerFacets = function () {
        var m = this.m;
        var n = this.n;
        for (var y = 0; y < n + m + 1; y++) {
            for (var x = this.min[y]; x < this.max[y] + 1; x++) {
                if (x < this.max[y] && x < this.max[y + 1] + 1) {
                    this.innerFacets.push(["|" + x + "|" + y, "|" + x + "|" + (y + 1), "|" + (x + 1) + "|" + y]);
                }
                if (y > 0 && x < this.max[y - 1] && x + 1 < this.max[y] + 1) {
                    this.innerFacets.push(["|" + x + "|" + y, "|" + (x + 1) + "|" + y, "|" + (x + 1) + "|" + (y - 1)]);
                }
            }
        }
    };
    _PrimaryIsoTriangle.prototype.edgeVecsABOB = function () {
        var m = this.m;
        var n = this.n;
        var B = new _IsoVector(-n, m + n);
        for (var y = 1; y < m + n; y++) {
            var point = new _IsoVector(this.min[y], y);
            var prev = new _IsoVector(this.min[y - 1], y - 1);
            var next = new _IsoVector(this.min[y + 1], y + 1);
            var pointR = point.clone();
            var prevR = prev.clone();
            var nextR = next.clone();
            pointR.rotate60About(B);
            prevR.rotate60About(B);
            nextR.rotate60About(B);
            var maxPoint = new _IsoVector(this.max[pointR.y], pointR.y);
            var maxPrev = new _IsoVector(this.max[pointR.y - 1], pointR.y - 1);
            var maxLeftPrev = new _IsoVector(this.max[pointR.y - 1] - 1, pointR.y - 1);
            if (pointR.x !== maxPoint.x || pointR.y !== maxPoint.y) {
                if (pointR.x !== maxPrev.x) {
                    // type2
                    //up
                    this.vertexTypes.push([1, 0, 0]);
                    this.isoVecsABOB.push([point, maxPrev, maxLeftPrev]);
                    //down
                    this.vertexTypes.push([1, 0, 0]);
                    this.isoVecsABOB.push([point, maxLeftPrev, maxPoint]);
                }
                else if (pointR.y === nextR.y) {
                    // type1
                    //up
                    this.vertexTypes.push([1, 1, 0]);
                    this.isoVecsABOB.push([point, prev, maxPrev]);
                    //down
                    this.vertexTypes.push([1, 0, 1]);
                    this.isoVecsABOB.push([point, maxPrev, next]);
                }
                else {
                    // type 0
                    //up
                    this.vertexTypes.push([1, 1, 0]);
                    this.isoVecsABOB.push([point, prev, maxPrev]);
                    //down
                    this.vertexTypes.push([1, 0, 0]);
                    this.isoVecsABOB.push([point, maxPrev, maxPoint]);
                }
            }
        }
    };
    _PrimaryIsoTriangle.prototype.mapABOBtoOBOA = function () {
        var point = new _IsoVector(0, 0);
        for (var i = 0; i < this.isoVecsABOB.length; i++) {
            var temp = [];
            for (var j = 0; j < 3; j++) {
                point.x = this.isoVecsABOB[i][j].x;
                point.y = this.isoVecsABOB[i][j].y;
                if (this.vertexTypes[i][j] === 0) {
                    point.rotateNeg120(this.m, this.n);
                }
                temp.push(point.clone());
            }
            this.isoVecsOBOA.push(temp);
        }
    };
    _PrimaryIsoTriangle.prototype.mapABOBtoBAOA = function () {
        var point = new _IsoVector(0, 0);
        for (var i = 0; i < this.isoVecsABOB.length; i++) {
            var temp = [];
            for (var j = 0; j < 3; j++) {
                point.x = this.isoVecsABOB[i][j].x;
                point.y = this.isoVecsABOB[i][j].y;
                if (this.vertexTypes[i][j] === 1) {
                    point.rotate120(this.m, this.n);
                }
                temp.push(point.clone());
            }
            this.isoVecsBAOA.push(temp);
        }
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _PrimaryIsoTriangle.prototype.MapToFace = function (faceNb, geodesicData) {
        var F = this.IDATA.face[faceNb];
        var oidx = F[2];
        var aidx = F[1];
        var bidx = F[0];
        var O = Vector3.FromArray(this.IDATA.vertex[oidx]);
        var A = Vector3.FromArray(this.IDATA.vertex[aidx]);
        var B = Vector3.FromArray(this.IDATA.vertex[bidx]);
        var OA = A.subtract(O);
        var OB = B.subtract(O);
        var x = OA.scale(this.coau).add(OB.scale(this.cobu));
        var y = OA.scale(this.coav).add(OB.scale(this.cobv));
        var mapped = [];
        var idx;
        var tempVec = TmpVectors.Vector3[0];
        for (var i = 0; i < this.cartesian.length; i++) {
            tempVec = x.scale(this.cartesian[i].x).add(y.scale(this.cartesian[i].y)).add(O);
            mapped[i] = [tempVec.x, tempVec.y, tempVec.z];
            idx = faceNb + "|" + this.vertices[i].x + "|" + this.vertices[i].y;
            geodesicData.vertex[this.vecToidx[idx]] = [tempVec.x, tempVec.y, tempVec.z];
        }
    };
    //statics
    /**Creates a primary triangle
     * @param m
     * @param n
     * @hidden
     */
    _PrimaryIsoTriangle.prototype.build = function (m, n) {
        var vertices = new Array();
        var O = _IsoVector.Zero();
        var A = new _IsoVector(m, n);
        var B = new _IsoVector(-n, m + n);
        vertices.push(O, A, B);
        //max internal isoceles triangle vertices
        for (var y_1 = n; y_1 < m + 1; y_1++) {
            for (var x_1 = 0; x_1 < m + 1 - y_1; x_1++) {
                vertices.push(new _IsoVector(x_1, y_1));
            }
        }
        //shared vertices along edges when needed
        if (n > 0) {
            var g = Scalar.HCF(m, n);
            var m1 = m / g;
            var n1 = n / g;
            for (var i = 1; i < g; i++) {
                vertices.push(new _IsoVector(i * m1, i * n1)); //OA
                vertices.push(new _IsoVector(-i * n1, i * (m1 + n1))); //OB
                vertices.push(new _IsoVector(m - i * (m1 + n1), n + i * m1)); // AB
            }
            //lower rows vertices and their rotations
            var ratio = m / n;
            for (var y_2 = 1; y_2 < n; y_2++) {
                for (var x_2 = 0; x_2 < y_2 * ratio; x_2++) {
                    vertices.push(new _IsoVector(x_2, y_2));
                    vertices.push(new _IsoVector(x_2, y_2).rotate120(m, n));
                    vertices.push(new _IsoVector(x_2, y_2).rotateNeg120(m, n));
                }
            }
        }
        //order vertices by x and then y
        vertices.sort(function (a, b) {
            return a.x - b.x;
        });
        vertices.sort(function (a, b) {
            return a.y - b.y;
        });
        var min = new Array(m + n + 1);
        var max = new Array(m + n + 1);
        for (var i = 0; i < min.length; i++) {
            min[i] = Infinity;
            max[i] = -Infinity;
        }
        var y = 0;
        var x = 0;
        var len = vertices.length;
        for (var i = 0; i < len; i++) {
            x = vertices[i].x;
            y = vertices[i].y;
            min[y] = Math.min(x, min[y]);
            max[y] = Math.max(x, max[y]);
        }
        //calculates the distance of a vertex from a given primary vertex
        var distFrom = function (vert, primVert) {
            var v = vert.clone();
            if (primVert === "A") {
                v.rotateNeg120(m, n);
            }
            if (primVert === "B") {
                v.rotate120(m, n);
            }
            if (v.x < 0) {
                return v.y;
            }
            return v.x + v.y;
        };
        var cartesian = [];
        var distFromO = [];
        var distFromA = [];
        var distFromB = [];
        var vertByDist = {};
        var vertData = [];
        var closest = -1;
        var dist = -1;
        for (var i = 0; i < len; i++) {
            cartesian[i] = vertices[i].toCartesianOrigin(new _IsoVector(0, 0), 0.5);
            distFromO[i] = distFrom(vertices[i], "O");
            distFromA[i] = distFrom(vertices[i], "A");
            distFromB[i] = distFrom(vertices[i], "B");
            if (distFromO[i] === distFromA[i] && distFromA[i] === distFromB[i]) {
                closest = 3;
                dist = distFromO[i];
            }
            else if (distFromO[i] === distFromA[i]) {
                closest = 4;
                dist = distFromO[i];
            }
            else if (distFromA[i] === distFromB[i]) {
                closest = 5;
                dist = distFromA[i];
            }
            else if (distFromB[i] === distFromO[i]) {
                closest = 6;
                dist = distFromO[i];
            }
            if (distFromO[i] < distFromA[i] && distFromO[i] < distFromB[i]) {
                closest = 2;
                dist = distFromO[i];
            }
            if (distFromA[i] < distFromO[i] && distFromA[i] < distFromB[i]) {
                closest = 1;
                dist = distFromA[i];
            }
            if (distFromB[i] < distFromA[i] && distFromB[i] < distFromO[i]) {
                closest = 0;
                dist = distFromB[i];
            }
            vertData.push([closest, dist, vertices[i].x, vertices[i].y]);
        }
        vertData.sort(function (a, b) {
            return a[2] - b[2];
        });
        vertData.sort(function (a, b) {
            return a[3] - b[3];
        });
        vertData.sort(function (a, b) {
            return a[1] - b[1];
        });
        vertData.sort(function (a, b) {
            return a[0] - b[0];
        });
        for (var v = 0; v < vertData.length; v++) {
            vertByDist[vertData[v][2] + "|" + vertData[v][3]] = [vertData[v][0], vertData[v][1], v];
        }
        this.m = m;
        this.n = n;
        this.vertices = vertices;
        this.vertByDist = vertByDist;
        this.cartesian = cartesian;
        this.min = min;
        this.max = max;
        return this;
    };
    return _PrimaryIsoTriangle;
}());
export { _PrimaryIsoTriangle };
/** Builds Polyhedron Data
 * @hidden
 */
var PolyhedronData = /** @class */ (function () {
    function PolyhedronData(name, category, vertex, face) {
        this.name = name;
        this.category = category;
        this.vertex = vertex;
        this.face = face;
    }
    return PolyhedronData;
}());
export { PolyhedronData };
/**
 * This class Extends the PolyhedronData Class to provide measures for a Geodesic Polyhedron
 */
var GeodesicData = /** @class */ (function (_super) {
    __extends(GeodesicData, _super);
    function GeodesicData() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param face
     * @param primTri
     * @hidden
     */
    GeodesicData.prototype.innerToData = function (face, primTri) {
        for (var i = 0; i < primTri.innerFacets.length; i++) {
            this.face.push(primTri.innerFacets[i].map(function (el) { return primTri.vecToidx[face + el]; }));
        }
    };
    /**
     * @param faceNb
     * @param primTri
     * @hidden
     */
    GeodesicData.prototype.mapABOBtoDATA = function (faceNb, primTri) {
        var fr = primTri.IDATA.edgematch[faceNb][0];
        for (var i = 0; i < primTri.isoVecsABOB.length; i++) {
            var temp = [];
            for (var j = 0; j < 3; j++) {
                if (primTri.vertexTypes[i][j] === 0) {
                    temp.push(faceNb + "|" + primTri.isoVecsABOB[i][j].x + "|" + primTri.isoVecsABOB[i][j].y);
                }
                else {
                    temp.push(fr + "|" + primTri.isoVecsABOB[i][j].x + "|" + primTri.isoVecsABOB[i][j].y);
                }
            }
            this.face.push([primTri.vecToidx[temp[0]], primTri.vecToidx[temp[1]], primTri.vecToidx[temp[2]]]);
        }
    };
    /**
     * @param faceNb
     * @param primTri
     * @hidden
     */
    GeodesicData.prototype.mapOBOAtoDATA = function (faceNb, primTri) {
        var fr = primTri.IDATA.edgematch[faceNb][0];
        for (var i = 0; i < primTri.isoVecsOBOA.length; i++) {
            var temp = [];
            for (var j = 0; j < 3; j++) {
                if (primTri.vertexTypes[i][j] === 1) {
                    temp.push(faceNb + "|" + primTri.isoVecsOBOA[i][j].x + "|" + primTri.isoVecsOBOA[i][j].y);
                }
                else {
                    temp.push(fr + "|" + primTri.isoVecsOBOA[i][j].x + "|" + primTri.isoVecsOBOA[i][j].y);
                }
            }
            this.face.push([primTri.vecToidx[temp[0]], primTri.vecToidx[temp[1]], primTri.vecToidx[temp[2]]]);
        }
    };
    /**
     * @param faceNb
     * @param primTri
     * @hidden
     */
    GeodesicData.prototype.mapBAOAtoDATA = function (faceNb, primTri) {
        var fr = primTri.IDATA.edgematch[faceNb][2];
        for (var i = 0; i < primTri.isoVecsBAOA.length; i++) {
            var temp = [];
            for (var j = 0; j < 3; j++) {
                if (primTri.vertexTypes[i][j] === 1) {
                    temp.push(faceNb + "|" + primTri.isoVecsBAOA[i][j].x + "|" + primTri.isoVecsBAOA[i][j].y);
                }
                else {
                    temp.push(fr + "|" + primTri.isoVecsBAOA[i][j].x + "|" + primTri.isoVecsBAOA[i][j].y);
                }
            }
            this.face.push([primTri.vecToidx[temp[0]], primTri.vecToidx[temp[1]], primTri.vecToidx[temp[2]]]);
        }
    };
    /**
     * @param primTri
     * @hidden
     */
    GeodesicData.prototype.orderData = function (primTri) {
        var nearTo = [];
        for (var i = 0; i < 13; i++) {
            nearTo[i] = [];
        }
        var close = primTri.closestTo;
        for (var i = 0; i < close.length; i++) {
            if (close[i][0] > -1) {
                if (close[i][1] > 0) {
                    nearTo[close[i][0]].push([i, close[i][1]]);
                }
            }
            else {
                nearTo[12].push([i, close[i][0]]);
            }
        }
        var near = [];
        for (var i = 0; i < 12; i++) {
            near[i] = i;
        }
        var nearIndex = 12;
        for (var i = 0; i < 12; i++) {
            nearTo[i].sort(function (a, b) {
                return a[1] - b[1];
            });
            for (var j = 0; j < nearTo[i].length; j++) {
                near[nearTo[i][j][0]] = nearIndex++;
            }
        }
        for (var j = 0; j < nearTo[12].length; j++) {
            near[nearTo[12][j][0]] = nearIndex++;
        }
        for (var i = 0; i < this.vertex.length; i++) {
            this.vertex[i].push(near[i]);
        }
        this.vertex.sort(function (a, b) {
            return a[3] - b[3];
        });
        for (var i = 0; i < this.vertex.length; i++) {
            this.vertex[i].pop();
        }
        for (var i = 0; i < this.face.length; i++) {
            for (var j = 0; j < this.face[i].length; j++) {
                this.face[i][j] = near[this.face[i][j]];
            }
        }
        this.sharedNodes = nearTo[12].length;
        this.poleNodes = this.vertex.length - this.sharedNodes;
    };
    /**
     * @param m
     * @param faces
     * @hidden
     */
    GeodesicData.prototype.setOrder = function (m, faces) {
        var adjVerts = [];
        var dualFaces = [];
        var face = faces.pop();
        dualFaces.push(face);
        var index = this.face[face].indexOf(m);
        index = (index + 2) % 3;
        var v = this.face[face][index];
        adjVerts.push(v);
        var f = 0;
        while (faces.length > 0) {
            face = faces[f];
            if (this.face[face].indexOf(v) > -1) {
                // v is a vertex of face f
                index = (this.face[face].indexOf(v) + 1) % 3;
                v = this.face[face][index];
                adjVerts.push(v);
                dualFaces.push(face);
                faces.splice(f, 1);
                f = 0;
            }
            else {
                f++;
            }
        }
        this.adjacentFaces.push(adjVerts);
        return dualFaces;
    };
    /**
     * @hidden
     */
    GeodesicData.prototype.toGoldbergPolyhedronData = function () {
        var _this = this;
        var goldbergPolyhedronData = new PolyhedronData("GeoDual", "Goldberg", [], []);
        goldbergPolyhedronData.name = "GD dual";
        var verticesNb = this.vertex.length;
        var map = new Array(verticesNb);
        for (var v = 0; v < verticesNb; v++) {
            map[v] = [];
        }
        for (var f = 0; f < this.face.length; f++) {
            for (var i = 0; i < 3; i++) {
                map[this.face[f][i]].push(f);
            }
        }
        var cx = 0;
        var cy = 0;
        var cz = 0;
        var face = [];
        var vertex = [];
        this.adjacentFaces = [];
        for (var m = 0; m < map.length; m++) {
            goldbergPolyhedronData.face[m] = this.setOrder(m, map[m].concat([]));
            map[m].forEach(function (el) {
                cx = 0;
                cy = 0;
                cz = 0;
                face = _this.face[el];
                for (var i = 0; i < 3; i++) {
                    vertex = _this.vertex[face[i]];
                    cx += vertex[0];
                    cy += vertex[1];
                    cz += vertex[2];
                }
                goldbergPolyhedronData.vertex[el] = [cx / 3, cy / 3, cz / 3];
            });
        }
        return goldbergPolyhedronData;
    };
    //statics
    /**Builds the data for a Geodesic Polyhedron from a primary triangle
     * @param primTri the primary triangle
     * @hidden
     */
    GeodesicData.BuildGeodesicData = function (primTri) {
        var geodesicData = new GeodesicData("Geodesic-m-n", "Geodesic", [
            [0, PHI, -1],
            [-PHI, 1, 0],
            [-1, 0, -PHI],
            [1, 0, -PHI],
            [PHI, 1, 0],
            [0, PHI, 1],
            [-1, 0, PHI],
            [-PHI, -1, 0],
            [0, -PHI, -1],
            [PHI, -1, 0],
            [1, 0, PHI],
            [0, -PHI, 1],
        ], []);
        primTri.setIndices();
        primTri.calcCoeffs();
        primTri.createInnerFacets();
        primTri.edgeVecsABOB();
        primTri.mapABOBtoOBOA();
        primTri.mapABOBtoBAOA();
        for (var f = 0; f < primTri.IDATA.face.length; f++) {
            primTri.MapToFace(f, geodesicData);
            geodesicData.innerToData(f, primTri);
            if (primTri.IDATA.edgematch[f][1] === "B") {
                geodesicData.mapABOBtoDATA(f, primTri);
            }
            if (primTri.IDATA.edgematch[f][1] === "O") {
                geodesicData.mapOBOAtoDATA(f, primTri);
            }
            if (primTri.IDATA.edgematch[f][3] === "A") {
                geodesicData.mapBAOAtoDATA(f, primTri);
            }
        }
        geodesicData.orderData(primTri);
        var radius = 1;
        geodesicData.vertex = geodesicData.vertex.map(function (el) {
            var a = el[0];
            var b = el[1];
            var c = el[2];
            var d = Math.sqrt(a * a + b * b + c * c);
            el[0] *= radius / d;
            el[1] *= radius / d;
            el[2] *= radius / d;
            return el;
        });
        return geodesicData;
    };
    return GeodesicData;
}(PolyhedronData));
export { GeodesicData };
//# sourceMappingURL=geodesicMesh.js.map