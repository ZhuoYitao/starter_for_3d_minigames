// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/boundingBoxRendererFragmentDeclaration.js";
import "./ShadersInclude/boundingBoxRendererUboDeclaration.js";
var name = "boundingBoxRendererPixelShader";
var shader = "#include<__decl__boundingBoxRendererFragment>\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_FRAGMENT_MAIN_BEGIN\ngl_FragColor=color;\n#define CUSTOM_FRAGMENT_MAIN_END\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var boundingBoxRendererPixelShader = { name: name, shader: shader };
//# sourceMappingURL=boundingBoxRenderer.fragment.js.map