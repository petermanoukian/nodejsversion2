// src/models/Common/SubCat.model.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/db.config';
import Cat from './Cat.model';

export interface SubCatAttributes {
    id: number;
    catid: number;              // FK to Cat.id
    name: string;               // required
    img: string | null;         // optional
    img2: string | null;        // optional
    filer: string | null;       // optional
    des: string | null;         // short description
    dess: string | null;        // long description
    createdAt?: Date;
    updatedAt?: Date;
}

export interface SubCatCreationAttributes 
  extends Optional<SubCatAttributes, 'id' | 'img' | 'img2' | 'filer' | 'des' | 'dess'> {}

class SubCat extends Model<SubCatAttributes, SubCatCreationAttributes> 
  implements SubCatAttributes {
    declare id: number;
    declare catid: number;
    declare name: string;
    declare img: string | null;
    declare img2: string | null;
    declare filer: string | null;
    declare des: string | null;
    declare dess: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

SubCat.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        catid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Cat,
                key: 'id',
            },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        img: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        img2: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        filer: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        des: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        dess: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'subcats',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['catid', 'name'], // composite uniqueness
            },
        ],
    }
);
SubCat.belongsTo(Cat, { foreignKey: 'catid' });

export default SubCat;
