//

import blockDescriptionListManager from "./block/description-list";
import blockFigureContainerManager from "./block/figure-container";
import blockFormManager from "./block/form";
import blockGlossManager from "./block/gloss";
import blockHistoryManager from "./block/history";
import blockImageManager from "./block/image";
import blockMathManager from "./block/math";
import blockMediaManager from "./block/media";
import blockMiscManager from "./block/misc";
import blockNormalListManager from "./block/normal-list";
import blockNormalTableManager from "./block/normal-table";
import blockParagraphManager from "./block/paragraph";
import blockProgramManager from "./block/program";
import blockQuizListManager from "./block/quiz-list";
import blockReferenceTableManager from "./block/reference-table";
import blockSectionManager from "./block/section";
import blockSectionTableManager from "./block/section-table";
import blockSentenceListManager from "./block/sentence-list";
import blockTranslationListManager from "./block/translation-list";
import contentTableManager from "./content-table";
import errorManager from "./error";
import fallbackManager from "./fallback";
import headerManager from "./header";
import historyManager from "./history";
import htmlManager from "./html";
import inlineBasicManager from "./inline/basic";
import inlineCommonManager from "./inline/common";
import inlineCuneiformManager from "./inline/cuneiform";
import inlineGreekManager from "./inline/greek";
import inlineLinkManager from "./inline/link";
import inlineMathManager from "./inline/math";
import inlineMiscManager from "./inline/misc";
import inlineReferenceManager from "./inline/reference";
import nameManager from "./name";
import navigationManager from "./navigation";
import referenceManager from "./reference";
import rootManager from "./root";


export default [
  rootManager,
  headerManager,
  navigationManager,
  contentTableManager,
  errorManager,
  blockSectionManager,
  blockParagraphManager,
  blockNormalListManager,
  blockDescriptionListManager,
  blockTranslationListManager,
  blockSentenceListManager,
  blockGlossManager,
  blockQuizListManager,
  blockFigureContainerManager,
  blockImageManager,
  blockNormalTableManager,
  blockProgramManager,
  blockFormManager,
  blockSectionTableManager,
  blockReferenceTableManager,
  blockMediaManager,
  blockHistoryManager,
  blockMiscManager,
  blockMathManager,
  inlineCommonManager,
  inlineBasicManager,
  inlineLinkManager,
  inlineGreekManager,
  inlineCuneiformManager,
  inlineMiscManager,
  inlineMathManager,
  inlineReferenceManager,
  historyManager,
  referenceManager,
  nameManager,
  htmlManager,
  fallbackManager
];