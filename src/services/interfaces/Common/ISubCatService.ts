// src/services/interfaces/Common/ISubCatService.ts
import SubCat from '@models/Common/SubCat.model';


export interface ISubCatService {
    // 5-Rule & 7-Rule operations (Collections)
    fetchAllSubCats(options: any): Promise<SubCat[]>;
    fetchPaginatedSubCats(options: any): Promise<{ rows: SubCat[], count: number }>;

    // 3-Rule & 2-Rule operations (Individual Retrieval)
    findSubCatByFilter(options: any): Promise<SubCat | null>;
    findSubCatById(id: number, options?: any): Promise<SubCat | null>;

    // NEW: Retrieval by Cat ID
    fetchSubCatsByCatId(catid: number, options?: any): Promise<SubCat[]>;

    // Mutations (Business Logic Actions)
    registerSubCat(data: any): Promise<SubCat>;
    modifySubCat(id: number, data: any): Promise<SubCat | null>;
    removeSubCat(id: number): Promise<boolean>;
    bulkRemoveSubCats(ids: number[]): Promise<number>;
}
