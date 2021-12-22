//


declare module "~/plugin/conjugations.json" {

  type Translations = {ja: string, en: string};
  type ConjugationsJson = {
    prefix: {[K in string]: [string, Translations]},
    suffix: {[K in string]: [string, Translations]},
    fixed: {[K in string]: [string, Translations]}
  };

  let json: ConjugationsJson;
  export default json;

}