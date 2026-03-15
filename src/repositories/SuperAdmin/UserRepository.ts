import User from '../../models/SuperAdmin/User.model';
import {
    IUserRepository,
    GetManyOptions,
    GetManyPaginatedOptions,
    GetOneByFilterOptions,
    GetByIdOptions,
} from '../interfaces/SuperAdmin/IUserRepository';
import { Op, WhereOptions } from 'sequelize';

export class UserRepository implements IUserRepository {

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

    async getMany(options: GetManyOptions): Promise<User[]> {
        return await User.findAll({
            where: this.buildWhere(options),
            order: options.orderBy ? [[options.orderBy, options.orderDir ?? 'ASC']] : undefined,
            include: options.related,
            attributes: options.fields,
        });
    }

    async getManyPaginated(options: GetManyPaginatedOptions): Promise<{ rows: User[]; count: number }> {
        return await User.findAndCountAll({
            where: this.buildWhere(options),
            order: options.orderBy ? [[options.orderBy, options.orderDir ?? 'ASC']] : undefined,
            include: options.related,
            attributes: options.fields,
            limit: options.limit,
            offset: (options.page - 1) * options.limit,
        });
    }

    async getOneByFilter(options: GetOneByFilterOptions): Promise<User | null> {
        return await User.findOne({
            where: options.filters,
            include: options.related,
            attributes: options.fields,
        });
    }

    async getById(id: string, options?: GetByIdOptions): Promise<User | null> {
        return await User.findByPk(id, {
            include: options?.related,
            attributes: options?.fields,
        });
    }

    async store(data: any): Promise<User> {
        return await User.create(data);
    }

    async update(id: string, data: any): Promise<[number, User[]]> {
        await User.update(data, { where: { id } });
        const updated = await User.findByPk(id);
        return [1, updated ? [updated] : []];
    }

    async delete(id: string): Promise<number> {
        return await User.destroy({ where: { id } });
    }

    async deleteMany(filters: Record<string, any>): Promise<number> {
        return await User.destroy({ where: filters });
    }
}