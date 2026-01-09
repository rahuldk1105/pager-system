import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheService } from './cache.service';

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  reset: jest.fn(),
};

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return cached value when available', async () => {
      const testValue = { data: 'test' };
      mockCacheManager.get.mockResolvedValue(testValue);

      const result = await service.get('test-key');

      expect(result).toEqual(testValue);
      expect(mockCacheManager.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null when cache miss', async () => {
      mockCacheManager.get.mockResolvedValue(undefined);

      const result = await service.get('test-key');

      expect(result).toBeNull();
    });

    it('should handle cache errors gracefully', async () => {
      mockCacheManager.get.mockRejectedValue(new Error('Cache error'));

      const result = await service.get('test-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value in cache', async () => {
      const testValue = { data: 'test' };

      await service.set('test-key', testValue);

      expect(mockCacheManager.set).toHaveBeenCalledWith('test-key', testValue, 300);
    });

    it('should set value with custom TTL', async () => {
      const testValue = { data: 'test' };

      await service.set('test-key', testValue, { ttl: 600 });

      expect(mockCacheManager.set).toHaveBeenCalledWith('test-key', testValue, 600);
    });

    it('should handle cache set errors gracefully', async () => {
      mockCacheManager.set.mockRejectedValue(new Error('Cache error'));

      await expect(service.set('test-key', 'value')).resolves.not.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete key from cache', async () => {
      mockCacheManager.del.mockResolvedValue(1);

      await service.delete('test-key');

      expect(mockCacheManager.del).toHaveBeenCalledWith('test-key');
    });

    it('should handle cache delete errors gracefully', async () => {
      mockCacheManager.del.mockRejectedValue(new Error('Cache error'));

      await expect(service.delete('test-key')).resolves.not.toThrow();
    });
  });

  describe('getOrSet', () => {
    it('should return cached value if available', async () => {
      const cachedValue = { data: 'cached' };
      mockCacheManager.get.mockResolvedValue(cachedValue);

      const factory = jest.fn();
      const result = await service.getOrSet('test-key', factory);

      expect(result).toEqual(cachedValue);
      expect(factory).not.toHaveBeenCalled();
    });

    it('should execute factory and cache result if not cached', async () => {
      const factoryValue = { data: 'factory' };
      const factory = jest.fn().mockResolvedValue(factoryValue);

      mockCacheManager.get.mockResolvedValue(null);

      const result = await service.getOrSet('test-key', factory);

      expect(result).toEqual(factoryValue);
      expect(factory).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith('test-key', factoryValue, 300);
    });

    it('should use custom options', async () => {
      const factoryValue = { data: 'factory' };
      const factory = jest.fn().mockResolvedValue(factoryValue);
      const options = { ttl: 600 };

      mockCacheManager.get.mockResolvedValue(null);

      await service.getOrSet('test-key', factory, options);

      expect(mockCacheManager.set).toHaveBeenCalledWith('test-key', factoryValue, 600);
    });
  });

  describe('cache key generation', () => {
    it('should generate incident key', () => {
      const key = service.generateIncidentKey('incident-123');
      expect(key).toBe('incident:incident-123');
    });

    it('should generate incidents list key', () => {
      const filters = { status: 'active', limit: 20 };
      const key = service.generateIncidentsListKey(filters);
      expect(key).toContain('incidents:list');
      expect(key).toContain('limit:20');
      expect(key).toContain('status:active');
    });

    it('should generate user key', () => {
      const key = service.generateUserKey('user-123');
      expect(key).toBe('user:user-123');
    });
  });

  describe('cache invalidation', () => {
    it('should invalidate incident cache', async () => {
      mockCacheManager.del.mockResolvedValue(1);

      await service.invalidateIncidentCache('incident-123');

      expect(mockCacheManager.del).toHaveBeenCalledWith('incident:incident-123');
      // Note: deletePattern is mocked and doesn't call del directly
    });

    it('should invalidate user cache', async () => {
      mockCacheManager.del.mockResolvedValue(1);

      await service.invalidateUserCache('user-123');

      expect(mockCacheManager.del).toHaveBeenCalledWith('user:user-123');
      // Note: deletePattern calls are mocked and don't call del directly
    });
  });
});