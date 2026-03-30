// src/models/Common/Prod.model.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/db.config';
import Cat from './Cat.model';
import SubCat from './SubCat.model';

export interface ProdAttributes {
    id: number;
    catid: number;               // FK to Cat.id
    subcatid: number;            // FK to SubCat.id
    name: string;                // required
    img: string | null;          // optional
    img2: string | null;         // optional
    filer: string | null;        // optional
    des: string | null;          // short description
    dess: string | null;         // long description
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ProdCreationAttributes 
  extends Optional<ProdAttributes, 'id' | 'img' | 'img2' | 'filer' | 'des' | 'dess'> {}

class Prod extends Model<ProdAttributes, ProdCreationAttributes> 
  implements ProdAttributes {
    declare id: number;
    declare catid: number;
    declare subcatid: number;
    declare name: string;
    declare img: string | null;
    declare img2: string | null;
    declare filer: string | null;
    declare des: string | null;
    declare dess: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
    declare Cat?: Cat;
    declare SubCat?: SubCat;
}

Prod.init(
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
            onDelete: 'CASCADE',
        },
        subcatid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: SubCat,
                key: 'id',
            },
            onDelete: 'CASCADE',
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
        tableName: 'prods',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['catid', 'subcatid', 'name'], // composite uniqueness
            },
        ],
    }
);


export default Prod;
