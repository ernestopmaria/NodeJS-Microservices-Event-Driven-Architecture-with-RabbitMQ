import {DataSource} from 'typeorm'
import { Product } from '../entities/Product'

export const AppDataSource = new DataSource({
     type: "mongodb",
    url: 'mongodb+srv://ernestomaria93:1993luanda@next.gfru91h.mongodb.net/products',
    useNewUrlParser: true,
    useUnifiedTopology:true,
    synchronize: true,
   // logging: true,
    entities: [Product],
    subscribers: [],
    migrations: [],
})
//41.63.179.137/32