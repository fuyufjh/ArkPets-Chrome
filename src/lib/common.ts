export interface CharacterModel {
  id: string;
  name: string;
  skeleton: string;
  atlas: string;
  texture: string;
  resourcePath: string;
}

export interface CharacterItem {
  id: number;
  model: CharacterModel;
}


export const RESOURCE_PATH = "http://localhost:8000/assets/models";

export const CHARACTER_MODELS: CharacterModel[] = [
  {
    id: "pepe",
    name: "佩佩",
    skeleton: "4058_pepe/build_char_4058_pepe.skel",
    atlas: "4058_pepe/build_char_4058_pepe.atlas",
    texture: "4058_pepe/build_char_4058_pepe.png",
    resourcePath: RESOURCE_PATH,
  },
  {
    id: "lappland_the_decadenza",
    name: "荒芜拉普兰德",
    skeleton: "1038_whitw2/build_char_1038_whitw2.skel",
    atlas: "1038_whitw2/build_char_1038_whitw2.atlas",
    texture: "1038_whitw2/build_char_1038_whitw2.png",
    resourcePath: RESOURCE_PATH,
  }
];
