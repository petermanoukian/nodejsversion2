import User from '../../../models/SuperAdmin/User.model';

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

export interface IUserRepository {
    getMany(options: GetManyOptions): Promise<User[]>;
    getManyPaginated(options: GetManyPaginatedOptions): Promise<{ rows: User[]; count: number }>;
    getOneByFilter(options: GetOneByFilterOptions): Promise<User | null>;
    getById(id: string, options?: GetByIdOptions): Promise<User | null>;
    store(data: any): Promise<User>;
    update(id: string, data: any): Promise<[number, User[]]>;
    delete(id: string): Promise<number>;
    deleteMany(filters: Record<string, any>): Promise<number>;
}