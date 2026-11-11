import { IPublisherProvider, ProviderStatus } from './types';
import { PinterestProvider } from './pinterest-provider';

class ProviderRegistry {
  private providers: Map<string, IPublisherProvider> = new Map();

  constructor() {
    // Register primary live Pinterest provider
    this.register(new PinterestProvider());
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

    return statuses;
  }
}

export const providerRegistry = new ProviderRegistry();
