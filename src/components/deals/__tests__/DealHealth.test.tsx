/// <reference types="vitest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DealHealth from '../DealHealth';

describe('DealHealth', () => {
  describe('rendering', () => {
    it('should render health score percentage', () => {
      render(<DealHealth healthScore={75} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should render progress bar', () => {
      render(<DealHealth healthScore={50} />);
      const progressBar = document.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should show label by default', () => {
      render(<DealHealth healthScore={75} />);
      expect(screen.getByText('Based on milestone progress')).toBeInTheDocument();
    });

    it('should hide label when showLabel is false', () => {
      render(<DealHealth healthScore={75} showLabel={false} />);
      expect(screen.queryByText('Based on milestone progress')).not.toBeInTheDocument();
    });
  });

  describe('health status text', () => {
    it('should show "At Risk" for scores below 30', () => {
      render(<DealHealth healthScore={25} />);
      expect(screen.getByText('At Risk')).toBeInTheDocument();
    });

    it('should show "At Risk" for score of 0', () => {
      render(<DealHealth healthScore={0} />);
      expect(screen.getByText('At Risk')).toBeInTheDocument();
    });

    it('should show "At Risk" for score of 29', () => {
      render(<DealHealth healthScore={29} />);
      expect(screen.getByText('At Risk')).toBeInTheDocument();
    });

    it('should show "Needs Attention" for scores between 30-59', () => {
      render(<DealHealth healthScore={45} />);
      expect(screen.getByText('Needs Attention')).toBeInTheDocument();
    });

    it('should show "Needs Attention" for score of 30', () => {
      render(<DealHealth healthScore={30} />);
      expect(screen.getByText('Needs Attention')).toBeInTheDocument();
    });

    it('should show "Needs Attention" for score of 59', () => {
      render(<DealHealth healthScore={59} />);
      expect(screen.getByText('Needs Attention')).toBeInTheDocument();
    });

    it('should show "On Track" for scores between 60-84', () => {
      render(<DealHealth healthScore={75} />);
      expect(screen.getByText('On Track')).toBeInTheDocument();
    });

    it('should show "On Track" for score of 60', () => {
      render(<DealHealth healthScore={60} />);
      expect(screen.getByText('On Track')).toBeInTheDocument();
    });

    it('should show "On Track" for score of 84', () => {
      render(<DealHealth healthScore={84} />);
      expect(screen.getByText('On Track')).toBeInTheDocument();
    });

    it('should show "Excellent" for scores 85 and above', () => {
      render(<DealHealth healthScore={90} />);
      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });

    it('should show "Excellent" for score of 85', () => {
      render(<DealHealth healthScore={85} />);
      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });

    it('should show "Excellent" for score of 100', () => {
      render(<DealHealth healthScore={100} />);
      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });
  });

  describe('color classes', () => {
    it('should apply red color for low scores', () => {
      render(<DealHealth healthScore={20} />);
      const progressIndicator = document.querySelector('.bg-red-500');
      expect(progressIndicator).toBeInTheDocument();
    });

    it('should apply yellow color for medium scores', () => {
      render(<DealHealth healthScore={45} />);
      const progressIndicator = document.querySelector('.bg-yellow-500');
      expect(progressIndicator).toBeInTheDocument();
    });

    it('should apply green color for high scores', () => {
      render(<DealHealth healthScore={75} />);
      const progressIndicator = document.querySelector('.bg-green-500');
      expect(progressIndicator).toBeInTheDocument();
    });
  });

  describe('size variants', () => {
    it('should render default size', () => {
      render(<DealHealth healthScore={50} size="md" />);
      const progressContainer = document.querySelector('.h-2');
      expect(progressContainer).toBeInTheDocument();
    });

    it('should render small size', () => {
      render(<DealHealth healthScore={50} size="sm" />);
      const progressContainer = document.querySelector('.h-1\\.5');
      expect(progressContainer).toBeInTheDocument();
    });

    it('should render large size', () => {
      render(<DealHealth healthScore={50} size="lg" />);
      const progressContainer = document.querySelector('.h-3');
      expect(progressContainer).toBeInTheDocument();
    });

    it('should use smaller text for small size', () => {
      render(<DealHealth healthScore={50} size="sm" />);
      const percentageText = screen.getByText('50%');
      expect(percentageText).toHaveClass('text-xs');
    });
  });

  describe('tooltip', () => {
    it('should have help icon for tooltip', () => {
      render(<DealHealth healthScore={75} />);
      const helpIcon = document.querySelector('.cursor-help');
      expect(helpIcon).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle score of exactly 30 (boundary)', () => {
      render(<DealHealth healthScore={30} />);
      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('Needs Attention')).toBeInTheDocument();
    });

    it('should handle score of exactly 60 (boundary)', () => {
      render(<DealHealth healthScore={60} />);
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('On Track')).toBeInTheDocument();
    });

    it('should handle negative scores gracefully', () => {
      render(<DealHealth healthScore={-10} />);
      expect(screen.getByText('-10%')).toBeInTheDocument();
      expect(screen.getByText('At Risk')).toBeInTheDocument();
    });

    it('should handle scores over 100', () => {
      render(<DealHealth healthScore={150} />);
      expect(screen.getByText('150%')).toBeInTheDocument();
      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });
  });
});
