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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard'; // You'll need to create this guard

@Controller('user')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  // Get the authenticated user's profile
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
      username: user.username,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      dob: user.dob || '',
      gender: user.gender || '',
      avatar: user.avatar || 'https://via.placeholder.com/150', // Default avatar
    };
  }

  // Update the authenticated user's profile
  @UseGuards(JwtAuthGuard)
  @Post('update-profile')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Optional: Add file type validation
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new BadRequestException('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
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
    if (file) {
      userData.avatar = `/uploads/${file.filename}`;
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

  // Update the authenticated user's avatar
  @UseGuards(JwtAuthGuard)
  @Post('update-avatar')
  async updateAvatar(@Request() req, @Body() data: { username: string; avatar: string }) {
    const authenticatedUsername = req.user.username; // Extract username from token
    console.log("Authenticated username from token:", authenticatedUsername);

    if (!data.username || !data.avatar) {
      throw new BadRequestException('Username and avatar are required');
    }

    // Validate that the username in the request matches the authenticated user
    if (data.username !== authenticatedUsername) {
      throw new BadRequestException('You can only update your own avatar');
    }

    await this.userService.updateAvatar(data.username, data.avatar);

    return {
      success: true,
      message: 'Avatar updated successfully',
    };
  }

  // Get all users (admin only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  async findAll() {
    const users = await this.userService.findAll();
    return users
      .filter((user) => user.role !== 'admin')
      .map((user) => ({
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
}