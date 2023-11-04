//


declare module "~/plugin/conjugations.json" {

  type Language = "ja" | "en";
  type Translations = Record<Language, Array<[string, string]>>;
  type Conjugations = {
    prefix: Record<string, [string, Translations]>,
    suffix: Record<string, [string, Translations]>,
    fixed: Record<string, [string, Translations]>
  };

  const json: Record<string, Conjugations>;
  export default json;

}