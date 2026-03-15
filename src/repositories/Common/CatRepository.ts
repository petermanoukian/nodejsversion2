import Cat from '../../models/Common/Cat.model';
import {
    ICatRepository,
    GetManyOptions,
    GetManyPaginatedOptions,
    GetOneByFilterOptions,
    GetByIdOptions,
} from '../interfaces/Common/ICatRepository'; // STRICT: Only from Common interface
import { Op, WhereOptions } from 'sequelize';

export class CatRepository implements ICatRepository {

    private buildWhere(options: GetManyOptions): WhereOptions {
        const where: any = { ...(options.filters || {}) };

        if (options.search && options.searchFields && options.searchFields.length > 0) {
            const searchConditions = options.searchFields.map((field) => ({
                [field]: { [Op.like]: `%${options.search}%` },
            }));
            where[options.useAnd ? Op.and : Op.or] = searchConditions;
        }

        return where;
    }

    async getMany(options: GetManyOptions): Promise<Cat[]> {
        return await Cat.findAll({
            where: this.buildWhere(options),
            order: options.orderBy ? [[options.orderBy, options.orderDir ?? 'ASC']] : undefined,
            include: options.related,
            attributes: options.fields,
        });
    }

    async getManyPaginated(options: GetManyPaginatedOptions): Promise<{ rows: Cat[]; count: number }> {
        return await Cat.findAndCountAll({
            where: this.buildWhere(options),
            order: options.orderBy ? [[options.orderBy, options.orderDir ?? 'ASC']] : undefined,
            include: options.related,
            attributes: options.fields,
            limit: options.limit,
            offset: (options.page - 1) * options.limit,
        });
    }

    async getOneByFilter(options: GetOneByFilterOptions): Promise<Cat | null> {
        return await Cat.findOne({
            where: options.filters,
            include: options.related,
            attributes: options.fields,
        });
    }

    async getById(id: number, options?: GetByIdOptions): Promise<Cat | null> {
        return await Cat.findByPk(id, {
            include: options?.related,
            attributes: options?.fields,
        });
    }

    async store(data: any): Promise<Cat> {
        return await Cat.create(data);
    }

    async update(id: number, data: any): Promise<[number, Cat[]]> {
        await Cat.update(data, { where: { id } });
        const updated = await Cat.findByPk(id);
        return [1, updated ? [updated] : []];
    }

    async delete(id: number): Promise<number> {
        return await Cat.destroy({ where: { id } });
    }

    async deleteMany(filters: Record<string, any>): Promise<number> {
        return await Cat.destroy({ where: filters });
    }
}