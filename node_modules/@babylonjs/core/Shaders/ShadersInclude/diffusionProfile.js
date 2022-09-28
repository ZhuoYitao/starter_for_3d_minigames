// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "diffusionProfile";
var shader = "uniform vec3 diffusionS[5];\nuniform float diffusionD[5];\nuniform float filterRadii[5];";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var diffusionProfile = { name: name, shader: shader };
//# sourceMappingURL=diffusionProfile.js.map