//


declare module "~/template/translations.json" {

  type Translations = {ja: string, en: string};
  type TranslationsJson = {
    language: Translations,
    title: Translations,
    caption: Translations,
    page: {top: Translations} & {[K in string]?: {[L in string]?: Translations}},
    math: {proof: Translations, equation: Translations} & {[K in string]?: Translations}
  };

  let json: TranslationsJson;
  export default json;

}