// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "lightVxUboDeclaration";
var shader = "#ifdef LIGHT{X}\nuniform Light{X}\n{\nvec4 vLightData;\nvec4 vLightDiffuse;\nvec4 vLightSpecular;\n#ifdef SPOTLIGHT{X}\nvec4 vLightDirection;\nvec4 vLightFalloff;\n#elif defined(POINTLIGHT{X})\nvec4 vLightFalloff;\n#elif defined(HEMILIGHT{X})\nvec3 vLightGround;\n#endif\nvec4 shadowsInfo;\nvec2 depthValues;\n} light{X};\n#ifdef SHADOW{X}\n#ifdef SHADOWCSM{X}\nuniform mat4 lightMatrix{X}[SHADOWCSMNUM_CASCADES{X}];\nvarying vec4 vPositionFromLight{X}[SHADOWCSMNUM_CASCADES{X}];\nvarying float vDepthMetric{X}[SHADOWCSMNUM_CASCADES{X}];\nvarying vec4 vPositionFromCamera{X};\n#elif defined(SHADOWCUBE{X})\n#else\nvarying vec4 vPositionFromLight{X};\nvarying float vDepthMetric{X};\nuniform mat4 lightMatrix{X};\n#endif\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var lightVxUboDeclaration = { name: name, shader: shader };
//# sourceMappingURL=lightVxUboDeclaration.js.map