import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemSchema, Item } from './schemas/item.schema';

@Module({
  controllers: [ItemsController],
  exports: [ItemsService],
  providers: [ItemsService],
  imports: [MongooseModule.forFeature([{name: Item.name, schema : ItemSchema }])]
})
export class ItemsModule {}
