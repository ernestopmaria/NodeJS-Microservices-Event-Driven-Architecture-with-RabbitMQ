import {DataSource} from 'typeorm'
import { Product } from '../entities/Product'

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "docker123",
    database: "products",
    synchronize: true,
   // logging: true,
    entities: [Product],
    subscribers: [],
    migrations: [],
})