//

import blockManager from "./block";
import contentIndexManager from "./content-index";
import fallbackManager from "./fallback";
import headerManager from "./header";
import inlineManager from "./inline";
import navigationManager from "./navigation";
import rootManager from "./root";


let managers = [
  rootManager,
  blockManager,
  inlineManager,
  contentIndexManager,
  navigationManager,
  headerManager,
  fallbackManager
];

export default managers;