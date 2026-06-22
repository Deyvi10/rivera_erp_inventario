// src/posts/posts.service.spec.ts (tests completos)

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { Post } from './post.entity';
import { Category } from '../categories/category.entity';
import { describe } from 'node:test';

describe('PostsService', () => {
  let service: PostsService;

  const mockPostsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockCategoriesRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    // Limpiamos el estado de los mocks antes de cada test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(Post), useValue: mockPostsRepository },
        { provide: getRepositoryToken(Category), useValue: mockCategoriesRepository },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ────────────────────────────────────────────────────────────
  describe('create()', () => {

    it('should return null when category does not exist', async () => {
      // Arrange: la categoría no existe
      mockCategoriesRepository.findOne.mockResolvedValue(null);

      const dto = { title: 'Post', content: 'Contenido', categoryId: '99' };

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).toBeNull();
    });

    it('should create and return a post when category exists', async () => {
      // Arrange: simulamos que la categoría y el post existen
      const mockCategory = { id: '1', name: 'Tech' };
      const mockPost = { id: 'abc', title: 'Post', content: 'Texto', category: mockCategory };

      mockCategoriesRepository.findOne.mockResolvedValue(mockCategory);
      mockPostsRepository.create.mockReturnValue(mockPost);
      mockPostsRepository.save.mockResolvedValue(mockPost);

      const dto = { title: 'Post', content: 'Texto', categoryId: '1' };

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).toEqual(mockPost);
      expect(result).not.toBeNull();
    });

    it('should call categoriesRepository.findOne with correct id', async () => {
      // Arrange
      mockCategoriesRepository.findOne.mockResolvedValue(null);
      const dto = { title: 'Post', content: 'Texto', categoryId: '42' };

      // Act
      await service.create(dto);

      // Assert: verificamos que se llamó con los parámetros correctos
      expect(mockCategoriesRepository.findOne).toHaveBeenCalledWith({
        where: { id: '42' },
      });
    });

    it('should return null when repository throws an error', async () => {
      // Arrange: simulamos un error inesperado en la base de datos
      mockCategoriesRepository.findOne.mockRejectedValue(
        new Error('DB connection lost')
      );
      const dto = { title: 'Post', content: 'Texto', categoryId: '1' };

      // Act
      const result = await service.create(dto);

      // Assert: el servicio captura el error y devuelve null
      expect(result).toBeNull();
    });

  });



  // Añade estos tests dentro del describe('PostsService')

  describe('findOne()', () => {

    it('should return a post when it exists', async () => {
      // Arrange
      const mockPost = { id: '1', title: 'Post encontrado', category: { name: 'Tech' } };
      mockPostsRepository.findOne.mockResolvedValue(mockPost);

      // Act
      const result = await service.findOne('1');

      // Assert
      expect(result).toEqual(mockPost);
      expect(result).not.toBeNull();
    });

    it('should return null when post does not exist', async () => {
      // Arrange: el post no existe en la base de datos
      mockPostsRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findOne('inexistente');

      // Assert
      expect(result).toBeNull();
    });

    it('should call findOne with id and category relation', async () => {
      // Arrange
      mockPostsRepository.findOne.mockResolvedValue(null);

      // Act
      await service.findOne('5');

      // Assert: verificamos que se pasaron las relaciones correctas
      expect(mockPostsRepository.findOne).toHaveBeenCalledWith({
        where: { id: '5' },
        relations: ['category'],
      });
    });

    describe('remove()', () => {

      it('should return true when post is deleted', async () => {
        // Arrange: delete afectó 1 fila → éxito
        mockPostsRepository.delete.mockResolvedValue({ affected: 1 });

        // Act
        const result = await service.remove('1');

        // Assert
        expect(result).toBe(true);
      });

      it('should return false when post does not exist', async () => {
        // Arrange: delete no afectó ninguna fila → no existía
        mockPostsRepository.delete.mockResolvedValue({ affected: 0 });

        // Act
        const result = await service.remove('inexistente');

        // Assert
        expect(result).toBe(false);
      });

      it('should return false when repository throws an error', async () => {
        // Arrange: error en la base de datos
        mockPostsRepository.delete.mockRejectedValue(new Error('FK constraint'));

        // Act
        const result = await service.remove('1');

        // Assert
        expect(result).toBe(false);
      });

    });

  });



});