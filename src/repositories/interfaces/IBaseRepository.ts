export interface QueryOptions {
    orderBy?: string;
    direction?: 'ASC' | 'DESC';
    filters?: Record<string, any>; // For additional filters
    include?: string[];            // For related tables (Joins)
    fields?: string[];             // Select specific fields only
    page?: number;                 // For pagination
    limit?: number;                // For pagination
    searchQuery?: string;          // For LIKE searches
    searchFields?: string[];       // Which fields to search in
}

export interface IUserRepository {
    // Advanced Get All / Paginated
    findAll(options: QueryOptions): Promise<{ rows: any[], count: number }>;
    
    // Get One
    findById(id: string, options?: Pick<QueryOptions, 'include' | 'fields'>): Promise<any>;
    findOne(options: QueryOptions): Promise<any>;

    // Mutations
    store(data: any): Promise<any>;
    update(id: string, data: any): Promise<[number, any[]]>;
    
    // Deletion
    deleteSingle(id: string): Promise<number>;
    deleteMany(filter: Record<string, any>, deleteChildren?: boolean): Promise<number>;
}