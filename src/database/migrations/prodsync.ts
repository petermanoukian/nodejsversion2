import sequelize from '@config/db.config';
import Prod from '@models/Common/Prod.model';

async function syncProdTable() {
    try {
        console.log("--- High Command Database Utility: Prods ---");
        console.log("Checking connection to MySQL...");
        await sequelize.authenticate();
        console.log("Connection OK.");

        // force: true will DROP the table if it exists and recreate it
        await Prod.sync({ force: true });

        console.log("✅ The 'prods' table has been successfully synchronized.");

        // Final verification
        const [results] = await sequelize.query('SHOW TABLES');
        console.log('Current Database Tables:', results);

    } catch (error) {
        console.error("❌ PRODS SYNC FAILED:", error);
    } finally {
        await sequelize.close();
        console.log("Connection closed.");
    }
}

// Execute the sync
syncProdTable();
