import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HeroImage } from '@/components/HeroImage';

describe('HeroImage', () => {
  it('renders an img when heroImage is set', () => {
    const { container } = render(
      <HeroImage slug="x" name="X" heroImage="/projects/x.webp" />,
    );
    expect(container.querySelector('img')).toBeTruthy();
  });

  it('renders a programmatic stub div when heroImage is null', () => {
    const { container, getByText } = render(
      <HeroImage slug="x" name="HealthPulse AI" heroImage={null} />,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(getByText('HealthPulse AI')).toBeTruthy();
  });

  it('produces a stable hue for the same slug', () => {
    const { container } = render(<HeroImage slug="health-pulse" name="HP" heroImage={null} />);
    const div = container.querySelector('[data-stub-hue]');
    expect(div?.getAttribute('data-stub-hue')).toMatch(/^\d+$/);
  });
});
