
import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity()
export class Product {
    @ObjectIdColumn()
    _id: string;

    @Column({ unique: true })
    admin_id: number;

    @Column()
    title: string;

    @Column()
    image: string;

    @Column({ default: 0 })
    likes: number;
}