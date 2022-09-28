/**
 * Class used to represent a specific level of detail of a mesh
 * @see https://doc.babylonjs.com/how_to/how_to_use_lod
 */
var MeshLODLevel = /** @class */ (function () {
    /**
     * Creates a new LOD level
     * @param distanceOrScreenCoverage defines either the distance or the screen coverage where this level should start being displayed
     * @param mesh defines the mesh to use to render this level
     */
    function MeshLODLevel(
    /** Either distance from the center of the object to show this level or the screen coverage if `useLODScreenCoverage` is set to `true` on the mesh*/
    distanceOrScreenCoverage, 
    /** Defines the mesh to use to render this level */
    mesh) {
        this.distanceOrScreenCoverage = distanceOrScreenCoverage;
        this.mesh = mesh;
    }
    return MeshLODLevel;
}());
export { MeshLODLevel };
//# sourceMappingURL=meshLODLevel.js.map