import { PrismaService } from './../prisma/prisma.service';
import { EditBookmarkDto } from './dto/edit-bookmark.dto';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  getAllBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        userId: userId,
      },
    });
  }

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId: userId,
        ...dto,
      },
    });
    return bookmark;
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: {
        userId,
        id: bookmarkId,
      },
    });
    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException(`Access to resource denied`);
    return bookmark;
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    // get the bookmark by id
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    // check if user owns the bookmark
    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException('Access to resource denied');

    return this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookmarkById(userID: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });
    if (!bookmark || bookmark.userId !== userID)
      throw new ForbiddenException('Access to resource denied');

    await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  }
}
