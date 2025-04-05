import { 
    BadRequestException, 
    Controller, 
    Get, 
    NotFoundException, 
    Post,
    Query, 
    Body,
    UseInterceptors,
    UploadedFile,
    UnauthorizedException,
    UseGuards
  } from '@nestjs/common';
  import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';
import { Roles } from 'src/auth/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
  @Controller('user')
  export class UserController {
    constructor(private readonly userService: UsersService) {}
  
    @Get('profile')
    async getUser(@Query('username') username: string) {
      console.log("Received username:", username); 
  
      if (!username) {
        throw new BadRequestException('Username is required');
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
    @Post('update-profile')
    @UseInterceptors(FileInterceptor('avatar', {
  storage: diskStorage({
    destination: './uploads/',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      callback(null, uniqueSuffix + '-' + file.originalname);
    }
  }),
    }))
    async updateProfile(@UploadedFile() file: Express.Multer.File, @Body() userData: any) {
  console.log("Received data:", userData);
  
  if (!userData.username) {
    throw new BadRequestException('Username is required');
  }

  if (file) {
    userData.avatar = `/uploads/${file.filename}`;
  }

  if (userData.dob && userData.dob.trim() !== '') {
    try {
      userData.dob = new Date(userData.dob);
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
    user: updatedUser,
  };
    }
  
    @Post('update-avatar')
    async updateAvatar(@Body() data: { username: string, avatar: string }) {
      if (!data.username || !data.avatar) {
        throw new BadRequestException('Username and avatar are required');
      }
  
      await this.userService.updateAvatar(data.username, data.avatar);
      
      return {
        success: true,
        message: 'Avatar updated successfully'
      };
    }
     
    @Get('all')
    @UseGuards(AuthGuard('jwt'))
    @Roles('admin')
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