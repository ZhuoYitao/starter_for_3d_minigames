import { Vector3 } from "../../Maths/math.vector.js";
import { Scalar } from "../../Maths/math.scalar.js";
import { SphericalPolynomial, SphericalHarmonics } from "../../Maths/sphericalPolynomial.js";

import { ToLinearSpace } from "../../Maths/math.constants.js";
import { Color3 } from "../../Maths/math.color.js";
var FileFaceOrientation = /** @class */ (function () {
    function FileFaceOrientation(name, worldAxisForNormal, worldAxisForFileX, worldAxisForFileY) {
        this.name = name;
        this.worldAxisForNormal = worldAxisForNormal;
        this.worldAxisForFileX = worldAxisForFileX;
        this.worldAxisForFileY = worldAxisForFileY;
    }
    return FileFaceOrientation;
}());
/**
 * Helper class dealing with the extraction of spherical polynomial dataArray
 * from a cube map.
 */
var CubeMapToSphericalPolynomialTools = /** @class */ (function () {
    function CubeMapToSphericalPolynomialTools() {
    }
    /**
     * Converts a texture to the according Spherical Polynomial data.
     * This extracts the first 3 orders only as they are the only one used in the lighting.
     *
     * @param texture The texture to extract the information from.
     * @return The Spherical Polynomial data.
     */
    CubeMapToSphericalPolynomialTools.ConvertCubeMapTextureToSphericalPolynomial = function (texture) {
        var _this = this;
        var _a;
        if (!texture.isCube) {
            // Only supports cube Textures currently.
            return null;
        }
        (_a = texture.getScene()) === null || _a === void 0 ? void 0 : _a.getEngine().flushFramebuffer();
        var size = texture.getSize().width;
        var rightPromise = texture.readPixels(0, undefined, undefined, false);
        var leftPromise = texture.readPixels(1, undefined, undefined, false);
        var upPromise;
        var downPromise;
        if (texture.isRenderTarget) {
            upPromise = texture.readPixels(3, undefined, undefined, false);
            downPromise = texture.readPixels(2, undefined, undefined, false);
        }
        else {
            upPromise = texture.readPixels(2, undefined, undefined, false);
            downPromise = texture.readPixels(3, undefined, undefined, false);
        }
        var frontPromise = texture.readPixels(4, undefined, undefined, false);
        var backPromise = texture.readPixels(5, undefined, undefined, false);
        var gammaSpace = texture.gammaSpace;
        // Always read as RGBA.
        var format = 5;
        var type = 0;
        if (texture.textureType == 1 || texture.textureType == 2) {
            type = 1;
        }
        return new Promise(function (resolve) {
            Promise.all([leftPromise, rightPromise, upPromise, downPromise, frontPromise, backPromise]).then(function (_a) {
                var left = _a[0], right = _a[1], up = _a[2], down = _a[3], front = _a[4], back = _a[5];
                var cubeInfo = {
                    size: size,
                    right: right,
                    left: left,
                    up: up,
                    down: down,
                    front: front,
                    back: back,
                    format: format,
                    type: type,
                    gammaSpace: gammaSpace,
                };
                resolve(_this.ConvertCubeMapToSphericalPolynomial(cubeInfo));
            });
        });
    };
    /**
     * Compute the area on the unit sphere of the rectangle defined by (x,y) and the origin
     * See https://www.rorydriscoll.com/2012/01/15/cubemap-texel-solid-angle/
     * @param x
     * @param y
     */
    CubeMapToSphericalPolynomialTools._AreaElement = function (x, y) {
        return Math.atan2(x * y, Math.sqrt(x * x + y * y + 1));
    };
    /**
     * Converts a cubemap to the according Spherical Polynomial data.
     * This extracts the first 3 orders only as they are the only one used in the lighting.
     *
     * @param cubeInfo The Cube map to extract the information from.
     * @return The Spherical Polynomial data.
     */
    CubeMapToSphericalPolynomialTools.ConvertCubeMapToSphericalPolynomial = function (cubeInfo) {
        var sphericalHarmonics = new SphericalHarmonics();
        var totalSolidAngle = 0.0;
        // The (u,v) range is [-1,+1], so the distance between each texel is 2/Size.
        var du = 2.0 / cubeInfo.size;
        var dv = du;
        var halfTexel = 0.5 * du;
        // The (u,v) of the first texel is half a texel from the corner (-1,-1).
        var minUV = halfTexel - 1.0;
        for (var faceIndex = 0; faceIndex < 6; faceIndex++) {
            var fileFace = this._FileFaces[faceIndex];
            var dataArray = cubeInfo[fileFace.name];
            var v = minUV;
            // TODO: we could perform the summation directly into a SphericalPolynomial (SP), which is more efficient than SphericalHarmonic (SH).
            // This is possible because during the summation we do not need the SH-specific properties, e.g. orthogonality.
            // Because SP is still linear, so summation is fine in that basis.
            var stride = cubeInfo.format === 5 ? 4 : 3;
            for (var y = 0; y < cubeInfo.size; y++) {
                var u = minUV;
                for (var x = 0; x < cubeInfo.size; x++) {
                    // World direction (not normalised)
                    var worldDirection = fileFace.worldAxisForFileX.scale(u).add(fileFace.worldAxisForFileY.scale(v)).add(fileFace.worldAxisForNormal);
                    worldDirection.normalize();
                    var deltaSolidAngle = this._AreaElement(u - halfTexel, v - halfTexel) -
                        this._AreaElement(u - halfTexel, v + halfTexel) -
                        this._AreaElement(u + halfTexel, v - halfTexel) +
                        this._AreaElement(u + halfTexel, v + halfTexel);
                    var r = dataArray[y * cubeInfo.size * stride + x * stride + 0];
                    var g = dataArray[y * cubeInfo.size * stride + x * stride + 1];
                    var b = dataArray[y * cubeInfo.size * stride + x * stride + 2];
                    // Prevent NaN harmonics with extreme HDRI data.
                    if (isNaN(r)) {
                        r = 0;
                    }
                    if (isNaN(g)) {
                        g = 0;
                    }
                    if (isNaN(b)) {
                        b = 0;
                    }
                    // Handle Integer types.
                    if (cubeInfo.type === 0) {
                        r /= 255;
                        g /= 255;
                        b /= 255;
                    }
                    // Handle Gamma space textures.
                    if (cubeInfo.gammaSpace) {
                        r = Math.pow(Scalar.Clamp(r), ToLinearSpace);
                        g = Math.pow(Scalar.Clamp(g), ToLinearSpace);
                        b = Math.pow(Scalar.Clamp(b), ToLinearSpace);
                    }
                    // Prevent to explode in case of really high dynamic ranges.
                    // sh 3 would not be enough to accurately represent it.
                    var max = 4096;
                    r = Scalar.Clamp(r, 0, max);
                    g = Scalar.Clamp(g, 0, max);
                    b = Scalar.Clamp(b, 0, max);
                    var color = new Color3(r, g, b);
                    sphericalHarmonics.addLight(worldDirection, color, deltaSolidAngle);
                    totalSolidAngle += deltaSolidAngle;
                    u += du;
                }
                v += dv;
            }
        }
        // Solid angle for entire sphere is 4*pi
        var sphereSolidAngle = 4.0 * Math.PI;
        // Adjust the solid angle to allow for how many faces we processed.
        var facesProcessed = 6.0;
        var expectedSolidAngle = (sphereSolidAngle * facesProcessed) / 6.0;
        // Adjust the harmonics so that the accumulated solid angle matches the expected solid angle.
        // This is needed because the numerical integration over the cube uses a
        // small angle approximation of solid angle for each texel (see deltaSolidAngle),
        // and also to compensate for accumulative error due to float precision in the summation.
        var correctionFactor = expectedSolidAngle / totalSolidAngle;
        sphericalHarmonics.scaleInPlace(correctionFactor);
        sphericalHarmonics.convertIncidentRadianceToIrradiance();
        sphericalHarmonics.convertIrradianceToLambertianRadiance();
        return SphericalPolynomial.FromHarmonics(sphericalHarmonics);
    };
    CubeMapToSphericalPolynomialTools._FileFaces = [
        new FileFaceOrientation("right", new Vector3(1, 0, 0), new Vector3(0, 0, -1), new Vector3(0, -1, 0)),
        new FileFaceOrientation("left", new Vector3(-1, 0, 0), new Vector3(0, 0, 1), new Vector3(0, -1, 0)),
        new FileFaceOrientation("up", new Vector3(0, 1, 0), new Vector3(1, 0, 0), new Vector3(0, 0, 1)),
        new FileFaceOrientation("down", new Vector3(0, -1, 0), new Vector3(1, 0, 0), new Vector3(0, 0, -1)),
        new FileFaceOrientation("front", new Vector3(0, 0, 1), new Vector3(1, 0, 0), new Vector3(0, -1, 0)),
        new FileFaceOrientation("back", new Vector3(0, 0, -1), new Vector3(-1, 0, 0), new Vector3(0, -1, 0)), // -Z bottom
    ];
    return CubeMapToSphericalPolynomialTools;
}());
export { CubeMapToSphericalPolynomialTools };
//# sourceMappingURL=cubemapToSphericalPolynomial.js.map