import { AuthDto } from './dto/auth.dto';

import { Body, Controller, ParseIntPipe, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController{
    constructor(private authService : AuthService){}

    @Post('signup')
    signup(@Body() dto: AuthDto){
        return this.authService.signup(dto);
    }

    @Post('signin')
    signin(@Body() dto : AuthDto){
        return this.authService.signin(dto);
    }
}