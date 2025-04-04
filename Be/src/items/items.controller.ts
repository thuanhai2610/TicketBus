import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query, Search, BadRequestException } from '@nestjs/common';
import { ItemsService } from './items.service';
@Controller('items')
export class ItemsController {
    constructor(
        private readonly itemsService: ItemsService
    ) {}
    @Get()
    findAll(
        @Query('search') search? :string,
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ) {
        return this.itemsService.findAll(search, page, limit);
    }
    @Get(':id')
    findOne(@Param('id') id: string){
        return this.itemsService.findOne(id)
    }
    @Put(':id')
    update(@Param('id') id: string, 
    @Body()
    body: { name: string, description: string}) {
         return this.itemsService.update(id, body.name, body.description);

    };
    @Post()
    create(@Body() body: { name: string; description: string }) {
        return this.itemsService.create(body.name, body.description);
      }
    @Delete(':id')
    delete(@Param('id') id: string)
    {
        this.itemsService.delete(id);
        return{ message: "Item Delete"}
    }
}
