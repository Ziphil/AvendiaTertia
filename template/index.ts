//

import commonManager from "./common";
import contentIndexManager from "./content-index";
import fallbackManager from "./fallback";


let managers = [
  commonManager,
  contentIndexManager,
  fallbackManager
];

export default managers;