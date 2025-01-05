export interface CharacterResource {
  id: string;
  name: string;
  skeleton: string;
  atlas: string;
  texture: string;
}

export interface CharacterItem {
  id: number;
  character: CharacterResource;
}

export const RESOURCE_PATH = "http://localhost:8000/assets/models/";

export const CHARACTER_RESOURCES = [
  {
    name: "佩佩",
    skeleton: "4058_pepe/build_char_4058_pepe.skel",
    atlas: "4058_pepe/build_char_4058_pepe.atlas",
    texture: "4058_pepe/build_char_4058_pepe.png",
  },
  {
    name: "荒芜拉普兰德",
    skeleton: "1038_whitw2/build_char_1038_whitw2.skel",
    atlas: "1038_whitw2/build_char_1038_whitw2.atlas",
    texture: "1038_whitw2/build_char_1038_whitw2.png",
  }
];
