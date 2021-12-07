//

import {
  TemplateManager
} from "@zenml/zenml";
import type {
  AvendiaDocument
} from "../converter/dom";
import type {
  AvendiaTransformerVariables
} from "../converter/transformer";


let manager = new TemplateManager<AvendiaDocument, {}, AvendiaTransformerVariables>();

export default manager;