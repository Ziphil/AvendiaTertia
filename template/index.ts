//

import commonManager from "./common";
import contentIndexManager from "./content-index";
import fallbackManager from "./fallback";
import headerManager from "./header";
import navigationManager from "./navigation";
import rootManager from "./root";


let managers = [
  rootManager,
  commonManager,
  contentIndexManager,
  navigationManager,
  headerManager,
  fallbackManager
];

export default managers;