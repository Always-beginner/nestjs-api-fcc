import { UserService } from './user.service';
import { EditUserDto } from './dto/edit-user.dto';
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { GetUser } from '../decorator';
import { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    constructor(private userService:UserService){}
    @Get('me')
    getMe(@GetUser() user:User){
       return user;
    }

    @Patch('update')
    editUser(@GetUser('id') userId:number,@Body() dto:EditUserDto){
        return this.userService.editUser(userId,dto);
    }
}
