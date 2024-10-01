// import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

// @Controller('Notification')
// export class NotificationController {
//   constructor(private readonly NotificationService: NotificationService) {}

//   @Post()
//   create(@Body() createNotificationDto: CreateNotificationDto) {
//     return this.NotificationService.create(createNotificationDto);
//   }

//   @Get()
//   findAll() {
//     return this.NotificationService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.NotificationService.findOne(+id);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
//     return this.NotificationService.update(+id, updateNotificationDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.NotificationService.remove(+id);
//   }
// }
