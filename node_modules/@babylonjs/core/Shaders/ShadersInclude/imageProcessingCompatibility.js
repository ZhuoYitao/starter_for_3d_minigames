// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "imageProcessingCompatibility";
var shader = "#ifdef IMAGEPROCESSINGPOSTPROCESS\ngl_FragColor.rgb=pow(gl_FragColor.rgb,vec3(2.2));\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var imageProcessingCompatibility = { name: name, shader: shader };
//# sourceMappingURL=imageProcessingCompatibility.js.map