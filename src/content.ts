import { CharacterItem, CHARACTER_MODELS } from './lib/common'
import { Character, CharacterModel, showContextMenu } from 'arkpets'

// Keep the active characters in JS variables to avoid re-creating all characters
let activeCharacters: {
  id: number;
  instance: Character;
}[] = [];

export {};

chrome.storage.local.onChanged.addListener((changes) => {
  if (changes.characters) {
    setCharacters(changes.characters.newValue as CharacterItem[] | undefined);
  }
  if (changes.allowInteraction) {
    setAllowInteraction(changes.allowInteraction.newValue as boolean | undefined);
  }
});

// Initial setup when content script loads
chrome.storage.local.get(null, (settings) => {
  if (settings.characters) {
    setCharacters(settings.characters as CharacterItem[]);
  } else {
    chrome.storage.local.set<{characters: CharacterItem[]}>({characters: [{id: Date.now(), model: CHARACTER_MODELS[0]}] });
  }
  if (settings.allowInteraction) {
    setAllowInteraction(settings.allowInteraction as boolean);
  }
});

function setCharacters(characters: CharacterItem[] = []) {
  let addedCharacters = characters.filter(character => !activeCharacters.some(c => c.id === character.id));
  let removedCharacters = activeCharacters.filter(character => !characters.some(c => c.id === character.id));
  let updatedCharacters = characters.filter(character => activeCharacters.some(c => c.id === character.id && c.instance.getModel().id !== character.model.id));

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
      instance: instance
    });
    console.log(`Character ${character.id} added`);
  })
}

// callback for menu: select character
async function onSelectCharacter(c: Character, model: CharacterModel) {
    const id = parseInt(c.getCanvasId().replace('arkpets-character-', ''));
    const result = await chrome.storage.local.get<{characters: CharacterItem[]}>('characters');
    let characters = result.characters;
    characters = characters.map((c: CharacterItem) => c.id === id ? {id, model} : c);
    await chrome.storage.local.set({characters});
}

// callback for menu: delete character
async function onDeleteCharacter(c: Character) {
  const id = parseInt(c.getCanvasId().replace('arkpets-character-', ''));
  const result = await chrome.storage.local.get<{characters: CharacterItem[]}>('characters');
  let characters = result.characters;
  characters = characters.filter((c: CharacterItem) => c.id !== id);
  await chrome.storage.local.set({characters});
}

function setAllowInteraction(allowInteraction: boolean = true) {
  activeCharacters.forEach(character => {
    character.instance.setAllowInteract(allowInteraction);
  });
}

console.debug("ArkPets Chrome Content Script Loaded");