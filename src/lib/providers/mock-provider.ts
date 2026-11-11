import { IPublisherProvider, ChannelTarget, PublishPayload, PublishResult } from './types';

export class MockProvider implements IPublisherProvider {
  id = 'mock';
  name = 'Dry-Run Simulation Mode';
  iconName = 'Play';
  isEnabled = true;

  async isConnected(): Promise<boolean> {
    return true;
  }

  async getChannels(): Promise<ChannelTarget[]> {
    return [
      { id: 'mock_channel_1', name: '🎯 Test Sandbox Feed', description: 'Simulated Channel' },
      { id: 'mock_channel_2', name: '🧪 QA Staging Board', description: 'Simulated Channel' },
    ];
  }

  async publish(payload: PublishPayload): Promise<PublishResult> {
    // Artificial slight delay to simulate network latency
    await new Promise((r) => setTimeout(r, 400));
    return {
      success: true,
      externalPostId: `mock_${Date.now()}`,
      externalPostUrl: `https://example.com/posts/mock_${Date.now()}`,
      publishedAt: new Date().toISOString(),
    };
  }
}
