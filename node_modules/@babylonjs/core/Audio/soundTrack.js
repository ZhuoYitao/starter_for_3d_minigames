import { Engine } from "../Engines/engine.js";
import { EngineStore } from "../Engines/engineStore.js";
/**
 * It could be useful to isolate your music & sounds on several tracks to better manage volume on a grouped instance of sounds.
 * It will be also used in a future release to apply effects on a specific track.
 * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music#using-sound-tracks
 */
var SoundTrack = /** @class */ (function () {
    /**
     * Creates a new sound track.
     * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music#using-sound-tracks
     * @param scene Define the scene the sound track belongs to
     * @param options
     */
    function SoundTrack(scene, options) {
        if (options === void 0) { options = {}; }
        /**
         * The unique identifier of the sound track in the scene.
         */
        this.id = -1;
        this._isInitialized = false;
        scene = scene || EngineStore.LastCreatedScene;
        if (!scene) {
            return;
        }
        this._scene = scene;
        this.soundCollection = new Array();
        this._options = options;
        if (!this._options.mainTrack && this._scene.soundTracks) {
            this._scene.soundTracks.push(this);
            this.id = this._scene.soundTracks.length - 1;
        }
    }
    SoundTrack.prototype._initializeSoundTrackAudioGraph = function () {
        var _a;
        if (((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.canUseWebAudio) && Engine.audioEngine.audioContext) {
            this._outputAudioNode = Engine.audioEngine.audioContext.createGain();
            this._outputAudioNode.connect(Engine.audioEngine.masterGain);
            if (this._options) {
                if (this._options.volume) {
                    this._outputAudioNode.gain.value = this._options.volume;
                }
            }
            this._isInitialized = true;
        }
    };
    /**
     * Release the sound track and its associated resources
     */
    SoundTrack.prototype.dispose = function () {
        if (Engine.audioEngine && Engine.audioEngine.canUseWebAudio) {
            if (this._connectedAnalyser) {
                this._connectedAnalyser.stopDebugCanvas();
            }
            while (this.soundCollection.length) {
                this.soundCollection[0].dispose();
            }
            if (this._outputAudioNode) {
                this._outputAudioNode.disconnect();
            }
            this._outputAudioNode = null;
        }
    };
    /**
     * Adds a sound to this sound track
     * @param sound define the sound to add
     * @ignoreNaming
     */
    SoundTrack.prototype.addSound = function (sound) {
        var _a;
        if (!this._isInitialized) {
            this._initializeSoundTrackAudioGraph();
        }
        if (((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.canUseWebAudio) && this._outputAudioNode) {
            sound.connectToSoundTrackAudioNode(this._outputAudioNode);
        }
        if (sound.soundTrackId) {
            if (sound.soundTrackId === -1) {
                this._scene.mainSoundTrack.removeSound(sound);
            }
            else if (this._scene.soundTracks) {
                this._scene.soundTracks[sound.soundTrackId].removeSound(sound);
            }
        }
        this.soundCollection.push(sound);
        sound.soundTrackId = this.id;
    };
    /**
     * Removes a sound to this sound track
     * @param sound define the sound to remove
     * @ignoreNaming
     */
    SoundTrack.prototype.removeSound = function (sound) {
        var index = this.soundCollection.indexOf(sound);
        if (index !== -1) {
            this.soundCollection.splice(index, 1);
        }
    };
    /**
     * Set a global volume for the full sound track.
     * @param newVolume Define the new volume of the sound track
     */
    SoundTrack.prototype.setVolume = function (newVolume) {
        var _a;
        if (((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.canUseWebAudio) && this._outputAudioNode) {
            this._outputAudioNode.gain.value = newVolume;
        }
    };
    /**
     * Switch the panning model to HRTF:
     * Renders a stereo output of higher quality than equalpower — it uses a convolution with measured impulse responses from human subjects.
     * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-a-spatial-3d-sound
     */
    SoundTrack.prototype.switchPanningModelToHRTF = function () {
        var _a;
        if ((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.canUseWebAudio) {
            for (var i = 0; i < this.soundCollection.length; i++) {
                this.soundCollection[i].switchPanningModelToHRTF();
            }
        }
    };
    /**
     * Switch the panning model to Equal Power:
     * Represents the equal-power panning algorithm, generally regarded as simple and efficient. equalpower is the default value.
     * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-a-spatial-3d-sound
     */
    SoundTrack.prototype.switchPanningModelToEqualPower = function () {
        var _a;
        if ((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.canUseWebAudio) {
            for (var i = 0; i < this.soundCollection.length; i++) {
                this.soundCollection[i].switchPanningModelToEqualPower();
            }
        }
    };
    /**
     * Connect the sound track to an audio analyser allowing some amazing
     * synchronization between the sounds/music and your visualization (VuMeter for instance).
     * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music#using-the-analyser
     * @param analyser The analyser to connect to the engine
     */
    SoundTrack.prototype.connectToAnalyser = function (analyser) {
        var _a;
        if (this._connectedAnalyser) {
            this._connectedAnalyser.stopDebugCanvas();
        }
        this._connectedAnalyser = analyser;
        if (((_a = Engine.audioEngine) === null || _a === void 0 ? void 0 : _a.canUseWebAudio) && this._outputAudioNode) {
            this._outputAudioNode.disconnect();
            this._connectedAnalyser.connectAudioNodes(this._outputAudioNode, Engine.audioEngine.masterGain);
        }
    };
    return SoundTrack;
}());
export { SoundTrack };
//# sourceMappingURL=soundTrack.js.map