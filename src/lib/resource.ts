import { CharacterResource } from "./common";

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
        [key: string]: CharacterModel;
    };
    arkPetsCompatibility: number[];
}

interface CharacterModel {
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

export enum Source {
    GitHub = "github",
}

function getModelsDataUrl(source: Source): string {
    switch (source) {
        case Source.GitHub:
            return `https://raw.githubusercontent.com/isHarryh/Ark-Models/refs/heads/main/models_data.json`;
    }
}

export async function fetchModelsData(source: Source): Promise<CharacterResource[]> {
    const url = getModelsDataUrl(source);
    const response = await fetch(url);
    const models = await response.json() as ModelsData;
    const operatorDirectory = models.storageDirectory["Operator"];
    return Object.entries(models.data).filter(([key, model]) => model.type === "Operator").map(([key, model]) => ({
        id: key,
        name: model.name,
        skeleton: `${operatorDirectory}/${key}/${model.assetList['.skel']}`,
        atlas: `${operatorDirectory}/${key}/${model.assetList['.atlas']}`,
        texture: `${operatorDirectory}/${key}/${model.assetList['.png']}`,
    }));
}
