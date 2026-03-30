// src/services/actions/Common/ProdService.ts
import { IProdService } from '@service-interfaces/Common/IProdService';
import { ProdRepository } from '@repositories/Common/ProdRepository';
import Prod from '@models/Common/Prod.model';

export class ProdService implements IProdService {
    private prodRepository: ProdRepository;

    constructor() {
        // Instantiate the Common ProdRepository
        this.prodRepository = new ProdRepository();
    }

    // --- 5-Rule & 7-Rule operations (Many records) ---
    async fetchAllProds(options: any): Promise<Prod[]> {
        return await this.prodRepository.getMany(options);
    }

    async fetchPaginatedProds(options: any): Promise<{ rows: Prod[], count: number }> {
        return await this.prodRepository.getManyPaginated(options);
    }

    // --- 3-Rule & 2-Rule operations (Single records) ---
    async findProdByFilter(options: any): Promise<Prod | null> {
        return await this.prodRepository.getOneByFilter(options);
    }

    async findProdById(id: number, options?: any): Promise<Prod | null> {
        return await this.prodRepository.getById(id, options);
    }

    // --- Retrieval by Cat ID ---
    async fetchProdsByCatId(catid: number, options?: any): Promise<Prod[]> {
        return await this.prodRepository.getMany({
            ...options,
            filters: { ...(options?.filters || {}), catid }
        });
    }

    // --- Retrieval by SubCat ID ---
    async fetchProdsBySubCatId(subcatid: number, options?: any): Promise<Prod[]> {
        return await this.prodRepository.getMany({
            ...options,
            filters: { ...(options?.filters || {}), subcatid }
        });
    }

    // --- Mutations (The "Actions") ---
    async registerProd(data: any): Promise<Prod> {
        // Business Rule: Ensure name is trimmed and standardized
        if (data.name) {
            data.name = data.name.trim();
        }

        if (!data.img) data.img = null;
        if (!data.img2) data.img2 = null;

        return await this.prodRepository.store(data);
    }

    async modifyProd(id: number, data: any): Promise<Prod | null> {
        // Business Rule: Validate if Prod exists before update
        const existingProd = await this.prodRepository.getById(id);
        if (!existingProd) {
            return null;
        }

        if (data.name) {
            data.name = data.name.trim();
        }

        const [affectedCount, updatedRows] = await this.prodRepository.update(id, data);
        return updatedRows.length > 0 ? updatedRows[0] : null;
    }

    async removeProd(id: number): Promise<boolean> {
        const deletedCount = await this.prodRepository.delete(id);
        return deletedCount > 0;
    }

    async bulkRemoveProds(ids: number[]): Promise<number> {
        return await this.prodRepository.deleteMany(ids);
    }
}
