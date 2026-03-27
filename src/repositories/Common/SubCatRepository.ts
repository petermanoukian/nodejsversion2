// src/repositories/Common/SubCatRepository.ts

import SubCat from '@models/Common/SubCat.model';
import {
    ISubCatRepository,
    GetManyOptions,
    GetManyPaginatedOptions,
    GetOneByFilterOptions,
    GetByIdOptions,
} from '@repository-interfaces/Common/ISubCatRepository'; // STRICT: Only from Common interface
import { Op, WhereOptions } from 'sequelize';

export class SubCatRepository implements ISubCatRepository {

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

    

    async getMany(options: GetManyOptions): Promise<SubCat[]> {
        return await SubCat.findAll({
            where: this.buildWhere(options),
            order: options.orderBy ? [[options.orderBy, options.orderDir ?? 'ASC']] : undefined,
            include: options.related,
            attributes: options.fields,
        });
    }

    async getManyPaginated(options: GetManyPaginatedOptions): Promise<{ rows: SubCat[]; count: number }> {
        return await SubCat.findAndCountAll({
            where: this.buildWhere(options),
            order: options.orderBy ? [[options.orderBy, options.orderDir ?? 'ASC']] : undefined,
            include: options.related,
            attributes: options.fields,
            limit: options.limit,
            offset: (options.page - 1) * options.limit,
        });
    }

    async getOneByFilter(options: GetOneByFilterOptions): Promise<SubCat | null> {
        return await SubCat.findOne({
            where: options.filters,
            include: options.related,
            attributes: options.fields,
        });
    }

    async getById(id: number, options?: GetByIdOptions): Promise<SubCat | null> {
        return await SubCat.findByPk(id, {
            include: options?.related,
            attributes: options?.fields,
        });
    }

    async store(data: any): Promise<SubCat> {
        return await SubCat.create(data);
    }

    async update(id: number, data: any): Promise<[number, SubCat[]]> {
        await SubCat.update(data, { where: { id } });
        const updated = await SubCat.findByPk(id);
        return [1, updated ? [updated] : []];
    }

    async delete(id: number): Promise<number> {
        return await SubCat.destroy({ where: { id } });
    }

    async deleteMany(ids: number[]): Promise<number> {
        return await SubCat.destroy({ where: { id: ids } });
    }
}
