// src/services/interfaces/Common/IProdService.ts
import Prod from '@models/Common/Prod.model';

export interface IProdService {
    // 5-Rule & 7-Rule operations (Collections)
    fetchAllProds(options: any): Promise<Prod[]>;
    fetchPaginatedProds(options: any): Promise<{ rows: Prod[], count: number }>;

    // 3-Rule & 2-Rule operations (Individual Retrieval)
    findProdByFilter(options: any): Promise<Prod | null>;
    findProdById(id: number, options?: any): Promise<Prod | null>;

    // NEW: Retrieval by Cat ID
    fetchProdsByCatId(catid: number, options?: any): Promise<Prod[]>;

    // NEW: Retrieval by SubCat ID
    fetchProdsBySubCatId(subcatid: number, options?: any): Promise<Prod[]>;

    // Mutations (Business Logic Actions)
    registerProd(data: any): Promise<Prod>;
    modifyProd(id: number, data: any): Promise<Prod | null>;
    removeProd(id: number): Promise<boolean>;
    bulkRemoveProds(ids: number[]): Promise<number>;
}
