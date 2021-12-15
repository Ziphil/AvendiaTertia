//

import {
  TemplateManager
} from "@zenml/zenml";
import type {
  AvendiaDocument
} from "../generator/dom";
import type {
  AvendiaTransformerEnvironments,
  AvendiaTransformerVariables
} from "../generator/transformer";


let manager = new TemplateManager<AvendiaDocument, AvendiaTransformerEnvironments, AvendiaTransformerVariables>();

export default manager;