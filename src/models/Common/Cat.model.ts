import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/db.config';

export interface CatAttributes {
    id: number;
    name: string;
    filer: string | null; // Added: category/filter field
    img: string | null;
    img2: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

// id is auto-incremented. img, img2, and filer are optional during creation.
export interface CatCreationAttributes extends Optional<CatAttributes, 'id' | 'filer' | 'img' | 'img2'> {}

class Cat extends Model<CatAttributes, CatCreationAttributes> implements CatAttributes {
    declare id: number;
    declare name: string;
    declare filer: string | null;
    declare img: string | null;
    declare img2: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Cat.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        filer: {
            type: DataTypes.STRING,
            allowNull: true, // Optional field for category/filter
        },
        img: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        img2: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'cats',
        timestamps: true,
    }
);

export default Cat;