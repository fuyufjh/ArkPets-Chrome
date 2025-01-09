import { CharacterModel } from './common'

export enum Source {
    GitHub = "github",
}

// Data structure of https://github.com/isHarryh/Ark-Models/blob/main/models_data.json
interface ModelsData {
    storageDirectory: {
        [key: string]: string;
    };
    sortTags: {
        [key: string]: string;
    };
    gameDataVersionDescription: string;
    gameDataServerRegion: string;
    data: {
        [key: string]: CharacterModelData;
    };
    arkPetsCompatibility: number[];
}

interface CharacterModelData {
    assetId: string;
    type: string;
    style: string;
    name: string;
    appellation: string;
    skinGroupId: string;
    skinGroupName: string;
    sortTags: string[];
    assetList: {
        '.atlas': string;
        '.png': string;
        '.skel': string;
    };
}

function getModelsDataUrl(source: Source): string {
    switch (source) {
        case Source.GitHub:
            return `https://raw.githubusercontent.com/isHarryh/Ark-Models/refs/heads/main/models_data.json`;
    }
}

function getModelBaseUrl(source: Source): string {
    switch (source) {
        case Source.GitHub:
            return `https://raw.githubusercontent.com/isHarryh/Ark-Models/refs/heads/main/`;
    }
}

export async function fetchModelsData(source: Source): Promise<CharacterModel[]> {
    const url = getModelsDataUrl(source);
    const response = await fetch(url);
    const models = await response.json() as ModelsData;
    const operatorDirectory = models.storageDirectory["Operator"];
    return Object.entries(models.data).filter(([_key, model]) => model.type === "Operator").map(([key, model]) => ({
        id: key,
        name: model.name,
        skeleton: `${operatorDirectory}/${key}/${model.assetList['.skel']}`,
        atlas: `${operatorDirectory}/${key}/${model.assetList['.atlas']}`,
        texture: `${operatorDirectory}/${key}/${model.assetList['.png']}`,
        resourcePath: getModelBaseUrl(source),
    } as CharacterModel));
}
