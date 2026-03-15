import sequelize from '../../config/db.config';
import Cat from '../../models/Common/Cat.model'; 

async function syncCatTable() {
    try {
        console.log("--- High Command Database Utility: Cats ---");
        console.log("Checking connection to MySQL...");
        await sequelize.authenticate();
        console.log("Connection OK.");

        // force: true will DROP the table if it exists and recreate it
        // This ensures the strict schema we just defined is applied perfectly
        await Cat.sync({ force: true }); 
        
        console.log("✅ The 'cats' table has been successfully synchronized.");
        
        // Final verification
        const [results] = await sequelize.query('SHOW TABLES');
        console.log('Current Database Tables:', results);

    } catch (error) {
        console.error("❌ CAT SYNC FAILED:", error);
    } finally {
        await sequelize.close();
        console.log("Connection closed.");
    }
}

// Execute the sync
syncCatTable();