//

import blockDescriptionListManager from "./block/description-list";
import blockFigureContainerManager from "./block/figure-container";
import blockGlossManager from "./block/gloss";
import blockImageManager from "./block/image";
import blockMathManager from "./block/math";
import blockMediaManager from "./block/media";
import blockNormalListManager from "./block/normal-list";
import blockNormalTableManager from "./block/normal-table";
import blockParagraphManager from "./block/paragraph";
import blockProgramManager from "./block/program";
import blockSectionManager from "./block/section";
import blockSentenceListManager from "./block/sentence-list";
import blockTranslationListManager from "./block/translation-list";
import contentIndexManager from "./content-index";
import fallbackManager from "./fallback";
import headerManager from "./header";
import inlineBasicManager from "./inline/basic";
import inlineGreekManager from "./inline/greek";
import inlineLinkManager from "./inline/link";
import inlineMathManager from "./inline/math";
import navigationManager from "./navigation";
import rootManager from "./root";


let managers = [
  rootManager,
  headerManager,
  navigationManager,
  contentIndexManager,
  blockSectionManager,
  blockParagraphManager,
  blockNormalListManager,
  blockDescriptionListManager,
  blockTranslationListManager,
  blockSentenceListManager,
  blockGlossManager,
  blockFigureContainerManager,
  blockImageManager,
  blockNormalTableManager,
  blockProgramManager,
  blockMediaManager,
  blockMathManager,
  inlineBasicManager,
  inlineLinkManager,
  inlineGreekManager,
  inlineMathManager,
  fallbackManager
];

export default managers;