// src/models/Common/associations.ts
import Cat from './Cat.model';
import SubCat from './SubCat.model';
import Prod from './Prod.model';

// Cat → SubCat
Cat.hasMany(SubCat, { foreignKey: 'catid', as: 'subcats', onDelete: 'CASCADE' });
SubCat.belongsTo(Cat, { foreignKey: 'catid', as: 'Cat' });

// Cat → Prod
Cat.hasMany(Prod, { foreignKey: 'catid', as: 'prods', onDelete: 'CASCADE' });
Prod.belongsTo(Cat, { foreignKey: 'catid', as: 'Cat' });

// SubCat → Prod
SubCat.hasMany(Prod, { foreignKey: 'subcatid', as: 'prods', onDelete: 'CASCADE' });
Prod.belongsTo(SubCat, { foreignKey: 'subcatid', as: 'SubCat' });

export { Cat, SubCat, Prod };
