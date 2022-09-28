// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "prePassVertexDeclaration";
var shader = "#ifdef PREPASS\n#ifdef PREPASS_DEPTH\nvarying vec3 vViewPos;\n#endif\n#ifdef PREPASS_VELOCITY\nuniform mat4 previousViewProjection;\nvarying vec4 vCurrentPosition;\nvarying vec4 vPreviousPosition;\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var prePassVertexDeclaration = { name: name, shader: shader };
//# sourceMappingURL=prePassVertexDeclaration.js.map