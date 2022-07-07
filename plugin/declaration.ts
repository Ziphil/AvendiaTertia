//


declare module "~/plugin/conjugations.json" {

  type Translations = {ja: string, en: string};
  type Conjugations = {
    prefix: {[K in string]: [string, Translations]},
    suffix: {[K in string]: [string, Translations]},
    fixed: {[K in string]: [string, Translations]}
  };
  type ConjugationsJson = {[K in string]: Conjugations};

  let json: ConjugationsJson;
  export default json;

}