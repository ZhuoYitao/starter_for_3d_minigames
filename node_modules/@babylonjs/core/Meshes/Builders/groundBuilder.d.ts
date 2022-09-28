import type { Scene } from "../../scene";
import { Color3 } from "../../Maths/math.color";
import { Mesh } from "../mesh";
import { VertexData } from "../mesh.vertexData";
import { GroundMesh } from "../groundMesh";
import type { Nullable } from "../../types";
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
 */
export declare function CreateGroundVertexData(options: {
    width?: number;
    height?: number;
    subdivisions?: number;
    subdivisionsX?: number;
    subdivisionsY?: number;
}): VertexData;
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
 */
export declare function CreateTiledGroundVertexData(options: {
    xmin: number;
    zmin: number;
    xmax: number;
    zmax: number;
    subdivisions?: {
        w: number;
        h: number;
    };
    precision?: {
        w: number;
        h: number;
    };
}): VertexData;
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
 */
export declare function CreateGroundFromHeightMapVertexData(options: {
    width: number;
    height: number;
    subdivisions: number;
    minHeight: number;
    maxHeight: number;
    colorFilter: Color3;
    buffer: Uint8Array;
    bufferWidth: number;
    bufferHeight: number;
    alphaFilter: number;
}): VertexData;
/**
 * Creates a ground mesh
 * * The parameters `width` and `height` (floats, default 1) set the width and height sizes of the ground
 * * The parameter `subdivisions` (positive integer) sets the number of subdivisions per side
 * * The mesh can be set to updatable with the boolean parameter `updatable` (default false) if its internal geometry is supposed to change once created
 * @param name defines the name of the mesh
 * @param options defines the options used to create the mesh
 * @param options.width
 * @param options.height
 * @param options.subdivisions
 * @param options.subdivisionsX
 * @param options.subdivisionsY
 * @param options.updatable
 * @param scene defines the hosting scene
 * @returns the ground mesh
 * @see https://doc.babylonjs.com/how_to/set_shapes#ground
 */
export declare function CreateGround(name: string, options?: {
    width?: number;
    height?: number;
    subdivisions?: number;
    subdivisionsX?: number;
    subdivisionsY?: number;
    updatable?: boolean;
}, scene?: Scene): Mesh;
/**
 * Creates a tiled ground mesh
 * * The parameters `xmin` and `xmax` (floats, default -1 and 1) set the ground minimum and maximum X coordinates
 * * The parameters `zmin` and `zmax` (floats, default -1 and 1) set the ground minimum and maximum Z coordinates
 * * The parameter `subdivisions` is a javascript object `{w: positive integer, h: positive integer}` (default `{w: 6, h: 6}`). `w` and `h` are the numbers of subdivisions on the ground width and height. Each subdivision is called a tile
 * * The parameter `precision` is a javascript object `{w: positive integer, h: positive integer}` (default `{w: 2, h: 2}`). `w` and `h` are the numbers of subdivisions on the ground width and height of each tile
 * * The mesh can be set to updatable with the boolean parameter `updatable` (default false) if its internal geometry is supposed to change once created.
 * @param name defines the name of the mesh
 * @param options defines the options used to create the mesh
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
 * @param options.updatable
 * @param scene defines the hosting scene
 * @returns the tiled ground mesh
 * @see https://doc.babylonjs.com/how_to/set_shapes#tiled-ground
 */
export declare function CreateTiledGround(name: string, options: {
    xmin: number;
    zmin: number;
    xmax: number;
    zmax: number;
    subdivisions?: {
        w: number;
        h: number;
    };
    precision?: {
        w: number;
        h: number;
    };
    updatable?: boolean;
}, scene?: Nullable<Scene>): Mesh;
/**
 * Creates a ground mesh from a height map
 * * The parameter `url` sets the URL of the height map image resource.
 * * The parameters `width` and `height` (positive floats, default 10) set the ground width and height sizes.
 * * The parameter `subdivisions` (positive integer, default 1) sets the number of subdivision per side.
 * * The parameter `minHeight` (float, default 0) is the minimum altitude on the ground.
 * * The parameter `maxHeight` (float, default 1) is the maximum altitude on the ground.
 * * The parameter `colorFilter` (optional Color3, default (0.3, 0.59, 0.11) ) is the filter to apply to the image pixel colors to compute the height.
 * * The parameter `onReady` is a javascript callback function that will be called  once the mesh is just built (the height map download can last some time).
 * * The parameter `alphaFilter` will filter any data where the alpha channel is below this value, defaults 0 (all data visible)
 * * The mesh can be set to updatable with the boolean parameter `updatable` (default false) if its internal geometry is supposed to change once created.
 * @param name defines the name of the mesh
 * @param url defines the url to the height map
 * @param options defines the options used to create the mesh
 * @param options.width
 * @param options.height
 * @param options.subdivisions
 * @param options.minHeight
 * @param options.maxHeight
 * @param options.colorFilter
 * @param options.alphaFilter
 * @param options.updatable
 * @param options.onReady
 * @param scene defines the hosting scene
 * @returns the ground mesh
 * @see https://doc.babylonjs.com/babylon101/height_map
 * @see https://doc.babylonjs.com/how_to/set_shapes#ground-from-a-height-map
 */
export declare function CreateGroundFromHeightMap(name: string, url: string, options?: {
    width?: number;
    height?: number;
    subdivisions?: number;
    minHeight?: number;
    maxHeight?: number;
    colorFilter?: Color3;
    alphaFilter?: number;
    updatable?: boolean;
    onReady?: (mesh: GroundMesh) => void;
}, scene?: Nullable<Scene>): GroundMesh;
/**
 * Class containing static functions to help procedurally build meshes
 * @deprecated use the functions directly from the module
 */
export declare const GroundBuilder: {
    CreateGround: typeof CreateGround;
    CreateGroundFromHeightMap: typeof CreateGroundFromHeightMap;
    CreateTiledGround: typeof CreateTiledGround;
};
