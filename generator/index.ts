//

import "source-map-support/register";
import AVENDIA_CONFIGS_JSON from "../config/config.json";
import {
  AvendiaConfigs
} from "./configs";
import {
  AvendiaGenerator
} from "./generator";


let configs = new AvendiaConfigs(AVENDIA_CONFIGS_JSON);
let generator = new AvendiaGenerator(configs);
generator.execute();