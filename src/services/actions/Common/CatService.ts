import { ICatService } from '@service-interfaces/Common/ICatService';
import { CatRepository } from '@repositories/Common/CatRepository';
import Cat from '@models/Common/Cat.model';

export class CatService implements ICatService {
    private catRepository: CatRepository;

    constructor() {
        // Instantiate the Common CatRepository
        this.catRepository = new CatRepository();
    }

    // --- 5-Rule & 7-Rule operations (Many records) ---
    async fetchAllCats(options: any): Promise<Cat[]> {
        return await this.catRepository.getMany(options);
    }

    async fetchPaginatedCats(options: any): Promise<{ rows: Cat[], count: number }> {
        return await this.catRepository.getManyPaginated(options);
    }

    // --- 3-Rule & 2-Rule operations (Single records) ---
    async findCatByFilter(options: any): Promise<Cat | null> {
        return await this.catRepository.getOneByFilter(options);
    }

    async findCatById(id: number, options?: any): Promise<Cat | null> {
        return await this.catRepository.getById(id, options);
    }

    // --- Mutations (The "Actions") ---
    async registerCat(data: any): Promise<Cat> {
        // Business Rule: Ensure name is trimmed and standardized
        if (data.name) {
            data.name = data.name.trim();
        }

        // Logic for handling images (placeholder logic before Multer integration)
        if (!data.img) data.img = null;
        if (!data.img2) data.img2 = null;

        return await this.catRepository.store(data);
    }

    async modifyCat(id: number, data: any): Promise<Cat | null> {
        // Business Rule: Validate if Cat exists before update
        const existingCat = await this.catRepository.getById(id);
        if (!existingCat) {
            return null;
        }

        if (data.name) {
            data.name = data.name.trim();
        }

        const [affectedCount, updatedRows] = await this.catRepository.update(id, data);
        return updatedRows.length > 0 ? updatedRows[0] : null;
    }

    async removeCat(id: number): Promise<boolean> {
        const deletedCount = await this.catRepository.delete(id);
        return deletedCount > 0;
    }

    async bulkRemoveCats(ids: number[]): Promise<number> {
    return await this.catRepository.deleteMany(ids);
    }
}