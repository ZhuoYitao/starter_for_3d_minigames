// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "prePassDeclaration";
var shader = "#ifdef PREPASS\n#extension GL_EXT_draw_buffers : require\nlayout(location=0) out highp vec4 glFragData[{X}];highp vec4 gl_FragColor;\n#ifdef PREPASS_DEPTH\nvarying highp vec3 vViewPos;\n#endif\n#ifdef PREPASS_VELOCITY\nvarying highp vec4 vCurrentPosition;varying highp vec4 vPreviousPosition;\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var prePassDeclaration = { name: name, shader: shader };
//# sourceMappingURL=prePassDeclaration.js.map