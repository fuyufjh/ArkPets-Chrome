import type { CharacterModel as BasicCharacterModel } from 'arkpets'

export interface CharacterModel extends BasicCharacterModel {
  skinId?: string;
  skinName?: string;
}

export interface CharacterItem {
  id: number;
  model: CharacterModel;
}

export function getEmbeddedModels(): CharacterModel[] {
  const resourcePath = chrome.runtime.getURL('models/');
  return [
    {
      id: "pepe",
      name: "佩佩 (内置)",
      skeleton: "4058_pepe/build_char_4058_pepe.skel",
      atlas: "4058_pepe/build_char_4058_pepe.atlas",
      texture: "4058_pepe/build_char_4058_pepe.png",
      resourcePath,
    },
    {
      id: "lappland_the_decadenza",
      name: "荒芜拉普兰德 (内置)",
      skeleton: "1038_whitw2/build_char_1038_whitw2.skel",
      atlas: "1038_whitw2/build_char_1038_whitw2.atlas",
      texture: "1038_whitw2/build_char_1038_whitw2.png",
      resourcePath,
    }
  ];
}

export type WebsiteFilterType = 'all' | 'blacklist' | 'whitelist'
