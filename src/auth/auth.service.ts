import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { AuthDto } from './dto/auth.dto';
import { PrismaService } from './../prisma/prisma.service';
import { ForbiddenException, Injectable } from "@nestjs/common";
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable( )
export class AuthService{
    constructor(private prisma:PrismaService,private jwt : JwtService,
        private config: ConfigService
        ){}
    async signup(dto:AuthDto){
        // generate the password hash
            const hash = await argon.hash(dto.password);

        try {
            //save the user in the db
            const user = await this.prisma.user.create({
                data:{
                    email: dto.email,
                    hash: hash
                }
            })
            //return the saved user
            delete user.hash;
            return user;
        } catch (error) {
            if(error instanceof PrismaClientKnownRequestError){
                if (error.code === 'P2002') {
                    throw new ForbiddenException('email is already available')
                }
                throw error;
            }
        }
    }

    async signin(dto:AuthDto){
       // find user by email
       const user = await this.prisma.user.findUnique({
        where:{
            email : dto.email,
        }
       })
       // if user is not exists throw error
       if (!user) {
        throw new ForbiddenException('Email is incorrect');
       }
       // match password
       const pwMatches = await argon.verify(user.hash,dto.password);
       // if password is not matched throw error
       if (!pwMatches) {
        throw new ForbiddenException('Password does not match');
       }
        // send back the user
       //delete user.hash;
       return this.signToken(user.id,user.email);
    }
    async signToken(userId: number,email: string):Promise<object>{
        const payload = {
            sub: userId,
            email: email
        }
        const secret = this.config.get('JWT_SECRET');

        const token = await this.jwt.signAsync(payload,{
            expiresIn: '15m',
            secret: secret
        })
        return {
            access_token: token,
        }
    }
}