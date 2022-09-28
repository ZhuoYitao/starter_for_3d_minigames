// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "shadowMapVertexNormalBias";
var shader = "#if SM_NORMALBIAS==1\n#if SM_DIRECTIONINLIGHTDATA==1\nvec3 worldLightDirSM=normalize(-lightDataSM.xyz);\n#else\nvec3 directionToLightSM=lightDataSM.xyz-worldPos.xyz;\nvec3 worldLightDirSM=normalize(directionToLightSM);\n#endif\nfloat ndlSM=dot(vNormalW,worldLightDirSM);\nfloat sinNLSM=sqrt(1.0-ndlSM*ndlSM);\nfloat normalBiasSM=biasAndScaleSM.y*sinNLSM;\nworldPos.xyz-=vNormalW*normalBiasSM;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var shadowMapVertexNormalBias = { name: name, shader: shader };
//# sourceMappingURL=shadowMapVertexNormalBias.js.map