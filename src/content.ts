import { CharacterItem, CHARACTER_MODELS } from './lib/common'
import { Character, CharacterModel, showContextMenu } from 'arkpets'

let activeCharacters: (CharacterItem & {
  instance: Character;
})[];

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
  if (!activeCharacters) {
    activeCharacters = [];
  }
  let addedCharacters = characters.filter(character => !activeCharacters.some(c => c.id === character.id));
  let removedCharacters = activeCharacters.filter(character => !characters.some(c => c.id === character.id));
  let updatedCharacters = characters.filter(character => activeCharacters.some(c => c.id === character.id && c.model.id !== character.model.id));

  removedCharacters.forEach(character => {
    const index = activeCharacters.findIndex(c => c.id === character.id);
    if (index !== -1) {
      let instance = activeCharacters[index].instance
      instance.fadeOut().then(() => {
        instance.destroy();
      });
      activeCharacters.splice(index, 1);
      console.log(`Character ${character.id} deleted`);
    }
  })

  updatedCharacters.forEach(character => {
    const index = activeCharacters.findIndex(c => c.id === character.id);
    if (index !== -1) {
      activeCharacters[index].instance.loadCharacterModel(character.model);
      console.log(`Character ${character.id} updated`);
    }
  })

  addedCharacters.forEach(character => {
    const instance = new Character(
      `arkpets-character-${character.id}`,
      (e: MouseEvent | TouchEvent) => {
        showContextMenu(e, instance, {
          onSelectCharacter: onSelectCharacter,
          onHideCharacter: (c: Character) => onDeleteCharacter(c),
        });
      },
      character.model,
    );
    activeCharacters.push({
      id: character.id,
      model: character.model,
      instance: instance
    });
    console.log(`Character ${character.id} added`);
  })
}

function onSelectCharacter(c: Character, model: CharacterModel) {
    const id = parseInt(c.getCanvasId().replace('arkpets-character-', ''));
    chrome.storage.local.get<{characters: CharacterItem[]}>('characters', (result) => {
      let characters = result.characters;
      characters = characters.map((c: CharacterItem) => c.id === id ? {id, model} : c);
      chrome.storage.local.set({characters});
    });
}

function onDeleteCharacter(c: Character) {
  const id = parseInt(c.getCanvasId().replace('arkpets-character-', ''));
  chrome.storage.local.get<{characters: CharacterItem[]}>('characters', (result) => {
    let characters = result.characters;
    characters = characters.filter((c: CharacterItem) => c.id !== id);
    chrome.storage.local.set({characters});
  });
}

console.debug("ArkPets Chrome Content Script Loaded");