import Cat from '@models/Common/Cat.model';

export interface ICatService {
    // 5-Rule & 7-Rule operations (Collections)
    fetchAllCats(options: any): Promise<Cat[]>;
    fetchPaginatedCats(options: any): Promise<{ rows: Cat[], count: number }>;

    // 3-Rule & 2-Rule operations (Individual Retrieval)
    findCatByFilter(options: any): Promise<Cat | null>;
    findCatById(id: number, options?: any): Promise<Cat | null>;

    // Mutations (Business Logic Actions)
    registerCat(data: any): Promise<Cat>;
    modifyCat(id: number, data: any): Promise<Cat | null>;
    removeCat(id: number): Promise<boolean>;
    bulkRemoveCats(ids: number[]): Promise<number>;
}