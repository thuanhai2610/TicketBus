import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Delete,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard'; // You'll need to create this guard
import storage from 'src/common/cloudinary-storage';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UsersService) {}
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getUserProfile(@Request() req) {
    const username = req.user.username; // Extract username from the token payload
    console.log("Authenticated username from token:", username);

    if (!username) {
      throw new BadRequestException('Username not found in token');
    }

    const user = await this.userService.findOne(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      dob: user.dob || '',
      gender: user.gender || '',
      avatar: user.avatar , // Default avatar
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-profile')
    @UseInterceptors(FileInterceptor('avatar', { storage }))
  async updateProfile(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() userData: any,
  ) {
    const authenticatedUsername = req.user.username; // Extract username from token
    console.log("Authenticated username from token:", authenticatedUsername);
    console.log("Received data:", userData);

    // Validate that the username in the request matches the authenticated user
    if (!userData.username) {
      throw new BadRequestException('Username is required');
    }
    if (userData.username !== authenticatedUsername) {
      throw new BadRequestException('You can only update your own profile');
    }

    // Handle file upload
    if (file && file.path) {
      userData.avatar = file.path; // URL trực tiếp từ Cloudinary
    }
    

    // Handle date of birth (dob)
    if (userData.dob && userData.dob.trim() !== '') {
      try {
        const parsedDate = new Date(userData.dob);
        if (isNaN(parsedDate.getTime())) {
          throw new Error('Invalid date');
        }
        userData.dob = parsedDate;
        console.log("Parsed DOB:", userData.dob);
      } catch (error) {
        console.error("Error parsing date:", error);
        throw new BadRequestException('Invalid date format for dob');
      }
    } else {
      delete userData.dob;
    }

    const updatedUser = await this.userService.updateProfile(userData);

    return {
      success: true,
      message: 'Profile updated successfully',
      user: {
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        phone: updatedUser.phone || '',
        dob: updatedUser.dob || '',
        gender: updatedUser.gender || '',
        avatar: updatedUser.avatar || 'https://via.placeholder.com/150',
      },
    };
  }


  @UseGuards(JwtAuthGuard)
  @Post('update-avatar')
  @UseInterceptors(FileInterceptor('avatar', { storage }))
  async updateAvatar(
    @Request() req, 
    @UploadedFile() file: Express.Multer.File
  ) {
    const username = req.user.username;
    if (!file || !file.path) {
      throw new BadRequestException('File avatar is required');
    }
  
    const avatarUrl = file.path; // đây là URL trên Cloudinary
    await this.userService.updateAvatar(username, avatarUrl);
  
    return {
      success: true,
      message: 'Avatar updated successfully',
      avatar: avatarUrl,       // trả về URL về cho client
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  async findAll() {
    const users = await this.userService.findAll();
    return users
      .filter((user) => user.role !== 'admin')
      .map((user) => ({
        userId: user._id,
        username: user.username,
        phone: user.phone || 'N/A',
        email: user.email || 'N/A',
        dob: user.dob || 'N/A',
        firstName: user.firstName || 'N/A',
        lastName: user.lastName || 'N/A',
        gender: user.gender || 'N/A',
        role: user.role || 'N/A',
        avatar: user.avatar || 'N/A',
      }));
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('total')
  async getTotalUsers() {
    const users = await this.userService.findAll();
    const nonAdminUsers = users.filter((user) => user.role !== 'admin');
    return { totalUsers: nonAdminUsers.length };
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    try {
      await this.userService.delete(id);
      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      }
      throw new BadRequestException('Failed to delete user: ' + error.message);
    }
  }
}