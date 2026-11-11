export interface ChannelTarget {
  id: string;
  name: string;
  description?: string;
  url?: string;
}

export interface PublishPayload {
  title: string;
  description: string;
  imageUrl: string;
  destinationUrl?: string;
  tags?: string[];
  targetChannelId: string; // e.g. Pinterest Board ID
}

export interface PublishResult {
  success: boolean;
  externalPostId?: string;
  externalPostUrl?: string;
  error?: string;
  publishedAt: string;
}

export interface ProviderStatus {
  id: string;
  name: string;
  iconName: string;
  isEnabled: boolean;
  isConnected: boolean;
  accountName?: string;
  channelsCount: number;
  supportsDirectPublish: boolean;
  supportsBulkExport: boolean;
}

export interface IPublisherProvider {
  id: string;
  name: string;
  iconName: string;
  isEnabled: boolean;
  isConnected(): Promise<boolean>;
  getChannels(): Promise<ChannelTarget[]>;
  publish(payload: PublishPayload): Promise<PublishResult>;
}
