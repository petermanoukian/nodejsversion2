import Cat from '../../../models/Common/Cat.model';

export interface GetManyOptions {
    filters?: Record<string, any>;
    orderBy?: string;
    orderDir?: 'ASC' | 'DESC';
    related?: string[];
    fields?: string[];
    search?: string;
    searchFields?: string[];
    useAnd?: boolean;
}

export interface GetManyPaginatedOptions extends GetManyOptions {
    page: number;
    limit: number;
}

export interface GetOneByFilterOptions {
    filters: Record<string, any>;
    related?: string[];
    fields?: string[];
}

export interface GetByIdOptions {
    related?: string[];
    fields?: string[];
}

export interface ICatRepository {
    getMany(options: GetManyOptions): Promise<Cat[]>;
    getManyPaginated(options: GetManyPaginatedOptions): Promise<{ rows: Cat[]; count: number }>;
    getOneByFilter(options: GetOneByFilterOptions): Promise<Cat | null>;
    getById(id: number, options?: GetByIdOptions): Promise<Cat | null>;
    store(data: any): Promise<Cat>;
    update(id: number, data: any): Promise<[number, Cat[]]>;
    delete(id: number): Promise<number>;
    deleteMany(filters: Record<string, any>): Promise<number>;
}