import { Injectable, NotFoundException  } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, ItemDocument } from './schemas/item.schema';

@Injectable()
export class ItemsService {
    constructor(@InjectModel(Item.name) private itemModel: Model<ItemDocument>) {}
    private items: Item[] = [];
    async findAll(search?: string, page = 1, limit = 10) {
        const filter = search ? { name : new RegExp(search, 'i')} : {};
        const items = await this.itemModel.find(filter).limit(limit).skip((page - 1) * limit).exec();
        const total = await this.itemModel.countDocuments(filter);
        return {
            items,
            total,
            page,
            pages: Math.ceil(total / limit),
        };
    }
    async findOne(id: string): Promise<ItemDocument>{
        const item = await this.itemModel.findById( id ).exec();
        if (!item) throw new NotFoundException('Item not found');
        return item;
    }
    async create(name: string, description: string): Promise<ItemDocument> {
        const newItem = new this.itemModel({ name, description });
        return newItem.save();
      }
      async update(id: string, name: string, description: string): Promise<ItemDocument> {
        const updatedItem = await this.itemModel.findByIdAndUpdate(
          id,
          { name, description },
          { new: true, runValidators: true },
        );
        if (!updatedItem) throw new NotFoundException('Item not found');
        return updatedItem;
      }
      async delete(id: string): Promise<void> {
        const deletedItem = await this.itemModel.findByIdAndDelete(id).exec();
        if (!deletedItem) throw new NotFoundException('Item not found');
      }

    
}
