import { useEffect, useState } from 'react'
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Trash2, Plus, SquareArrowUpRightIcon, RefreshCcw } from 'lucide-react'
import { CharacterModel, CharacterItem, getEmbeddedModels, WebsiteFilterType } from '@/lib/common'
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
import { cn, compareSemver } from "../lib/utils"
import { fetchModelsData, Source } from '../lib/resource'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'

export default function Settings() {
  // During loading config from storage, don't render the UI
  const [loading, setLoading] = useState<boolean>(true);

  const [characters, setCharacters] = useState<CharacterItem[]>([])
  const [availableModels, setAvailableModels] = useState<CharacterModel[]>(getEmbeddedModels());
  const [lastUpdated, setLastUpdated] = useState<number>(0)
  const [allowInteraction, setAllowInteraction] = useState<boolean>(true)

  const [websiteFilter, setWebsiteFilter] = useState<WebsiteFilterType>('all')
  const [domainList, setDomainList] = useState<string>('')

  async function setCharactersAndPersist(characters: CharacterItem[]) {
    setCharacters(characters);
    await chrome.storage.local.set<{characters: CharacterItem[]}>({ characters });
  }

  async function setAllowInteractionAndPersist(allowInteraction: boolean) {
    setAllowInteraction(allowInteraction);
    await chrome.storage.local.set<{allowInteraction: boolean}>({ allowInteraction });
  }

  async function setWebsiteFilterAndPersist(websiteFilter: WebsiteFilterType) {
    setWebsiteFilter(websiteFilter);
    await chrome.storage.local.set<{websiteFilter: WebsiteFilterType}>({ websiteFilter });
  }

  async function setDomainListAndPersist(domainList: string) {
    setDomainList(domainList);
    await chrome.storage.local.set<{domainList: string}>({ domainList });
  }

  const onAddCharacter = async () => {
    const id = Date.now(); // Use timestamp (ms) as identifier
    await setCharactersAndPersist([...characters, {id, model: availableModels[0]}]);
  }

  const onUpdateCharacter = async (id: number, model: CharacterModel) => {
    await setCharactersAndPersist(characters.map((item) => item.id === id ? {id, model} : item));
  }
  
  const onDeleteCharacter = async (id: number) => {
    await setCharactersAndPersist(characters.filter((item) => item.id !== id));
  }

  const onResetAll = async () => {
    await chrome.storage.local.clear();
    setLoading(true);
    await loadFromStorage();
    setLoading(false);
  }

  // Load characters from storage when opening
  // It will also initialize the storage if it's empty
  async function loadFromStorage() {
    const stored = await chrome.storage.local.get<{
      characters: CharacterItem[],
      models: CharacterModel[],
      modelsLastUpdated: number,
      modelsVersion: string,
      allowInteraction: boolean,
      websiteFilter: WebsiteFilterType,
      domainList: string
    }>();
    let characters = stored.characters;
    if (!characters) {
      characters = [{id: Date.now(), model: getEmbeddedModels()[0]}];
      await chrome.storage.local.set<{characters: CharacterItem[]}>({ characters });
    }
    setCharacters(characters);

    let models = stored.models;
    let modelsLastUpdated = stored.modelsLastUpdated;
    let modelsVersion = stored.modelsVersion;
    // If the models have not been downloaded, download them
    // If the models were downloaded but the version is older than the current version, update them
    const currentVersion = chrome.runtime.getManifest().version;
    if (!models || compareSemver(currentVersion, modelsVersion)) {
      models = await fetchModelsData(Source.GitHub);
      modelsLastUpdated = Date.now();
      modelsVersion = currentVersion;
      console.log(`${models.length} models downloaded`);
      await chrome.storage.local.set({ models, modelsLastUpdated, modelsVersion });
    }
    setAvailableModels(getEmbeddedModels().concat(models));
    setLastUpdated(modelsLastUpdated);

    let allowInteraction = stored.allowInteraction;
    if (allowInteraction === undefined) {
      allowInteraction = true;
      await chrome.storage.local.set({ allowInteraction });
    }
    setAllowInteraction(allowInteraction);

    let websiteFilter = stored.websiteFilter;
    if (websiteFilter === undefined) {
      websiteFilter = 'all';
      await chrome.storage.local.set({ websiteFilter });
    }
    setWebsiteFilter(websiteFilter);

    let domainList = stored.domainList;
    if (domainList === undefined) {
      domainList = '';
      await chrome.storage.local.set({ domainList });
    }
    setDomainList(domainList);
  }

  useEffect(() => {
    loadFromStorage().then(() => {
      setLoading(false);
    });
  }, [])

  const onUpdateResources = async () => {
    const models = await fetchModelsData(Source.GitHub);
    const modelsLastUpdated = Date.now();
    console.log(`${models.length} models downloaded`);
    const modelsVersion = chrome.runtime.getManifest().version;
    await chrome.storage.local.set({ models, modelsLastUpdated, modelsVersion });
    setAvailableModels(getEmbeddedModels().concat(models));
    setLastUpdated(modelsLastUpdated);
  }

  if (loading) {
    // During loading config from storage, don't render the UI
    // It's supposed to be very fast that user won't notice.
    return <div className="w-[300px] h-[500px]"></div>;
  }
  return (
    <div className="w-[300px] h-[500px] p-4 flex flex-col space-y-6">
      
        <section id="section-characters">
          <h2 className="text-lg font-semibold mb-3">角色</h2>
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
                  <PopoverContent className="w-[250px] p-0 ml-4">
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
                              className="flex items-center whitespace-nowrap overflow-x-auto"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 flex-shrink-0",
                                  item.model.id === model.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <span className="truncate">{model.name}</span>
                              {model.skinName && (
                                <Badge variant="secondary" className="ml-2 flex-shrink-0">
                                  {model.skinName}
                                </Badge>
                              )}
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
              <Plus className="h-4 w-4 mr-2" /> 增加角色
            </Button>
          </div>
        </section>

        <section id="section-behavior">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold mb-3">行为</h2>
            <div className="flex items-center space-x-2">
              <Switch
                id="allow-interaction"
                checked={allowInteraction}
                onCheckedChange={setAllowInteractionAndPersist}
              />
              <Label htmlFor="allow-interaction">允许互动</Label>
            </div>
          </div>
        </section>

        <section id="section-website-filter">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">网站过滤</h2>
            <Tabs value={websiteFilter} onValueChange={(value) => setWebsiteFilterAndPersist(value as WebsiteFilterType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">不过滤</TabsTrigger>
                <TabsTrigger value="blacklist">黑名单</TabsTrigger>
                <TabsTrigger value="whitelist">白名单</TabsTrigger>
              </TabsList>

              <TabsContent value="blacklist">
                <Textarea
                  placeholder="输入黑名单域名，每行一个，支持通配符 (例如 *.example.com)"
                  value={domainList}
                  onChange={(e) => setDomainListAndPersist(e.target.value)}
                  rows={4}
                />
              </TabsContent>
              <TabsContent value="whitelist">
                <Textarea
                  placeholder="输入白名单域名，每行一个，支持通配符 (例如 *.example.com)"
                  value={domainList}
                  onChange={(e) => setDomainList(e.target.value)}
                  rows={4}
                />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section id="section-system">
          <h2 className="text-lg font-semibold mb-3">系统</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                资源更新于:<br/> {new Date(lastUpdated).toLocaleString('zh-Hans-CN')}
              </p>
              <Button variant="outline" size="sm" onClick={onUpdateResources} aria-label="更新">
                <RefreshCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>      

        <div className="mt-4">
          <Button 
            variant="destructive" 
            className="mt-4 w-full" 
            onClick={onResetAll}
          >
            初始化设置
          </Button>
          
          <div className="mt-2 mb-4">
            <a 
              href="https://github.com/fuyufjh/ArkPets-Chrome" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground"
            >
              项目主页
              <SquareArrowUpRightIcon className="ml-1 w-4 h-4" />
            </a>
          </div>
        </div>
      
    </div>
  )
}

