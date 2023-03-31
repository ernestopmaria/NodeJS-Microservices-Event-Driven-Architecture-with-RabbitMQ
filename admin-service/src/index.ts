import "reflect-metadata"
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import  cors from 'cors'
import {AppDataSource} from './database/data-source'
import { Product } from "./entities/Product";
import * as amqp from 'amqplib/callback_api'


dotenv.config();

const app: Express = express();
app.use(cors({
    origin: '*'
}));
app.use(express.json());
const port = process.env.PORT;
amqp.connect('amqps://myxxelno:rBYJWXgneq8vQQJYzNSiAyqVcQJ4lKQ5@stingray.rmq.cloudamqp.com/myxxelno', (err0, connetion) => {
    if (err0) {
        throw err0;
    }
    connetion.createChannel((err1, channel) => {
        if (err1) { 
            throw err1;
        }
        const productRepository = AppDataSource.getRepository(Product)

        //Routes 

        app.get('/products', async (req: Request, res: Response) => {
            const product = await productRepository.find()            
            res.send(product);
        });

        app.post('/products', async (req: Request, res: Response) => {
            const product = productRepository.create(req.body)
            const result = await productRepository.save(product)
            channel.sendToQueue('product_created', Buffer.from(JSON.stringify(result)))
            return res.send(result)
        });

        app.post('/products/:id/like', async (req: Request, res: Response) => {
            const id = parseInt(req.params.id)
            const product = await productRepository.findOne({ where: { id } })
            product.likes++
            await productRepository.save(product)
            return res.send(product)
        });

        app.put('/products/:id', async (req: Request, res: Response) => {
            const id = parseInt(req.params.id)
            const product = await productRepository.findOne({ where: { id } })
            if (!product) return res.status(404).send('product Not found')
            product.image = req.body.image
            product.title = req.body.title

            const result = await productRepository.save(product)
            channel.sendToQueue('product_updated', Buffer.from(JSON.stringify(result)))
            return res.send(result)
        });

        app.delete('/products/:id', async (req: Request, res: Response) => {
            const id = parseInt(req.params.id)
            const product = await productRepository.findOne({ where: { id } })
            if (!product) return res.status(404).send('product Not found')
            const result = await productRepository.delete(product.id)
            channel.sendToQueue('product_deleted', Buffer.from(JSON.stringify(req.params.id)))
            return res.send(result)
        });



        //Server initialization

        AppDataSource.initialize().then(() => {
            app.listen(port, () => {
                console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
            });
        }).catch(err => {
            console.log(err);
        })
        process.on('beforeExit', () => {
            console.log('closing');
            connetion.close()

        })


    })
})

// TypeORM settings
