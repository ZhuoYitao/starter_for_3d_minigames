// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "morphTargetsVertex";
var shader = "#ifdef MORPHTARGETS\n#ifdef MORPHTARGETS_TEXTURE \nvertexID=f32(gl_VertexID)*uniforms.morphTargetTextureInfo.x;\npositionUpdated=positionUpdated+(readVector3FromRawSampler({X},vertexID)-position)*uniforms.morphTargetInfluences[{X}];\nvertexID=vertexID+1.0;\n#ifdef MORPHTARGETS_NORMAL\nnormalUpdated=normalUpdated+(readVector3FromRawSampler({X},vertexID) -normal)*uniforms.morphTargetInfluences[{X}];\nvertexID=vertexID+1.0;\n#endif\n#ifdef MORPHTARGETS_UV\nuvUpdated=uvUpdated+(readVector3FromRawSampler({X},vertexID).xy-uv)*uniforms.morphTargetInfluences[{X}];\nvertexID=vertexID+1.0;\n#endif\n#ifdef MORPHTARGETS_TANGENT\ntangentUpdated.xyz=tangentUpdated.xyz+(readVector3FromRawSampler({X},vertexID) -tangent.xyz)*uniforms.morphTargetInfluences[{X}];\n#endif\n#else\npositionUpdated=positionUpdated+(position{X}-position)*uniforms.morphTargetInfluences[{X}];\n#ifdef MORPHTARGETS_NORMAL\nnormalUpdated+=(normal{X}-normal)*uniforms.morphTargetInfluences[{X}];\n#endif\n#ifdef MORPHTARGETS_TANGENT\ntangentUpdated.xyz=tangentUpdated.xyz+(tangent{X}-tangent.xyz)*uniforms.morphTargetInfluences[{X}];\n#endif\n#ifdef MORPHTARGETS_UV\nuvUpdated=uvUpdated+(uv_{X}-uv)*uniforms.morphTargetInfluences[{X}];\n#endif\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStoreWGSL[name] = shader;
/** @hidden */
export var morphTargetsVertex = { name: name, shader: shader };
//# sourceMappingURL=morphTargetsVertex.js.map