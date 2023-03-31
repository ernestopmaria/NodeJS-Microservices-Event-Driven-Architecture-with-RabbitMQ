import "reflect-metadata"
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import * as amqp from 'amqplib/callback_api'
import axios from 'axios'
import { AppDataSource } from './database/data-source'
import { Product } from "./entities/Product";
import { ObjectId } from 'mongodb';


dotenv.config();
const app: Express = express();
app.use(cors({
    origin: '*'
}));
app.use(express.json());
const port = process.env.PORT;

// TypeORM settings
const productRepository = AppDataSource.getMongoRepository(Product)

amqp.connect('amqps://myxxelno:rBYJWXgneq8vQQJYzNSiAyqVcQJ4lKQ5@stingray.rmq.cloudamqp.com/myxxelno', (err0, connetion) => {
    if (err0) {
        throw err0;
    }
    connetion.createChannel((err1, channel) => {
        if (err1) {
            throw err1;
        }
        channel.assertQueue('product_created', { durable: false })
        channel.assertQueue('product_updated', { durable: false })
        channel.assertQueue('product_deleted', { durable: false })

        //Routes 
        app.get('/products', async (req: Request, res: Response) => {
            const product = await productRepository.find()
            res.send(product);
        });

        app.post('/products/:id/like', async (req: Request, res: Response) => {
            const id = req.params.id
            const product = await productRepository.findOne({ where: { _id: new ObjectId(id) } })
            axios.post(`http://localhost:3000/products/${product.admin_id}/like`, {})
            product.likes++
            await productRepository.save(product)
            return res.send(product)
        });

        channel.consume('product_created', async (msg) => {
            const eventProduct = JSON.parse(msg.content.toString())
            const product = new Product()
            product.admin_id = parseInt(eventProduct.id)
            product.title = eventProduct.title
            product.image = eventProduct.image
            product.likes = eventProduct.likes
            await productRepository.save(product)
            console.log('Product created');
        }, { noAck: true })

 
        channel.consume('product_updated', async (msg) => {
            const eventProduct = JSON.parse(msg.content.toString())
            const product = await productRepository.findOne({ where: { admin_id: parseInt(eventProduct.id) } })              
            product.admin_id = parseInt(eventProduct.id)
            product.title = eventProduct.title
            product.image = eventProduct.image
            product.likes = eventProduct.likes
            await productRepository.save(product)
 
        }, { noAck: true })


        channel.consume('product_deleted', async (msg) => {     
            const eventProduct = JSON.parse(msg.content.toString())
            const product = await productRepository.findOneOrFail({ where: { admin_id: parseInt(eventProduct) } })             
           await productRepository.delete(product._id)           
        }, { noAck: true })


        //Server initialization

        AppDataSource.initialize().then(() => {
            app.listen(port, () => {
                console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
            });
        }).catch(err => {
            console.log(err);
        })

    })
    process.on('beforeExit', () => {
        console.log('closing');
        connetion.close()

    })
}
)

