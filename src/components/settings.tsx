import { useEffect, useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Switch } from "./ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Trash2, Plus } from 'lucide-react'

interface CharacterResource {
  name: string;
  skeleton: string;
  atlas: string;
  texture: string;
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

const RESOURCE_PATH = "/assets/models/";

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

interface CharacterItem {
  id: number;
  character: CharacterResource;
}

export default function Settings() {
  const getAvailableCharacters = (): CharacterResource[] => CHARACTER_RESOURCES;
  
  const [characters, setCharacters] = useState<CharacterItem[]>([{id: Date.now(), character: getAvailableCharacters()[0]}])
  const [availableCharacters] = useState<CharacterResource[]>(getAvailableCharacters())
  const [speed, setSpeed] = useState<number>(1)
  const [allowDragging, setAllowDragging] = useState<boolean>(true)
  const [animationSpeed, setAnimationSpeed] = useState<string>('medium')

  const addCharacter = () => {
    let id = Date.now(); // Use timestamp (ms) as identifier
    setCharacters([...characters, {id, character: availableCharacters[0]}])
  }

  const deleteCharacter = (id: number) => {
    setCharacters(characters.filter((item) => item.id !== id))
  }

  const resetAll = () => {
    setCharacters([{id: 0, character: getAvailableCharacters()[0]}]);
    setSpeed(1);
    setAllowDragging(true);
    setAnimationSpeed('medium');
  }

  useEffect(() => {
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

    console.assert(window.activeCharacters.length === characters.length, "Active characters length mismatch");
  }, [characters])

  useEffect(() => {
    window.arkpets.createContextMenu(CHARACTER_RESOURCES, (canvasId: string, char: CharacterResource) => {
      const id = parseInt(canvasId.replace('arkpets-character-', ''));
      setCharacters((characters) => characters.map(c => c.id === id ? {id, character: char} : c));
    }, (canvasId: string) => {
      const id = parseInt(canvasId.replace('arkpets-character-', ''));
      setCharacters((characters) => characters.filter(c => c.id !== id));
    });
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar for wider screens */}
      <aside className="hidden w-64 p-6 border-r lg:block">
        <nav className="space-y-2">
          <a href="#characters" className="block py-2 text-sm font-medium hover:text-primary">Characters</a>
          <a href="#motion" className="block py-2 text-sm font-medium hover:text-primary">Motion</a>
          <a href="#system" className="block py-2 text-sm font-medium hover:text-primary">System</a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 space-y-8">
        <h1 className="text-3xl font-bold">Plugin Settings</h1>

        {/* Characters Section */}
        <section id="characters">
          <h2 className="text-2xl font-semibold mb-4">Characters</h2>
          <div className="space-y-2">
            {characters.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Select 
                  value={item.character.name} 
                  onValueChange={(selectedName) => {
                    const newCharacters = [...characters];
                    const selectedItem = newCharacters.find(c => c.id === item.id)!
                    selectedItem.character = availableCharacters.find(c => c.name === selectedName)!;
                    setCharacters(newCharacters);
                  }}
                >
                  <SelectTrigger className="flex-grow">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCharacters.map((char) => (
                      <SelectItem key={char.name} value={char.name}>
                        {char.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => deleteCharacter(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button onClick={addCharacter} className="mt-2">
              <Plus className="h-4 w-4 mr-2" /> Add Character
            </Button>
          </div>
        </section>

        {/* Motion Section */}
        <section id="motion">
          <h2 className="text-2xl font-semibold mb-4">Motion</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label htmlFor="speed" className="w-32">Speed:</label>
              <Input
                id="speed"
                type="number"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-24"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label htmlFor="allowDragging" className="w-32">Allow dragging:</label>
              <Switch
                id="allowDragging"
                checked={allowDragging}
                onCheckedChange={setAllowDragging}
              />
            </div>
            <div className="flex items-center space-x-4">
              <label htmlFor="animationSpeed" className="w-32">Animation speed:</label>
              <Select value={animationSpeed} onValueChange={setAnimationSpeed}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* System Section */}
        <section id="system">
          <h2 className="text-2xl font-semibold mb-4">System</h2>
          <Button variant="destructive" onClick={resetAll}>
            Reset All
          </Button>
        </section>
      </main>
    </div>
  )
}

