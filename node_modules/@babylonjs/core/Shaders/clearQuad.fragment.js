// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "clearQuadPixelShader";
var shader = "uniform vec4 color;\nvoid main() {\ngl_FragColor=color;\n}\n";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var clearQuadPixelShader = { name: name, shader: shader };
//# sourceMappingURL=clearQuad.fragment.js.map