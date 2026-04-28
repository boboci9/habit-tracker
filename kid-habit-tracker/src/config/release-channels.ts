export type ReleaseChannel = 'dev' | 'pilot';

export type ReleaseChannelConfig = {
  channel: ReleaseChannel;
  phase2FeaturesEnabled: boolean;
};

export const RELEASE_CHANNEL_CONFIG: Record<ReleaseChannel, ReleaseChannelConfig> = {
  dev: {
    channel: 'dev',
    phase2FeaturesEnabled: false,
  },
  pilot: {
    channel: 'pilot',
    phase2FeaturesEnabled: false,
  },
};

export function resolveReleaseChannelConfig(channel: ReleaseChannel): ReleaseChannelConfig {
  return RELEASE_CHANNEL_CONFIG[channel];
}
