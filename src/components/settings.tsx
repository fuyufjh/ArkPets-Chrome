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
import { CharacterModel, CharacterItem, CHARACTER_MODELS } from '../lib/common'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from "./ui/utils"
import { fetchModelsData, loadModelsData, persistModelsData, Source } from '../lib/resource'

export default function Settings() {
  const [characters, setCharacters] = useState<CharacterItem[]>()
  const [availableCharacters, setAvailableCharacters] = useState<CharacterModel[]>(CHARACTER_MODELS);
  const [speed, setSpeed] = useState<number>(1)
  const [allowDragging, setAllowDragging] = useState<boolean>(true)
  const [animationSpeed, setAnimationSpeed] = useState<string>('medium')

  const addCharacter = () => {
    if (!characters) {
      return; // Initializing
    }
    let id = Date.now(); // Use timestamp (ms) as identifier
    setCharacters([...characters, {id, model: availableCharacters[0]}])
  }

  const deleteCharacter = (id: number) => {
    if (!characters) {
      return; // Initializing
    }
    setCharacters(characters.filter((item) => item.id !== id))
  }

  const resetAll = () => {
    chrome.storage.local.clear().then(() => {
      setCharacters([{id: Date.now(), model: CHARACTER_MODELS[0]}]);
      setSpeed(1);
      setAllowDragging(true);
      setAnimationSpeed('medium');
    });
  }

  useEffect(() => {
    // Load characters from storage
    chrome.storage.local.get(null, (result) => {
      if (result.characters) {
        setCharacters(result.characters as CharacterItem[]);
      } else {
        chrome.storage.local.set<{characters: CharacterItem[]}>({characters: [{id: Date.now(), model: CHARACTER_MODELS[0]}] });
      }
    });
  }, [])

  // Fetch available characters from remote or load from storage
  useEffect(() => {
    (async () => {
      const models = await loadModelsData();
      if (models.length === 0) {
        const models = await fetchModelsData(Source.GitHub);
        console.log(`${models.length} models downloaded`);
        await persistModelsData(models);
        setAvailableCharacters(CHARACTER_MODELS.concat(models));
      } else {
        setAvailableCharacters(CHARACTER_MODELS.concat(models));
      }
    })();
  }, [])

  useEffect(() => {
    chrome.storage.local.set<{characters: CharacterItem[]}>({characters: characters});
  }, [characters])

  return (
    <div className="flex min-h-screen bg-background">
      {/* Main content */}
      <main className="flex-1 p-6 space-y-8">
        {/* Characters Section */}
        <section id="characters">
          <h2 className="text-2xl font-semibold mb-4">Characters</h2>
          <div className="space-y-2">
            {(characters || []).map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="flex-grow justify-between"
                    >
                      {item.model.name}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search character..." />
                      <CommandList>
                        <CommandEmpty>No character found.</CommandEmpty>
                        <CommandGroup>
                          {availableCharacters.map((model) => (
                            <CommandItem
                              key={model.id}
                              value={model.id + " " + model.name}
                              onSelect={() => {
                                const newCharacters = [...characters!];
                                const selectedItem = newCharacters.find(c => c.id === item.id)!
                                selectedItem.model = model;
                                setCharacters(newCharacters);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  item.model.id === model.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {model.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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

