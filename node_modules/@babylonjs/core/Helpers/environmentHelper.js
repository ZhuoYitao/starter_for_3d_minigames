import { __assign } from "tslib";
import { Observable } from "../Misc/observable.js";
import { ArcRotateCamera } from "../Cameras/arcRotateCamera.js";
import { Vector3 } from "../Maths/math.vector.js";
import { Color3, Color4 } from "../Maths/math.color.js";
import { Mesh } from "../Meshes/mesh.js";
import { BaseTexture } from "../Materials/Textures/baseTexture.js";
import { Texture } from "../Materials/Textures/texture.js";
import { MirrorTexture } from "../Materials/Textures/mirrorTexture.js";
import { CubeTexture } from "../Materials/Textures/cubeTexture.js";
import { BackgroundMaterial } from "../Materials/Background/backgroundMaterial.js";

import { CreatePlane } from "../Meshes/Builders/planeBuilder.js";
import { CreateBox } from "../Meshes/Builders/boxBuilder.js";
import { Plane } from "../Maths/math.plane.js";
/**
 * The Environment helper class can be used to add a fully featured none expensive background to your scene.
 * It includes by default a skybox and a ground relying on the BackgroundMaterial.
 * It also helps with the default setup of your imageProcessing configuration.
 */
var EnvironmentHelper = /** @class */ (function () {
    /**
     * constructor
     * @param options Defines the options we want to customize the helper
     * @param scene The scene to add the material to
     */
    function EnvironmentHelper(options, scene) {
        var _this = this;
        this._errorHandler = function (message, exception) {
            _this.onErrorObservable.notifyObservers({ message: message, exception: exception });
        };
        this._options = __assign(__assign({}, EnvironmentHelper._GetDefaultOptions()), options);
        this._scene = scene;
        this.onErrorObservable = new Observable();
        this._setupBackground();
        this._setupImageProcessing();
    }
    /**
     * Creates the default options for the helper.
     */
    EnvironmentHelper._GetDefaultOptions = function () {
        return {
            createGround: true,
            groundSize: 15,
            groundTexture: this._GroundTextureCDNUrl,
            groundColor: new Color3(0.2, 0.2, 0.3).toLinearSpace().scale(3),
            groundOpacity: 0.9,
            enableGroundShadow: true,
            groundShadowLevel: 0.5,
            enableGroundMirror: false,
            groundMirrorSizeRatio: 0.3,
            groundMirrorBlurKernel: 64,
            groundMirrorAmount: 1,
            groundMirrorFresnelWeight: 1,
            groundMirrorFallOffDistance: 0,
            groundMirrorTextureType: 0,
            groundYBias: 0.00001,
            createSkybox: true,
            skyboxSize: 20,
            skyboxTexture: this._SkyboxTextureCDNUrl,
            skyboxColor: new Color3(0.2, 0.2, 0.3).toLinearSpace().scale(3),
            backgroundYRotation: 0,
            sizeAuto: true,
            rootPosition: Vector3.Zero(),
            setupImageProcessing: true,
            environmentTexture: this._EnvironmentTextureCDNUrl,
            cameraExposure: 0.8,
            cameraContrast: 1.2,
            toneMappingEnabled: true,
        };
    };
    Object.defineProperty(EnvironmentHelper.prototype, "rootMesh", {
        /**
         * Gets the root mesh created by the helper.
         */
        get: function () {
            return this._rootMesh;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EnvironmentHelper.prototype, "skybox", {
        /**
         * Gets the skybox created by the helper.
         */
        get: function () {
            return this._skybox;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EnvironmentHelper.prototype, "skyboxTexture", {
        /**
         * Gets the skybox texture created by the helper.
         */
        get: function () {
            return this._skyboxTexture;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EnvironmentHelper.prototype, "skyboxMaterial", {
        /**
         * Gets the skybox material created by the helper.
         */
        get: function () {
            return this._skyboxMaterial;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EnvironmentHelper.prototype, "ground", {
        /**
         * Gets the ground mesh created by the helper.
         */
        get: function () {
            return this._ground;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EnvironmentHelper.prototype, "groundTexture", {
        /**
         * Gets the ground texture created by the helper.
         */
        get: function () {
            return this._groundTexture;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EnvironmentHelper.prototype, "groundMirror", {
        /**
         * Gets the ground mirror created by the helper.
         */
        get: function () {
            return this._groundMirror;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EnvironmentHelper.prototype, "groundMirrorRenderList", {
        /**
         * Gets the ground mirror render list to helps pushing the meshes
         * you wish in the ground reflection.
         */
        get: function () {
            if (this._groundMirror) {
                return this._groundMirror.renderList;
            }
            return null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EnvironmentHelper.prototype, "groundMaterial", {
        /**
         * Gets the ground material created by the helper.
         */
        get: function () {
            return this._groundMaterial;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Updates the background according to the new options
     * @param options
     */
    EnvironmentHelper.prototype.updateOptions = function (options) {
        var newOptions = __assign(__assign({}, this._options), options);
        if (this._ground && !newOptions.createGround) {
            this._ground.dispose();
            this._ground = null;
        }
        if (this._groundMaterial && !newOptions.createGround) {
            this._groundMaterial.dispose();
            this._groundMaterial = null;
        }
        if (this._groundTexture) {
            if (this._options.groundTexture != newOptions.groundTexture) {
                this._groundTexture.dispose();
                this._groundTexture = null;
            }
        }
        if (this._skybox && !newOptions.createSkybox) {
            this._skybox.dispose();
            this._skybox = null;
        }
        if (this._skyboxMaterial && !newOptions.createSkybox) {
            this._skyboxMaterial.dispose();
            this._skyboxMaterial = null;
        }
        if (this._skyboxTexture) {
            if (this._options.skyboxTexture != newOptions.skyboxTexture) {
                this._skyboxTexture.dispose();
                this._skyboxTexture = null;
            }
        }
        if (this._groundMirror && !newOptions.enableGroundMirror) {
            this._groundMirror.dispose();
            this._groundMirror = null;
        }
        if (this._scene.environmentTexture) {
            if (this._options.environmentTexture != newOptions.environmentTexture) {
                this._scene.environmentTexture.dispose();
            }
        }
        this._options = newOptions;
        this._setupBackground();
        this._setupImageProcessing();
    };
    /**
     * Sets the primary color of all the available elements.
     * @param color the main color to affect to the ground and the background
     */
    EnvironmentHelper.prototype.setMainColor = function (color) {
        if (this.groundMaterial) {
            this.groundMaterial.primaryColor = color;
        }
        if (this.skyboxMaterial) {
            this.skyboxMaterial.primaryColor = color;
        }
        if (this.groundMirror) {
            this.groundMirror.clearColor = new Color4(color.r, color.g, color.b, 1.0);
        }
    };
    /**
     * Setup the image processing according to the specified options.
     */
    EnvironmentHelper.prototype._setupImageProcessing = function () {
        if (this._options.setupImageProcessing) {
            this._scene.imageProcessingConfiguration.contrast = this._options.cameraContrast;
            this._scene.imageProcessingConfiguration.exposure = this._options.cameraExposure;
            this._scene.imageProcessingConfiguration.toneMappingEnabled = this._options.toneMappingEnabled;
            this._setupEnvironmentTexture();
        }
    };
    /**
     * Setup the environment texture according to the specified options.
     */
    EnvironmentHelper.prototype._setupEnvironmentTexture = function () {
        if (this._scene.environmentTexture) {
            return;
        }
        if (this._options.environmentTexture instanceof BaseTexture) {
            this._scene.environmentTexture = this._options.environmentTexture;
            return;
        }
        var environmentTexture = CubeTexture.CreateFromPrefilteredData(this._options.environmentTexture, this._scene);
        this._scene.environmentTexture = environmentTexture;
    };
    /**
     * Setup the background according to the specified options.
     */
    EnvironmentHelper.prototype._setupBackground = function () {
        if (!this._rootMesh) {
            this._rootMesh = new Mesh("BackgroundHelper", this._scene);
        }
        this._rootMesh.rotation.y = this._options.backgroundYRotation;
        var sceneSize = this._getSceneSize();
        if (this._options.createGround) {
            this._setupGround(sceneSize);
            this._setupGroundMaterial();
            this._setupGroundDiffuseTexture();
            if (this._options.enableGroundMirror) {
                this._setupGroundMirrorTexture(sceneSize);
            }
            this._setupMirrorInGroundMaterial();
        }
        if (this._options.createSkybox) {
            this._setupSkybox(sceneSize);
            this._setupSkyboxMaterial();
            this._setupSkyboxReflectionTexture();
        }
        this._rootMesh.position.x = sceneSize.rootPosition.x;
        this._rootMesh.position.z = sceneSize.rootPosition.z;
        this._rootMesh.position.y = sceneSize.rootPosition.y;
    };
    /**
     * Get the scene sizes according to the setup.
     */
    EnvironmentHelper.prototype._getSceneSize = function () {
        var _this = this;
        var groundSize = this._options.groundSize;
        var skyboxSize = this._options.skyboxSize;
        var rootPosition = this._options.rootPosition;
        if (!this._scene.meshes || this._scene.meshes.length === 1) {
            // 1 only means the root of the helper.
            return { groundSize: groundSize, skyboxSize: skyboxSize, rootPosition: rootPosition };
        }
        var sceneExtends = this._scene.getWorldExtends(function (mesh) {
            return mesh !== _this._ground && mesh !== _this._rootMesh && mesh !== _this._skybox;
        });
        var sceneDiagonal = sceneExtends.max.subtract(sceneExtends.min);
        if (this._options.sizeAuto) {
            if (this._scene.activeCamera instanceof ArcRotateCamera && this._scene.activeCamera.upperRadiusLimit) {
                groundSize = this._scene.activeCamera.upperRadiusLimit * 2;
                skyboxSize = groundSize;
            }
            var sceneDiagonalLenght = sceneDiagonal.length();
            if (sceneDiagonalLenght > groundSize) {
                groundSize = sceneDiagonalLenght * 2;
                skyboxSize = groundSize;
            }
            // 10 % bigger.
            groundSize *= 1.1;
            skyboxSize *= 1.5;
            rootPosition = sceneExtends.min.add(sceneDiagonal.scale(0.5));
            rootPosition.y = sceneExtends.min.y - this._options.groundYBias;
        }
        return { groundSize: groundSize, skyboxSize: skyboxSize, rootPosition: rootPosition };
    };
    /**
     * Setup the ground according to the specified options.
     * @param sceneSize
     */
    EnvironmentHelper.prototype._setupGround = function (sceneSize) {
        var _this = this;
        if (!this._ground || this._ground.isDisposed()) {
            this._ground = CreatePlane("BackgroundPlane", { size: sceneSize.groundSize }, this._scene);
            this._ground.rotation.x = Math.PI / 2; // Face up by default.
            this._ground.parent = this._rootMesh;
            this._ground.onDisposeObservable.add(function () {
                _this._ground = null;
            });
        }
        this._ground.receiveShadows = this._options.enableGroundShadow;
    };
    /**
     * Setup the ground material according to the specified options.
     */
    EnvironmentHelper.prototype._setupGroundMaterial = function () {
        if (!this._groundMaterial) {
            this._groundMaterial = new BackgroundMaterial("BackgroundPlaneMaterial", this._scene);
        }
        this._groundMaterial.alpha = this._options.groundOpacity;
        this._groundMaterial.alphaMode = 8;
        this._groundMaterial.shadowLevel = this._options.groundShadowLevel;
        this._groundMaterial.primaryColor = this._options.groundColor;
        this._groundMaterial.useRGBColor = false;
        this._groundMaterial.enableNoise = true;
        if (this._ground) {
            this._ground.material = this._groundMaterial;
        }
    };
    /**
     * Setup the ground diffuse texture according to the specified options.
     */
    EnvironmentHelper.prototype._setupGroundDiffuseTexture = function () {
        if (!this._groundMaterial) {
            return;
        }
        if (this._groundTexture) {
            return;
        }
        if (this._options.groundTexture instanceof BaseTexture) {
            this._groundMaterial.diffuseTexture = this._options.groundTexture;
            return;
        }
        this._groundTexture = new Texture(this._options.groundTexture, this._scene, undefined, undefined, undefined, undefined, this._errorHandler);
        this._groundTexture.gammaSpace = false;
        this._groundTexture.hasAlpha = true;
        this._groundMaterial.diffuseTexture = this._groundTexture;
    };
    /**
     * Setup the ground mirror texture according to the specified options.
     * @param sceneSize
     */
    EnvironmentHelper.prototype._setupGroundMirrorTexture = function (sceneSize) {
        var wrapping = Texture.CLAMP_ADDRESSMODE;
        if (!this._groundMirror) {
            this._groundMirror = new MirrorTexture("BackgroundPlaneMirrorTexture", { ratio: this._options.groundMirrorSizeRatio }, this._scene, false, this._options.groundMirrorTextureType, Texture.BILINEAR_SAMPLINGMODE, true);
            this._groundMirror.mirrorPlane = new Plane(0, -1, 0, sceneSize.rootPosition.y);
            this._groundMirror.anisotropicFilteringLevel = 1;
            this._groundMirror.wrapU = wrapping;
            this._groundMirror.wrapV = wrapping;
            if (this._groundMirror.renderList) {
                for (var i = 0; i < this._scene.meshes.length; i++) {
                    var mesh = this._scene.meshes[i];
                    if (mesh !== this._ground && mesh !== this._skybox && mesh !== this._rootMesh) {
                        this._groundMirror.renderList.push(mesh);
                    }
                }
            }
        }
        var gammaGround = this._options.groundColor.toGammaSpace();
        this._groundMirror.clearColor = new Color4(gammaGround.r, gammaGround.g, gammaGround.b, 1);
        this._groundMirror.adaptiveBlurKernel = this._options.groundMirrorBlurKernel;
    };
    /**
     * Setup the ground to receive the mirror texture.
     */
    EnvironmentHelper.prototype._setupMirrorInGroundMaterial = function () {
        if (this._groundMaterial) {
            this._groundMaterial.reflectionTexture = this._groundMirror;
            this._groundMaterial.reflectionFresnel = true;
            this._groundMaterial.reflectionAmount = this._options.groundMirrorAmount;
            this._groundMaterial.reflectionStandardFresnelWeight = this._options.groundMirrorFresnelWeight;
            this._groundMaterial.reflectionFalloffDistance = this._options.groundMirrorFallOffDistance;
        }
    };
    /**
     * Setup the skybox according to the specified options.
     * @param sceneSize
     */
    EnvironmentHelper.prototype._setupSkybox = function (sceneSize) {
        var _this = this;
        if (!this._skybox || this._skybox.isDisposed()) {
            this._skybox = CreateBox("BackgroundSkybox", { size: sceneSize.skyboxSize, sideOrientation: Mesh.BACKSIDE }, this._scene);
            this._skybox.onDisposeObservable.add(function () {
                _this._skybox = null;
            });
        }
        this._skybox.parent = this._rootMesh;
    };
    /**
     * Setup the skybox material according to the specified options.
     */
    EnvironmentHelper.prototype._setupSkyboxMaterial = function () {
        if (!this._skybox) {
            return;
        }
        if (!this._skyboxMaterial) {
            this._skyboxMaterial = new BackgroundMaterial("BackgroundSkyboxMaterial", this._scene);
        }
        this._skyboxMaterial.useRGBColor = false;
        this._skyboxMaterial.primaryColor = this._options.skyboxColor;
        this._skyboxMaterial.enableNoise = true;
        this._skybox.material = this._skyboxMaterial;
    };
    /**
     * Setup the skybox reflection texture according to the specified options.
     */
    EnvironmentHelper.prototype._setupSkyboxReflectionTexture = function () {
        if (!this._skyboxMaterial) {
            return;
        }
        if (this._skyboxTexture) {
            return;
        }
        if (this._options.skyboxTexture instanceof BaseTexture) {
            this._skyboxMaterial.reflectionTexture = this._options.skyboxTexture;
            return;
        }
        this._skyboxTexture = new CubeTexture(this._options.skyboxTexture, this._scene, undefined, undefined, undefined, undefined, this._errorHandler);
        this._skyboxTexture.coordinatesMode = Texture.SKYBOX_MODE;
        this._skyboxTexture.gammaSpace = false;
        this._skyboxMaterial.reflectionTexture = this._skyboxTexture;
    };
    /**
     * Dispose all the elements created by the Helper.
     */
    EnvironmentHelper.prototype.dispose = function () {
        if (this._groundMaterial) {
            this._groundMaterial.dispose(true, true);
        }
        if (this._skyboxMaterial) {
            this._skyboxMaterial.dispose(true, true);
        }
        this._rootMesh.dispose(false);
    };
    /**
     * Default ground texture URL.
     */
    EnvironmentHelper._GroundTextureCDNUrl = "https://assets.babylonjs.com/environments/backgroundGround.png";
    /**
     * Default skybox texture URL.
     */
    EnvironmentHelper._SkyboxTextureCDNUrl = "https://assets.babylonjs.com/environments/backgroundSkybox.dds";
    /**
     * Default environment texture URL.
     */
    EnvironmentHelper._EnvironmentTextureCDNUrl = "https://assets.babylonjs.com/environments/environmentSpecular.env";
    return EnvironmentHelper;
}());
export { EnvironmentHelper };
//# sourceMappingURL=environmentHelper.js.map