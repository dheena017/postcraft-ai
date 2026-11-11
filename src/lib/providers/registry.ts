import { IPublisherProvider, ProviderStatus } from './types';
import { PinterestProvider } from './pinterest-provider';
import { MockProvider } from './mock-provider';

class ProviderRegistry {
  private providers: Map<string, IPublisherProvider> = new Map();

  constructor() {
    // Register primary provider
    this.register(new PinterestProvider());
    // Register test simulation provider
    this.register(new MockProvider());
  }

  register(provider: IPublisherProvider): void {
    this.providers.set(provider.id, provider);
  }

  get(id: string): IPublisherProvider | undefined {
    return this.providers.get(id);
  }

  getAll(): IPublisherProvider[] {
    return Array.from(this.providers.values());
  }

  async getStatuses(): Promise<ProviderStatus[]> {
    const statuses: ProviderStatus[] = [];

    for (const p of Array.from(this.providers.values())) {
      const isConnected = await p.isConnected();
      const channels = await p.getChannels();

      statuses.push({
        id: p.id,
        name: p.name,
        iconName: p.iconName,
        isEnabled: p.isEnabled,
        isConnected,
        channelsCount: channels.length,
        supportsDirectPublish: true,
        supportsBulkExport: true,
      });
    }

    // Include future upcoming providers for visibility & roadmap
    statuses.push(
      {
        id: 'instagram',
        name: 'Instagram (Graph API)',
        iconName: 'Instagram',
        isEnabled: false,
        isConnected: false,
        channelsCount: 0,
        supportsDirectPublish: true,
        supportsBulkExport: true,
      },
      {
        id: 'twitter',
        name: 'X (Twitter API v2)',
        iconName: 'Twitter',
        isEnabled: false,
        isConnected: false,
        channelsCount: 0,
        supportsDirectPublish: true,
        supportsBulkExport: true,
      },
      {
        id: 'tiktok',
        name: 'TikTok Business',
        iconName: 'Video',
        isEnabled: false,
        isConnected: false,
        channelsCount: 0,
        supportsDirectPublish: true,
        supportsBulkExport: true,
      }
    );

    return statuses;
  }
}

export const providerRegistry = new ProviderRegistry();
