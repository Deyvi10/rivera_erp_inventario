// src/users/users.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    create:  jest.fn(),
    save:    jest.fn(),
    findOne: jest.fn(),
    remove:  jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});