import { CharacterItem, CHARACTER_MODELS, WebsiteFilterType } from './lib/common'
import { Character, CharacterModel, showContextMenu } from 'arkpets'
import { matchDomain } from './lib/utils';

// Keep the active characters in JS variables to avoid re-creating all characters
const activeCharacters: {
  id: number;
  instance: Character;
}[] = [];

export {};

// Initial setup when content script loads
const settings = await chrome.storage.local.get<{
  characters: CharacterItem[],
  allowInteraction: boolean,
  websiteFilter: WebsiteFilterType,
  domainList: string
}>();

function checkDomainList(websiteFilter: WebsiteFilterType, domain: string, patterns: string[]) {
  switch (websiteFilter) {
    case 'blacklist':
      return !patterns.some(pattern => matchDomain(domain, pattern));
    case 'whitelist':
      return patterns.some(pattern => matchDomain(domain, pattern));
    default:
      return true;
  }
}

const domain = window.location.hostname;
if (!settings.websiteFilter || !settings.domainList
    || checkDomainList(settings.websiteFilter, domain, settings.domainList.split('\n'))
) {
  await setup();
  console.debug("ArkPets Chrome Content Script Loaded");
}

async function setup() {
  if (settings.characters) {
    setCharacters(settings.characters as CharacterItem[]);
  } else {
    await chrome.storage.local.set<{characters: CharacterItem[]}>({characters: [{id: Date.now(), model: CHARACTER_MODELS[0]}] });
  }
  if (settings.allowInteraction) {
    setAllowInteraction(settings.allowInteraction as boolean);
  }

  // Changes in setting page will trigger this
  chrome.storage.local.onChanged.addListener((changes) => {
    if (changes.characters) {
      setCharacters(changes.characters.newValue as CharacterItem[] | undefined);
    }
    if (changes.allowInteraction) {
      setAllowInteraction(changes.allowInteraction.newValue as boolean | undefined);
    }
  });
}

function setCharacters(characters: CharacterItem[] = []) {
  const addedCharacters = characters.filter(character => !activeCharacters.some(c => c.id === character.id));
  const removedCharacters = activeCharacters.filter(character => !characters.some(c => c.id === character.id));
  const updatedCharacters = characters.filter(character => activeCharacters.some(c => c.id === character.id && c.instance.getModel().id !== character.model.id));

  removedCharacters.forEach(character => {
    const index = activeCharacters.findIndex(c => c.id === character.id);
    if (index !== -1) {
      const instance = activeCharacters[index].instance
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
