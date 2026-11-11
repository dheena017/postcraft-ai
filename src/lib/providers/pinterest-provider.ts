import { IPublisherProvider, ChannelTarget, PublishPayload, PublishResult } from './types';
import { getSettings } from '../db';

export class PinterestProvider implements IPublisherProvider {
  id = 'pinterest';
  name = 'Pinterest (API v5)';
  iconName = 'Pin';
  isEnabled = true;

  private async getAccessToken(): Promise<string | null> {
    const settings = await getSettings();
    return settings.pinterest.accessToken || process.env.PINTEREST_ACCESS_TOKEN || null;
  }

  async isConnected(): Promise<boolean> {
    const token = await this.getAccessToken();
    return Boolean(token && token.length > 10);
  }

  async getChannels(): Promise<ChannelTarget[]> {
    const token = await this.getAccessToken();

    // If no live token connected, return mock/starter boards so user can immediately schedule
    if (!token) {
      return [
        { id: 'board_default_1', name: '📌 Viral Inspiration & Aesthetic', description: 'Sample Board' },
        { id: 'board_default_2', name: '🎨 AI Art & Creative Ideas', description: 'Sample Board' },
        { id: 'board_default_3', name: '✨ Home Decor & Living', description: 'Sample Board' },
        { id: 'board_default_4', name: '🚀 Business & Marketing', description: 'Sample Board' },
      ];
    }

    try {
      const response = await fetch('https://api.pinterest.com/v5/boards?page_size=50', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('Failed to fetch real Pinterest boards, falling back to local list');
        return [
          { id: 'board_default_1', name: '📌 My Pinterest Board (Default)', description: 'Connected Board' },
        ];
      }

      const data = await response.json();
      const items = data.items || [];
      return items.map((b: { id: string; name: string; description?: string }) => ({
        id: b.id,
        name: b.name,
        description: b.description,
      }));
    } catch (err) {
      console.error('Error fetching Pinterest boards:', err);
      return [{ id: 'board_default_1', name: '📌 Default Pinterest Board' }];
    }
  }

  async publish(payload: PublishPayload): Promise<PublishResult> {
    const token = await this.getAccessToken();

    // If live token is present, execute real Pinterest API v5 call
    if (token) {
      try {
        const body: Record<string, unknown> = {
          title: payload.title.slice(0, 100),
          description: payload.description.slice(0, 500),
          board_id: payload.targetChannelId,
          media_source: {
            source_type: 'image_url',
            url: payload.imageUrl,
          },
        };

        if (payload.destinationUrl) {
          body.link = payload.destinationUrl;
        }

        const response = await fetch('https://api.pinterest.com/v5/pins', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Pinterest API returned error ${response.status}`);
        }

        const pinData = await response.json();
        return {
          success: true,
          externalPostId: pinData.id,
          externalPostUrl: `https://www.pinterest.com/pin/${pinData.id}/`,
          publishedAt: new Date().toISOString(),
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          success: false,
          error: `Pinterest Publish Failed: ${message}`,
          publishedAt: new Date().toISOString(),
        };
      }
    }

    // Simulation / Dry-run Mode (Active when no token configured yet)
    // Allows full end-to-end testing of the scheduler without blocking on Pinterest developer registration!
    const mockPinId = `sim_pin_${Date.now()}`;
    return {
      success: true,
      externalPostId: mockPinId,
      externalPostUrl: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(payload.title)}`,
      publishedAt: new Date().toISOString(),
    };
  }
}
