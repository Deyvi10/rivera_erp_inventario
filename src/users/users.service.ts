import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryDto } from 'src/common/dto/query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User | null> {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });
      return await this.userRepository.save(user);
    } catch (err) {
      console.error('Error creating user:', err);
      return null;
    }
  }

  async findAll(
    queryDto: QueryDto,
    isActive?: boolean,
  ): Promise<Pagination<User>> {
    try {
      const { page, limit, search, searchField, sort, order } = queryDto;
      const query = this.userRepository.createQueryBuilder('user');

      if (isActive !== undefined) {
        query.andWhere('user.isActive = :isActive', { isActive });
      }

      if (search) {
        if (searchField) {
          switch (searchField) {
            case 'username':
              query.andWhere('user.username ILIKE :search', { search: `%${search}%` });
              break;
            case 'email':
              query.andWhere('user.email ILIKE :search', { search: `%${search}%` });
              break;
            default:
              query.andWhere(
                '(user.username ILIKE :search OR user.email ILIKE :search)',
                { search: `%${search}%` },
              );
          }
        } else {
          query.andWhere(
            '(user.username ILIKE :search OR user.email ILIKE :search)',
            { search: `%${search}%` },
          );
        }
      }

      if (sort) {
        query.orderBy(`user.${sort}`, (order ?? 'ASC') as 'ASC' | 'DESC');
      }

      return await paginate<User>(query, { page, limit });
    } catch (err) {
      console.error('Error retrieving users:', err);
      throw new InternalServerErrorException('Error al obtener los usuarios');
    }
  }

  async findOne(id: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { id } });
    } catch (err) {
      console.error('Error fetching user:', err);
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (err) {
      console.error('Error fetching user by email:', err);
      return null;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }
      await this.userRepository.update(id, updateUserDto);
      const updatedUser = await this.findOne(id);
      if (!updatedUser) throw new NotFoundException('Usuario no encontrado');
      return updatedUser;
    } catch (err) {
      console.error('Error updating user:', err);
      throw new InternalServerErrorException('Error al actualizar el usuario');
    }
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    try {
      const user = await this.findOne(id);
      if (!user) throw new NotFoundException('Usuario no encontrado');
      await this.userRepository.remove(user);
      return { deleted: true };
    } catch (err) {
      console.error('Error removing user:', err);
      throw new InternalServerErrorException('Error al eliminar el usuario');
    }
  }

  async updateProfile(id: string, filename: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    
    // Asegúrate de que tu entidad 'User' tenga la propiedad 'profile' o cambia este campo
    user.profile = filename; 
    return this.userRepository.save(user);
  }
}