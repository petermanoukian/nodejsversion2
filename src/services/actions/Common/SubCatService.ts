// src/services/actions/Common/SubCatService.ts
import { ISubCatService } from '@service-interfaces/Common/ISubCatService';
import { SubCatRepository } from '@repositories/Common/SubCatRepository';
import SubCat from '@models/Common/SubCat.model';

export class SubCatService implements ISubCatService {
    private subCatRepository: SubCatRepository;

    constructor() {
        // Instantiate the Common SubCatRepository
        this.subCatRepository = new SubCatRepository();
    }

    // --- 5-Rule & 7-Rule operations (Many records) ---
    async fetchAllSubCats(options: any): Promise<SubCat[]> {
        return await this.subCatRepository.getMany(options);
    }

    async fetchPaginatedSubCats(options: any): Promise<{ rows: SubCat[], count: number }> {
        return await this.subCatRepository.getManyPaginated(options);
    }

    // --- 3-Rule & 2-Rule operations (Single records) ---
    async findSubCatByFilter(options: any): Promise<SubCat | null> {
        return await this.subCatRepository.getOneByFilter(options);
    }

    async findSubCatById(id: number, options?: any): Promise<SubCat | null> {
        return await this.subCatRepository.getById(id, options);
    }

    async fetchSubCatsByCatId(catid: number, options?: any): Promise<SubCat[]> {
        return await this.subCatRepository.getMany({
            ...options,
            filters: { ...(options?.filters || {}), catid }
        });
    }


    // --- Mutations (The "Actions") ---
    async registerSubCat(data: any): Promise<SubCat> {
        // Business Rule: Ensure name is trimmed and standardized
        if (data.name) {
            data.name = data.name.trim();
        }

        // Logic for handling images (placeholder logic before Multer integration)
        if (!data.img) data.img = null;
        if (!data.img2) data.img2 = null;

        return await this.subCatRepository.store(data);
    }

    async modifySubCat(id: number, data: any): Promise<SubCat | null> {
        // Business Rule: Validate if SubCat exists before update
        const existingSubCat = await this.subCatRepository.getById(id);
        if (!existingSubCat) {
            return null;
        }

        if (data.name) {
            data.name = data.name.trim();
        }

        const [affectedCount, updatedRows] = await this.subCatRepository.update(id, data);
        return updatedRows.length > 0 ? updatedRows[0] : null;
    }

    async removeSubCat(id: number): Promise<boolean> {
        const deletedCount = await this.subCatRepository.delete(id);
        return deletedCount > 0;
    }

    async bulkRemoveSubCats(ids: number[]): Promise<number> {
        return await this.subCatRepository.deleteMany(ids);
    }
}
