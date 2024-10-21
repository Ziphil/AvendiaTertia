//

import {ZenmlParser} from "@zenml/zenml";
import {AvendiaConfigs, AvendiaOutputLanguage} from "../configs";
import {AvendiaTransformer} from "../transformer";
import executeReference from "./reference";


export default {
  reference: executeReference
} as Record<string, AvendiaService>;

export type AvendiaServiceArgs = {
  parser: ZenmlParser,
  transformer: AvendiaTransformer,
  configs: AvendiaConfigs
};
export type AvendiaService = (outputLanguage: AvendiaOutputLanguage, args: AvendiaServiceArgs) => Promise<void>;