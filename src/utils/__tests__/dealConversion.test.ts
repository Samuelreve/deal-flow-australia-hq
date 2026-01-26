/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import { convertDealToDealSummary, convertDealsToDealSummaries } from '../dealConversion';
import { Deal } from '@/services/dealsService';

describe('dealConversion', () => {
  const mockDeal: Deal = {
    id: 'deal-123',
    title: 'Test Deal',
    description: 'A test deal description',
    status: 'active',
    health_score: 85,
    seller_id: 'seller-456',
    buyer_id: 'buyer-789',
    asking_price: 100000,
    business_name: 'Test Business',
    business_industry: 'Technology',
    target_completion_date: '2024-12-31',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-06-15T15:30:00Z',
    seller: { name: 'John Seller' },
    buyer: { name: 'Jane Buyer' },
  };

  describe('convertDealToDealSummary', () => {
    it('should convert a deal to deal summary with correct id', () => {
      const result = convertDealToDealSummary(mockDeal);
      expect(result.id).toBe('deal-123');
    });

    it('should convert title correctly', () => {
      const result = convertDealToDealSummary(mockDeal);
      expect(result.title).toBe('Test Deal');
    });

    it('should convert status correctly', () => {
      const result = convertDealToDealSummary(mockDeal);
      expect(result.status).toBe('active');
    });

    it('should convert createdAt to Date object', () => {
      const result = convertDealToDealSummary(mockDeal);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toBe('2024-01-15T10:00:00.000Z');
    });

    it('should convert updatedAt to Date object', () => {
      const result = convertDealToDealSummary(mockDeal);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.updatedAt.toISOString()).toBe('2024-06-15T15:30:00.000Z');
    });

    it('should include healthScore', () => {
      const result = convertDealToDealSummary(mockDeal);
      expect(result.healthScore).toBe(85);
    });

    it('should include sellerId', () => {
      const result = convertDealToDealSummary(mockDeal);
      expect(result.sellerId).toBe('seller-456');
    });

    it('should include buyerId', () => {
      const result = convertDealToDealSummary(mockDeal);
      expect(result.buyerId).toBe('buyer-789');
    });

    it('should include seller name', () => {
      const result = convertDealToDealSummary(mockDeal);
      expect(result.sellerName).toBe('John Seller');
    });

    it('should include buyer name', () => {
      const result = convertDealToDealSummary(mockDeal);
      expect(result.buyerName).toBe('Jane Buyer');
    });

    it('should use business_name for businessName', () => {
      const result = convertDealToDealSummary(mockDeal);
      expect(result.businessName).toBe('Test Business');
    });

    it('should fall back to title when business_name is missing', () => {
      const dealWithoutBusinessName = { ...mockDeal, business_name: undefined };
      const result = convertDealToDealSummary(dealWithoutBusinessName);
      expect(result.businessName).toBe('Test Deal');
    });

    it('should handle missing seller name', () => {
      const dealWithoutSeller = { ...mockDeal, seller: undefined };
      const result = convertDealToDealSummary(dealWithoutSeller);
      expect(result.sellerName).toBe('');
    });

    it('should handle missing buyer name', () => {
      const dealWithoutBuyer = { ...mockDeal, buyer: undefined };
      const result = convertDealToDealSummary(dealWithoutBuyer);
      expect(result.buyerName).toBe('');
    });

    it('should handle missing buyerId', () => {
      const dealWithoutBuyerId = { ...mockDeal, buyer_id: undefined };
      const result = convertDealToDealSummary(dealWithoutBuyerId);
      expect(result.buyerId).toBeUndefined();
    });
  });

  describe('convertDealsToDealSummaries', () => {
    it('should convert an array of deals', () => {
      const deals = [mockDeal, { ...mockDeal, id: 'deal-456', title: 'Second Deal' }];
      const result = convertDealsToDealSummaries(deals);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('deal-123');
      expect(result[1].id).toBe('deal-456');
    });

    it('should handle empty array', () => {
      const result = convertDealsToDealSummaries([]);
      expect(result).toEqual([]);
    });

    it('should preserve order', () => {
      const deals = [
        { ...mockDeal, id: 'deal-1', title: 'First' },
        { ...mockDeal, id: 'deal-2', title: 'Second' },
        { ...mockDeal, id: 'deal-3', title: 'Third' },
      ];
      const result = convertDealsToDealSummaries(deals);
      expect(result[0].title).toBe('First');
      expect(result[1].title).toBe('Second');
      expect(result[2].title).toBe('Third');
    });
  });
});
