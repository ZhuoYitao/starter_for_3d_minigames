// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "morphTargetsVertex";
var shader = "#ifdef MORPHTARGETS\n#ifdef MORPHTARGETS_TEXTURE \nvertexID=float(gl_VertexID)*morphTargetTextureInfo.x;\npositionUpdated+=(readVector3FromRawSampler({X},vertexID)-position)*morphTargetInfluences[{X}];\nvertexID+=1.0;\n#ifdef MORPHTARGETS_NORMAL\nnormalUpdated+=(readVector3FromRawSampler({X},vertexID) -normal)*morphTargetInfluences[{X}];\nvertexID+=1.0;\n#endif\n#ifdef MORPHTARGETS_UV\nuvUpdated+=(readVector3FromRawSampler({X},vertexID).xy-uv)*morphTargetInfluences[{X}];\nvertexID+=1.0;\n#endif\n#ifdef MORPHTARGETS_TANGENT\ntangentUpdated.xyz+=(readVector3FromRawSampler({X},vertexID) -tangent.xyz)*morphTargetInfluences[{X}];\n#endif\n#else\npositionUpdated+=(position{X}-position)*morphTargetInfluences[{X}];\n#ifdef MORPHTARGETS_NORMAL\nnormalUpdated+=(normal{X}-normal)*morphTargetInfluences[{X}];\n#endif\n#ifdef MORPHTARGETS_TANGENT\ntangentUpdated.xyz+=(tangent{X}-tangent.xyz)*morphTargetInfluences[{X}];\n#endif\n#ifdef MORPHTARGETS_UV\nuvUpdated+=(uv_{X}-uv)*morphTargetInfluences[{X}];\n#endif\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var morphTargetsVertex = { name: name, shader: shader };
//# sourceMappingURL=morphTargetsVertex.js.map