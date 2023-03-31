import dotenv from 'dotenv';
import { DataSource } from 'typeorm'
import { Product } from '../entities/Product'

dotenv.config();

export const AppDataSource = new DataSource({
     type: "mongodb",
    url: process.env.MONGODB_URL,
    useNewUrlParser: true,
    useUnifiedTopology:true,
    synchronize: true,
   // logging: true,
    entities: [Product],
    subscribers: [],
    migrations: [],
})
//41.63.179.137/32