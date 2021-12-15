//

import commonManager from "./common";
import contentIndexManager from "./content-index";
import fallbackManager from "./fallback";
import headerManager from "./header";
import mathManager from "./math";
import navigationManager from "./navigation";
import rootManager from "./root";


let managers = [
  rootManager,
  commonManager,
  mathManager,
  contentIndexManager,
  navigationManager,
  headerManager,
  fallbackManager
];

export default managers;