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
import { Trash2, Plus, SquareArrowUpRightIcon, RefreshCcw } from 'lucide-react'
import { CharacterModel, CharacterItem, CHARACTER_MODELS } from '@/lib/common'
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
import { cn } from "../lib/utils"
import { fetchModelsData, Source } from '../lib/resource'

export default function Settings() {
  const [characters, setCharacters] = useState<CharacterItem[]>([])
  const [availableModels, setAvailableModels] = useState<CharacterModel[]>(CHARACTER_MODELS);
  const [lastUpdated, setLastUpdated] = useState<number>(0)

  async function setCharactersAndPersist(characters: CharacterItem[]) {
    setCharacters(characters);
    await chrome.storage.local.set<{characters: CharacterItem[]}>({ characters });
  }

  const onAddCharacter = async () => {
    let id = Date.now(); // Use timestamp (ms) as identifier
    await setCharactersAndPersist([...characters, {id, model: CHARACTER_MODELS[0]}]);
  }

  const onUpdateCharacter = async (id: number, model: CharacterModel) => {
    await setCharactersAndPersist(characters.map((item) => item.id === id ? {id, model} : item));
  }
  
  const onDeleteCharacter = async (id: number) => {
    await setCharactersAndPersist(characters.filter((item) => item.id !== id));
  }

  const onResetAll = async () => {
    await chrome.storage.local.clear();
    await loadFromStorage();
  }

  // Load characters from storage when opening
  // It will also initialize the storage if it's empty
  async function loadFromStorage() {
    const stored = await chrome.storage.local.get<{
      characters: CharacterItem[],
      models: CharacterModel[],
      modelsLastUpdated: number,
    }>();
    let characters = stored.characters;
    if (!characters) {
      characters = [{id: Date.now(), model: CHARACTER_MODELS[0]}];
      await chrome.storage.local.set<{characters: CharacterItem[]}>({ characters });
    }
    setCharacters(characters);

    let models = stored.models;
    let modelsLastUpdated = stored.modelsLastUpdated;
    if (!models) {
      models = await fetchModelsData(Source.GitHub);
      modelsLastUpdated = Date.now();
      console.log(`${models.length} models downloaded`);
      await chrome.storage.local.set({ models, modelsLastUpdated });
    }
    setAvailableModels(CHARACTER_MODELS.concat(models));
    setLastUpdated(modelsLastUpdated);
  }

  useEffect(() => {
     loadFromStorage();
  }, [])

  const onUpdateResources = async () => {
    const models = await fetchModelsData(Source.GitHub);
    const modelsLastUpdated = Date.now();
    console.log(`${models.length} models downloaded`);
    await chrome.storage.local.set({ models, modelsLastUpdated });
    setAvailableModels(CHARACTER_MODELS.concat(models));
    setLastUpdated(modelsLastUpdated);
  }

  return (
    <div className="w-[300px] h-[500px] p-4 flex flex-col">
      <div className="space-y-6">
        {/* Characters Section */}
        <section>
          <h2 className="text-lg font-semibold mb-3">角色模型</h2>
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
                      <CommandInput placeholder="查找模型..." />
                      <CommandList>
                        <CommandEmpty>未找到角色模型</CommandEmpty>
                        <CommandGroup>
                          {availableModels.map((model) => (
                            <CommandItem
                              key={model.id}
                              value={model.id + " " + model.name}
                              onSelect={() => onUpdateCharacter(item.id, model)}
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
                <Button variant="outline" size="icon" onClick={() => onDeleteCharacter(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button onClick={onAddCharacter} className="w-full mt-2">
              <Plus className="h-4 w-4 mr-2" /> Add Character
            </Button>
          </div>
        </section>

        {/* <div className="space-y-2">
          <h2 className="text-lg font-semibold">Behavior</h2>
          <div className="flex items-center space-x-2">
            <Switch
              id="allow-interaction"
              checked={allowInteraction}
              onCheckedChange={setAllowInteraction}
            />
            <Label htmlFor="allow-interaction">Allow interaction</Label>
          </div>
        </div> */}

        {/* System Section */}
        <section>
          <h2 className="text-lg font-semibold mb-3">系统</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                资源更新于:<br/> {new Date(lastUpdated).toLocaleString()}
              </p>
              <Button variant="outline" size="sm" onClick={onUpdateResources} aria-label="更新">
                <RefreshCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Button 
        variant="destructive" 
        className="mt-4 w-full" 
        onClick={onResetAll}
      >
        初始化设置
      </Button>
      
      <a 
        href="https://github.com/fuyufjh/ArkPets-Chrome" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center justify-center mt-4 text-sm text-gray-600 hover:text-gray-800"
      >
        项目主页
        <SquareArrowUpRightIcon className="ml-1 w-4 h-4" />
      </a>
    </div>
  )
}

