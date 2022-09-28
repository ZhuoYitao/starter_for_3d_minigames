// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "depthPrePass";
var shader = "#ifdef DEPTHPREPASS\ngl_FragColor=vec4(0.,0.,0.,1.0);\nreturn;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var depthPrePass = { name: name, shader: shader };
//# sourceMappingURL=depthPrePass.js.map