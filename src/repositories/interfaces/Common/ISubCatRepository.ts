// src/repositories/interfaces/Common/ISubCatRepository.ts

import SubCat from '@models/Common/SubCat.model';

export interface GetManyOptions {
    filters?: Record<string, any>;   // catid goes here, alongside name or other fields
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
    filters: Record<string, any>;    // catid is part of filters, not a separate property
    related?: string[];
    fields?: string[];
}

export interface GetByIdOptions {
    related?: string[];
    fields?: string[];
}

export interface ISubCatRepository {
    getMany(options: GetManyOptions): Promise<SubCat[]>;
    getManyPaginated(options: GetManyPaginatedOptions): Promise<{ rows: SubCat[]; count: number }>;
    getOneByFilter(options: GetOneByFilterOptions): Promise<SubCat | null>;
    getById(id: number, options?: GetByIdOptions): Promise<SubCat | null>;
    store(data: any): Promise<SubCat>;
    update(id: number, data: any): Promise<[number, SubCat[]]>;
    delete(id: number): Promise<number>;
    deleteMany(ids: number[]): Promise<number>;
}
