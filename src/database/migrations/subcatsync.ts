import sequelize from '@config/db.config';
import SubCat from '@models/Common/SubCat.model';


async function syncSubCatTable() {
    try {
        console.log("--- High Command Database Utility: SubCats ---");
        console.log("Checking connection to MySQL...");
        await sequelize.authenticate();
        console.log("Connection OK.");

        // force: true will DROP the table if it exists and recreate it
        await SubCat.sync({ force: true });

        console.log("✅ The 'subcats' table has been successfully synchronized.");

        // Final verification
        const [results] = await sequelize.query('SHOW TABLES');
        console.log('Current Database Tables:', results);

    } catch (error) {
        console.error("❌ SUBCAT SYNC FAILED:", error);
    } finally {
        await sequelize.close();
        console.log("Connection closed.");
    }
}

// Execute the sync
syncSubCatTable();
