import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/db.config';

export interface UserAttributes {
    id: string;
    name: string;
    email: string;
    password: string;
    level: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'level'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    // ❌ REMOVED: public id!: string; etc.
    // Those lines were shadowing Sequelize's getters — that was the entire bug.
    // The interface above handles TypeScript typing. That's all you need.

    declare id: string;
    declare name: string;
    declare email: string;
    declare password: string;
    declare level: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 2,
        },
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
    }
);

export default User;