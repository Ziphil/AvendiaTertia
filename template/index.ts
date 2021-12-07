//

import commonManager from "./common";
import contentIndexManager from "./content-index";
import fallbackManager from "./fallback";
import headerManager from "./header";
import navigationManager from "./navigation";


let managers = [
  commonManager,
  contentIndexManager,
  navigationManager,
  headerManager,
  fallbackManager
];

export default managers;