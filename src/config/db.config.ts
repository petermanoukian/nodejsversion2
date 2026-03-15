import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

// This loads the variables from your .env file
dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME as string, 
    process.env.DB_USER as string, 
    process.env.DB_PASS as string, 
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false, // Set to true if you want to see the SQL commands in the terminal
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

export default sequelize;