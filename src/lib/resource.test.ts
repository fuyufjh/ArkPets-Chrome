import { describe, it, expect } from 'vitest';
import { fetchModelsData, Source } from './resource';

describe('fetchModelsData', () => {
    it('should fetch and parse models data from GitHub', async () => {
        const models = await fetchModelsData(Source.GitHub);
        
        // Verify we got some data
        expect(models.length).toBeGreaterThan(0);
        
        // Verify the structure of a model
        const firstModel = models[0];
        expect(firstModel).toMatchObject({
            id: expect.any(String),
            name: expect.any(String),
            skeleton: expect.stringContaining('.skel'),
            atlas: expect.stringContaining('.atlas'),
            texture: expect.stringContaining('.png')
        });

        // Verify paths are properly constructed
        expect(firstModel.skeleton).toMatch(/models\/.*\/.*.skel/);
        expect(firstModel.atlas).toMatch(/models\/.*\/.*.atlas/);
        expect(firstModel.texture).toMatch(/models\/.*\/.*.png/);
    }, { timeout: 10000 });
}); 