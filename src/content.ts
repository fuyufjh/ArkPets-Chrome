interface CharacterResource {
  name: string;
  skeleton: string;
  atlas: string;
  texture: string;
}

interface CharacterItem {
  id: number;
  character: CharacterResource;
}

declare global {
  interface Window {
    arkpets: {
      Character: new (
        elementId: string,
        contextMenuCallback: any,
        characterResource: CharacterResource,
        resourcePath: string
      ) => any;
      showContextMenu: any;
      createContextMenu: any;
    };
    activeCharacters: {
      id: number;
      name: string;
      instance: any;
    }[];
  }
}

const RESOURCE_PATH = "http://localhost:8000/assets/models/";
const CHARACTER_RESOURCES = [
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

export {};

chrome.storage.local.onChanged.addListener((changes) => {
  if (changes.characters) {
    setCharacters(JSON.parse(changes.characters.newValue));
  }
});

// Initial setup when content script loads
chrome.storage.local.get(null, (settings) => {
  if (settings.characters) {
    setCharacters(JSON.parse(settings.characters));
  } else {
    chrome.storage.local.set({characters: JSON.stringify([{id: Date.now(), character: CHARACTER_RESOURCES[0]}])});
  }
});

function setCharacters(characters: CharacterItem[]) {
  // Keep the active characters in another JS variables to avoid re-creating all characters
  if (!window.activeCharacters) {
    window.activeCharacters = [];
  }
  let addedCharacters = characters.filter(character => !window.activeCharacters.some(c => c.id === character.id));
  let removedCharacters = window.activeCharacters.filter(character => !characters.some(c => c.id === character.id));
  let updatedCharacters = characters.filter(character => window.activeCharacters.some(c => c.id === character.id && c.name !== character.character.name));

  removedCharacters.forEach(character => {
    const index = window.activeCharacters.findIndex(c => c.id === character.id);
    if (index !== -1) {
      let instance = window.activeCharacters[index].instance
      instance.fadeOut().then(() => {
        instance.destroy();
      });
      window.activeCharacters.splice(index, 1);
      console.log(`Character ${character.id} deleted`);
    }
  })

  updatedCharacters.forEach(character => {
    const index = window.activeCharacters.findIndex(c => c.id === character.id);
    if (index !== -1) {
      window.activeCharacters[index].name = character.character.name;
      window.activeCharacters[index].instance.loadCharacterAssets(character.character);
      console.log(`Character ${character.id} updated`);
    }
  })

  addedCharacters.forEach(character => {
    const instance = new window.arkpets.Character(
      `arkpets-character-${character.id}`,
      window.arkpets.showContextMenu,
      character.character,
      RESOURCE_PATH
    );
    window.activeCharacters.push({
      id: character.id,
      name: character.character.name,
      instance: instance
    });
    console.log(`Character ${character.id} added`);
  })
}

window.arkpets.createContextMenu(CHARACTER_RESOURCES, (canvasId: string, char: CharacterResource) => {
  const id = parseInt(canvasId.replace('arkpets-character-', ''));
  chrome.storage.local.get('characters', (result) => {
    let characters = JSON.parse(result.characters);
    characters = characters.map((c: CharacterItem) => c.id === id ? {id, character: char} : c);
    chrome.storage.local.set({characters: JSON.stringify(characters)});
  });
}, (canvasId: string) => {
  const id = parseInt(canvasId.replace('arkpets-character-', ''));
  chrome.storage.local.get('characters', (result) => {
    let characters = JSON.parse(result.characters);
    characters = characters.filter((c: CharacterItem) => c.id !== id);
    chrome.storage.local.set({characters: JSON.stringify(characters)});
  });
});

console.log("ArkPets Chrome Content Script Loaded");