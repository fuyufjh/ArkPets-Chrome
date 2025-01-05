import { CharacterModel, CharacterItem, CHARACTER_MODELS, RESOURCE_PATH } from './lib/common'

declare global {
  interface Window {
    arkpets: {
      Character: new (
        elementId: string,
        contextMenuCallback: any,
        characterResource: CharacterModel,
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

export {};

chrome.storage.local.onChanged.addListener((changes) => {
  if (changes.characters) {
    setCharacters(changes.characters.newValue as CharacterItem[]);
  }
});

// Initial setup when content script loads
chrome.storage.local.get(null, (settings) => {
  if (settings.characters) {
    setCharacters(settings.characters as CharacterItem[]);
  } else {
    chrome.storage.local.set<{characters: CharacterItem[]}>({characters: [{id: Date.now(), model: CHARACTER_MODELS[0]}] });
  }
});

function setCharacters(characters: CharacterItem[]) {
  // Keep the active characters in another JS variables to avoid re-creating all characters
  if (!window.activeCharacters) {
    window.activeCharacters = [];
  }
  let addedCharacters = characters.filter(character => !window.activeCharacters.some(c => c.id === character.id));
  let removedCharacters = window.activeCharacters.filter(character => !characters.some(c => c.id === character.id));
  let updatedCharacters = characters.filter(character => window.activeCharacters.some(c => c.id === character.id && c.name !== character.model.name));

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
      window.activeCharacters[index].name = character.model.name;
      window.activeCharacters[index].instance.loadCharacterAssets(character.model);
      console.log(`Character ${character.id} updated`);
    }
  })

  addedCharacters.forEach(character => {
    const instance = new window.arkpets.Character(
      `arkpets-character-${character.id}`,
      window.arkpets.showContextMenu,
      character.model,
    );
    window.activeCharacters.push({
      id: character.id,
      name: character.model.name,
      instance: instance
    });
    console.log(`Character ${character.id} added`);
  })
}

window.arkpets.createContextMenu(CHARACTER_MODELS, (canvasId: string, char: CharacterModel) => {
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

console.debug("ArkPets Chrome Content Script Loaded");