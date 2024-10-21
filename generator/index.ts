//

import "source-map-support/register";
import AVENDIA_CONFIGS_JSON from "../config/config.json";
import {AvendiaConfigs} from "./configs";
import {AvendiaGenerator} from "./generator";


const configs = new AvendiaConfigs(AVENDIA_CONFIGS_JSON);
const generator = new AvendiaGenerator(configs);
generator.execute();