/**
 * Base class of the scene acting as a container for the different elements composing a scene.
 * This class is dynamically extended by the different components of the scene increasing
 * flexibility and reducing coupling
 */
var AbstractScene = /** @class */ (function () {
    function AbstractScene() {
        /**
         * Gets the list of root nodes (ie. nodes with no parent)
         */
        this.rootNodes = new Array();
        /** All of the cameras added to this scene
         * @see https://doc.babylonjs.com/babylon101/cameras
         */
        this.cameras = new Array();
        /**
         * All of the lights added to this scene
         * @see https://doc.babylonjs.com/babylon101/lights
         */
        this.lights = new Array();
        /**
         * All of the (abstract) meshes added to this scene
         */
        this.meshes = new Array();
        /**
         * The list of skeletons added to the scene
         * @see https://doc.babylonjs.com/how_to/how_to_use_bones_and_skeletons
         */
        this.skeletons = new Array();
        /**
         * All of the particle systems added to this scene
         * @see https://doc.babylonjs.com/babylon101/particles
         */
        this.particleSystems = new Array();
        /**
         * Gets a list of Animations associated with the scene
         */
        this.animations = [];
        /**
         * All of the animation groups added to this scene
         * @see https://doc.babylonjs.com/divingDeeper/animation/groupAnimations
         */
        this.animationGroups = new Array();
        /**
         * All of the multi-materials added to this scene
         * @see https://doc.babylonjs.com/how_to/multi_materials
         */
        this.multiMaterials = new Array();
        /**
         * All of the materials added to this scene
         * In the context of a Scene, it is not supposed to be modified manually.
         * Any addition or removal should be done using the addMaterial and removeMaterial Scene methods.
         * Note also that the order of the Material within the array is not significant and might change.
         * @see https://doc.babylonjs.com/babylon101/materials
         */
        this.materials = new Array();
        /**
         * The list of morph target managers added to the scene
         * @see https://doc.babylonjs.com/how_to/how_to_dynamically_morph_a_mesh
         */
        this.morphTargetManagers = new Array();
        /**
         * The list of geometries used in the scene.
         */
        this.geometries = new Array();
        /**
         * All of the transform nodes added to this scene
         * In the context of a Scene, it is not supposed to be modified manually.
         * Any addition or removal should be done using the addTransformNode and removeTransformNode Scene methods.
         * Note also that the order of the TransformNode within the array is not significant and might change.
         * @see https://doc.babylonjs.com/how_to/transformnode
         */
        this.transformNodes = new Array();
        /**
         * ActionManagers available on the scene.
         */
        this.actionManagers = new Array();
        /**
         * Textures to keep.
         */
        this.textures = new Array();
        /** @hidden */
        this._environmentTexture = null;
        /**
         * The list of postprocesses added to the scene
         */
        this.postProcesses = new Array();
    }
    /**
     * Adds a parser in the list of available ones
     * @param name Defines the name of the parser
     * @param parser Defines the parser to add
     */
    AbstractScene.AddParser = function (name, parser) {
        this._BabylonFileParsers[name] = parser;
    };
    /**
     * Gets a general parser from the list of available ones
     * @param name Defines the name of the parser
     * @returns the requested parser or null
     */
    AbstractScene.GetParser = function (name) {
        if (this._BabylonFileParsers[name]) {
            return this._BabylonFileParsers[name];
        }
        return null;
    };
    /**
     * Adds n individual parser in the list of available ones
     * @param name Defines the name of the parser
     * @param parser Defines the parser to add
     */
    AbstractScene.AddIndividualParser = function (name, parser) {
        this._IndividualBabylonFileParsers[name] = parser;
    };
    /**
     * Gets an individual parser from the list of available ones
     * @param name Defines the name of the parser
     * @returns the requested parser or null
     */
    AbstractScene.GetIndividualParser = function (name) {
        if (this._IndividualBabylonFileParsers[name]) {
            return this._IndividualBabylonFileParsers[name];
        }
        return null;
    };
    /**
     * Parser json data and populate both a scene and its associated container object
     * @param jsonData Defines the data to parse
     * @param scene Defines the scene to parse the data for
     * @param container Defines the container attached to the parsing sequence
     * @param rootUrl Defines the root url of the data
     */
    AbstractScene.Parse = function (jsonData, scene, container, rootUrl) {
        for (var parserName in this._BabylonFileParsers) {
            if (Object.prototype.hasOwnProperty.call(this._BabylonFileParsers, parserName)) {
                this._BabylonFileParsers[parserName](jsonData, scene, container, rootUrl);
            }
        }
    };
    Object.defineProperty(AbstractScene.prototype, "environmentTexture", {
        /**
         * Texture used in all pbr material as the reflection texture.
         * As in the majority of the scene they are the same (exception for multi room and so on),
         * this is easier to reference from here than from all the materials.
         */
        get: function () {
            return this._environmentTexture;
        },
        set: function (value) {
            this._environmentTexture = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @returns all meshes, lights, cameras, transformNodes and bones
     */
    AbstractScene.prototype.getNodes = function () {
        var nodes = new Array();
        nodes = nodes.concat(this.meshes);
        nodes = nodes.concat(this.lights);
        nodes = nodes.concat(this.cameras);
        nodes = nodes.concat(this.transformNodes); // dummies
        this.skeletons.forEach(function (skeleton) { return (nodes = nodes.concat(skeleton.bones)); });
        return nodes;
    };
    /**
     * Stores the list of available parsers in the application.
     */
    AbstractScene._BabylonFileParsers = {};
    /**
     * Stores the list of available individual parsers in the application.
     */
    AbstractScene._IndividualBabylonFileParsers = {};
    return AbstractScene;
}());
export { AbstractScene };
//# sourceMappingURL=abstractScene.js.map