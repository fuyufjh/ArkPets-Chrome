import { useEffect, useState } from 'react'
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Trash2, Plus, SquareArrowUpRightIcon, RefreshCcw, Loader2, ChevronDown, Check, ChevronsUpDown } from 'lucide-react'
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
import { cn, compareSemver } from "../lib/utils"
import { fetchModelsData, Source } from '../lib/resource'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

export default function Settings() {
  // During loading config from storage, don't render the UI
  const [loading, setLoading] = useState<boolean>(true);

  const [characters, setCharacters] = useState<CharacterItem[]>([])
  const [availableModels, setAvailableModels] = useState<CharacterModel[]>(getEmbeddedModels());
  const [modelsInfo, setModelsInfo] = useState<string>('N/A');

  const [allowInteraction, setAllowInteraction] = useState<boolean>(true)

  const [websiteFilter, setWebsiteFilter] = useState<WebsiteFilterType>('all')
  const [domainList, setDomainList] = useState<string>('')

  const [isModelsFetching, setIsModelsFetching] = useState<boolean>(false);

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
      characters?: CharacterItem[],
      models?: CharacterModel[],
      modelsLastUpdated?: number,
      modelsVersion?: string,
      modelsSource?: Source,
      allowInteraction?: boolean,
      websiteFilter?: WebsiteFilterType,
      domainList?: string
    }>();
    let characters = stored.characters;
    if (!characters) {
      // This is the first time the extension is loaded. Initialize with a default character.
      characters = [{id: Date.now(), model: getEmbeddedModels()[0]}];
      await chrome.storage.local.set<{characters: CharacterItem[]}>({ characters });
    }
    setCharacters(characters);

    const models = stored.models;
    const modelsLastUpdated = stored.modelsLastUpdated;
    const modelsVersion = stored.modelsVersion;
    const modelsSource = stored.modelsSource;
    // If the models have not been downloaded, download them
    // If the models were downloaded but the version is older than the current version, update them
    const currentVersion = chrome.runtime.getManifest().version;
    if (!models || !modelsVersion || compareSemver(currentVersion, modelsVersion)) {
      fetchModelsAndPersist(); // fetch models in background
    }
    setAvailableModels(getEmbeddedModels().concat(models || []));
    setModelsInfo(modelsLastUpdated ? `模型资源上次更新于 ${new Date(modelsLastUpdated).toLocaleString('zh-Hans-CN')} 来自 ${modelsSource}` : '还未下载过模型资源');

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

  // Fetch models from remote source and persist to storage
  async function fetchModelsAndPersist(specificSource?: Source) {
    setIsModelsFetching(true);
    try {
      if (specificSource) {
        // If a specific source is provided, only fetch from that source
        const [models, source] = [await fetchModelsData(specificSource), specificSource] as const;
        const modelsLastUpdated = Date.now();
        console.log(`${models.length} models downloaded from ${source}`);
        const modelsVersion = chrome.runtime.getManifest().version;
        await chrome.storage.local.set({ 
            models, 
            modelsLastUpdated, 
            modelsVersion,
            modelsSource: source
        });
        setAvailableModels(getEmbeddedModels().concat(models));
        setModelsInfo(`资源更新完成！从 ${source} 获取了 ${models.length} 个模型信息`);
      } else {
        // Original race behavior when no specific source is provided
        const controllers = [new AbortController(), new AbortController()];
        const [models, source] = await Promise.any([
            fetchModelsData(Source.GitHub, controllers[0].signal).then(m => [m, Source.GitHub] as const),
            fetchModelsData(Source.Official, controllers[1].signal).then(m => [m, Source.Official] as const)
        ]);
        controllers.forEach(c => c.abort());
        const modelsLastUpdated = Date.now();
        console.log(`${models.length} models downloaded from ${source}`);
        const modelsVersion = chrome.runtime.getManifest().version;
        await chrome.storage.local.set({ 
            models, 
            modelsLastUpdated, 
            modelsVersion,
            modelsSource: source
        });
        setAvailableModels(getEmbeddedModels().concat(models));
        setModelsInfo(`资源更新完成！从 ${source} 获取了 ${models.length} 个模型信息`);
      }
    } catch (error) {
      setModelsInfo('⚠️ 模型资源下载失败！右键打开控制台查看详细原因');
      console.error('Failed to fetch models:', error);
    } finally {
      setIsModelsFetching(false);
    }
  }

  useEffect(() => {
    loadFromStorage().then(() => {
      setLoading(false);
    });
  }, [])

  if (loading) {
    // During loading config from storage, don't render the UI
    // It's supposed to be very fast that user won't notice.
    return <div className="w-[300px] h-[500px]"></div>;
  }
  return (
    <div className="w-[300px] h-[500px] p-4">
      <div className="flex flex-col space-y-6">
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
                  placeholder="输入黑名单域名，每行一个，检测后缀匹配。例如：
example.com (匹配 example.com 和 www.example.com)"
                  value={domainList}
                  onChange={(e) => setDomainListAndPersist(e.target.value)}
                  rows={4}
                />
              </TabsContent>
              <TabsContent value="whitelist">
                <Textarea
                  placeholder="输入白名单域名，每行一个，检测后缀匹配。例如：
example.com (匹配 example.com 和 www.example.com)"
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
                {modelsInfo}
              </p>
              <div className="flex">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchModelsAndPersist()} 
                  aria-label="更新"
                  className="rounded-r-none ml-1"
                >
                  {isModelsFetching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="w-4 h-4" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-l-none w-5 px-0 ml-[-1px]"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => fetchModelsAndPersist(Source.GitHub)}>
                      从 GitHub 更新
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => fetchModelsAndPersist(Source.Official)}>
                      从官网更新
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </section>      
      </div>
      <div className="mt-2">
        <Button 
          variant="destructive" 
          className="mt-2 w-full" 
          onClick={onResetAll}
        >
          初始化设置
        </Button>
        <div className="mt-2 pb-2">
          <a 
            href="https://github.com/fuyufjh/ArkPets-Chrome/issues" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground"
          >
            问题反馈
            <SquareArrowUpRightIcon className="ml-1 w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

