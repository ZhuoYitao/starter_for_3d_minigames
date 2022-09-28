import { Vector3 } from "../Maths/math.vector";
import { _IsoVector } from "../Maths/math.isovector";
/**
 * Class representing data for one face OAB of an equilateral icosahedron
 * When O is the isovector (0, 0), A is isovector (m, n)
 * @hidden
 */
export declare class _PrimaryIsoTriangle {
    m: number;
    n: number;
    cartesian: Vector3[];
    vertices: _IsoVector[];
    max: number[];
    min: number[];
    vecToidx: {
        [key: string]: number;
    };
    vertByDist: {
        [key: string]: number[];
    };
    closestTo: number[][];
    innerFacets: string[][];
    isoVecsABOB: _IsoVector[][];
    isoVecsOBOA: _IsoVector[][];
    isoVecsBAOA: _IsoVector[][];
    vertexTypes: number[][];
    coau: number;
    cobu: number;
    coav: number;
    cobv: number;
    IDATA: PolyhedronData;
    /**
     * Creates the PrimaryIsoTriangle Triangle OAB
     * @param m an integer
     * @param n an integer
     */
    setIndices(): void;
    calcCoeffs(): void;
    createInnerFacets(): void;
    edgeVecsABOB(): void;
    mapABOBtoOBOA(): void;
    mapABOBtoBAOA(): void;
    MapToFace(faceNb: number, geodesicData: PolyhedronData): void;
    /**Creates a primary triangle
     * @param m
     * @param n
     * @hidden
     */
    build(m: number, n: number): this;
}
/** Builds Polyhedron Data
 * @hidden
 */
export declare class PolyhedronData {
    name: string;
    category: string;
    vertex: number[][];
    face: number[][];
    edgematch: (number | string)[][];
    constructor(name: string, category: string, vertex: number[][], face: number[][]);
}
/**
 * This class Extends the PolyhedronData Class to provide measures for a Geodesic Polyhedron
 */
export declare class GeodesicData extends PolyhedronData {
    /**
     * @hidden
     */
    edgematch: (number | string)[][];
    /**
     * @hidden
     */
    adjacentFaces: number[][];
    /**
     * @hidden
     */
    sharedNodes: number;
    /**
     * @hidden
     */
    poleNodes: number;
    /**
     * @param face
     * @param primTri
     * @hidden
     */
    innerToData(face: number, primTri: _PrimaryIsoTriangle): void;
    /**
     * @param faceNb
     * @param primTri
     * @hidden
     */
    mapABOBtoDATA(faceNb: number, primTri: _PrimaryIsoTriangle): void;
    /**
     * @param faceNb
     * @param primTri
     * @hidden
     */
    mapOBOAtoDATA(faceNb: number, primTri: _PrimaryIsoTriangle): void;
    /**
     * @param faceNb
     * @param primTri
     * @hidden
     */
    mapBAOAtoDATA(faceNb: number, primTri: _PrimaryIsoTriangle): void;
    /**
     * @param primTri
     * @hidden
     */
    orderData(primTri: _PrimaryIsoTriangle): void;
    /**
     * @param m
     * @param faces
     * @hidden
     */
    setOrder(m: number, faces: number[]): number[];
    /**
     * @hidden
     */
    toGoldbergPolyhedronData(): PolyhedronData;
    /**Builds the data for a Geodesic Polyhedron from a primary triangle
     * @param primTri the primary triangle
     * @hidden
     */
    static BuildGeodesicData(primTri: _PrimaryIsoTriangle): GeodesicData;
}
