// src/repositories/interfaces/Common/IProdRepository.ts

import Prod from '@models/Common/Prod.model';

export interface GetManyOptions {
    filters?: Record<string, any>;   // catid or subcatid goes here, alongside name or other fields
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
    filters: Record<string, any>;    // catid/subcatid is part of filters, not a separate property
    related?: string[];
    fields?: string[];
}

export interface GetByIdOptions {
    related?: string[];
    fields?: string[];
}

export interface IProdRepository {
    getMany(options: GetManyOptions): Promise<Prod[]>;
    getManyPaginated(options: GetManyPaginatedOptions): Promise<{ rows: Prod[]; count: number }>;
    getOneByFilter(options: GetOneByFilterOptions): Promise<Prod | null>;
    getById(id: number, options?: GetByIdOptions): Promise<Prod | null>;
    store(data: any): Promise<Prod>;
    update(id: number, data: any): Promise<[number, Prod[]]>;
    delete(id: number): Promise<number>;
    deleteMany(ids: number[]): Promise<number>;
}
