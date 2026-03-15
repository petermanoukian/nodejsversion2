import sequelize from '../config/db.config';




export const db = {
    // This is a "Getter"
    get User() {
        // We use require() inside the getter for true lazy loading
        const UserModule = require('./SuperAdmin/User.model').default;
        
        // Check a custom property to see if we've already initialized it
        if (!(UserModule as any).isInitialized) {
            UserModule.initModel(sequelize);
            (UserModule as any).isInitialized = true;
            console.log('--- User Model Initialized Lazily ---');
        }
        
        return UserModule;
    },
    
    // Future models follow the same pattern:
    // get Profile() { ... }
};