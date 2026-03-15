import sequelize from '../../config/db.config';
import User from '../../models/SuperAdmin/User.model'; 

async function syncUserTable() {
    try {
        console.log("--- High Command Database Utility ---");
        console.log("Checking connection to MySQL...");
        await sequelize.authenticate();
        console.log("Connection OK.");

        // force: true will DROP the table if it exists and recreate it
        // Use alter: true if you want to keep data but update columns
        await User.sync({ force: true }); 
        
        console.log("✅ The 'users' table has been successfully synchronized.");
        
        // Final verification
        const [results] = await sequelize.query('SHOW TABLES');
        console.log('Current Database Tables:', results);

    } catch (error) {
        console.error("❌ USER SYNC FAILED:", error);
    } finally {
        await sequelize.close();
        console.log("Connection closed.");
    }
}

// Execute the sync
syncUserTable();