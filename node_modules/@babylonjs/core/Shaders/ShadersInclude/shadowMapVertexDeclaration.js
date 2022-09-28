// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
import "./sceneVertexDeclaration.js";
import "./meshVertexDeclaration.js";
var name = "shadowMapVertexDeclaration";
var shader = "#include<sceneVertexDeclaration>\n#include<meshVertexDeclaration>\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var shadowMapVertexDeclaration = { name: name, shader: shader };
//# sourceMappingURL=shadowMapVertexDeclaration.js.map