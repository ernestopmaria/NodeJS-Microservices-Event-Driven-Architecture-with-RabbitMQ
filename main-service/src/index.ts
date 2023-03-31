import { ObjectId } from 'mongodb';
import "reflect-metadata"
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import { AppDataSource } from './database/data-source'
import { Product } from "./entities/Product";



dotenv.config();

const app: Express = express();
app.use(cors({
    origin: '*'
}));
app.use(express.json());
const port = process.env.PORT;

// TypeORM settings
const productRepository = AppDataSource.getMongoRepository(Product)

//Routes 

app.get('/products', async (req: Request, res: Response) => {
    const product = await productRepository.find()
    res.send(product);
});

app.post('/products', async (req: Request, res: Response) => {

    const product = productRepository.create(req.body)
    const result = await productRepository.save(product)
    return res.send(result)
});

app.put('/products/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    console.log(id);

    const product = await productRepository.findOne({where:{_id:new ObjectId(id)}})

if (!product) return res.status(404).send('product Not found')
product.image = req.body.image
product.title = req.body.title

const result = await productRepository.save(product)
return res.send(result)
});

app.delete('/products/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    const product = await productRepository.findOne({ where: { _id: new ObjectId(id) } })
    if (!product) return res.status(404).send('product Not found')
    await productRepository.delete(product._id)
    return res.send('user deleted')
}); 



//Server initialization

AppDataSource.initialize().then(() => {
    app.listen(port, () => {
        console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
}).catch(err => {
    console.log(err);
})
