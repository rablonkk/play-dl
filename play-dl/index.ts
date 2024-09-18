import {
    playlist_info,
    video_basic_info,
    video_info,
    decipher_info,
    yt_validate,
    extractID,
    YouTube,
    YouTubeStream,
    YouTubeChannel,
    YouTubePlayList,
    YouTubeVideo,
    InfoData,
    yt_stream,
    yt_search
} from './YouTube';
import {
    spotify,
    sp_validate,
    refreshToken,
    is_expired,
    SpotifyAlbum,
    SpotifyPlaylist,
    SpotifyTrack,
    sp_search
} from './Spotify';
import {
    soundcloud,
    so_validate,
    SoundCloud,
    SoundCloudStream,
    SoundCloudPlaylist,
    SoundCloudTrack,
    so_search
} from './SoundCloud';
import { deezer, dz_validate, Deezer, DeezerTrack, DeezerPlaylist, dz_search } from './Deezer';
import { setToken } from './token';

enum AudioPlayerStatus {
    Idle = 'idle',
    Buffering = 'buffering',
    Paused = 'paused',
    Playing = 'playing',
    AutoPaused = 'autopaused'
}

interface SearchOptions {
    limit?: number;
    source?: {
        youtube?: 'video' | 'playlist' | 'channel';
        spotify?: 'album' | 'playlist' | 'track';
        soundcloud?: 'tracks' | 'playlists' | 'albums';
        deezer?: 'track' | 'playlist' | 'album';
    };
    fuzzy?: boolean;
    language?: string;
    unblurNSFWThumbnails?: boolean;
}

async function stream(url: string, options: StreamOptions = {}): Promise<YouTubeStream | SoundCloudStream> {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) throw new Error('Stream URL is empty.');

    const sourceHandlers = {
        spotify: () => {
            throw new Error('Spotify streaming not supported.');
        },
        deezer: () => {
            throw new Error('Deezer streaming not supported.');
        },
        soundcloud: () => so_stream(trimmedUrl, options.quality),
        youtube: () => yt_stream(trimmedUrl, options)
    };

    for (const [key, handler] of Object.entries(sourceHandlers)) {
        if (trimmedUrl.includes(key)) {
            return await handler();
        }
    }
    return await yt_stream(trimmedUrl, options);
}

async function search(
    query: string,
    options: SearchOptions = {}
): Promise<YouTube[] | Spotify[] | SoundCloud[] | Deezer[]> {
    if (!options.source) options.source = { youtube: 'video' };
    const encodedQuery = encodeURIComponent(query.trim());
    const sourceHandlers = {
        youtube: () => yt_search(encodedQuery, { ...options }),
        spotify: () => sp_search(encodedQuery, options.source.spotify, options.limit),
        soundcloud: () => so_search(encodedQuery, options.source.soundcloud, options.limit),
        deezer: () =>
            dz_search(encodedQuery, { limit: options.limit, type: options.source.deezer, fuzzy: options.fuzzy })
    };

    for (const [key, handler] of Object.entries(sourceHandlers)) {
        if (options.source[key]) {
            return await handler();
        }
    }
    throw new Error('Invalid search source.');
}

async function validate(
    url: string
): Promise<
    | 'so_playlist'
    | 'so_track'
    | 'sp_track'
    | 'sp_album'
    | 'sp_playlist'
    | 'dz_track'
    | 'dz_playlist'
    | 'dz_album'
    | 'yt_video'
    | 'yt_playlist'
    | 'search'
    | false
> {
    const trimmedUrl = url.trim();
    if (!trimmedUrl.startsWith('https')) return 'search';

    const validators = {
        spotify: async () => ((await sp_validate(trimmedUrl)) ? 'sp_' + (await sp_validate(trimmedUrl)) : false),
        soundcloud: async () => ((await so_validate(trimmedUrl)) ? 'so_' + (await so_validate(trimmedUrl)) : false),
        deezer: async () => ((await dz_validate(trimmedUrl)) ? 'dz_' + (await dz_validate(trimmedUrl)) : false),
        youtube: async () => ((await yt_validate(trimmedUrl)) ? 'yt_' + (await yt_validate(trimmedUrl)) : false)
    };

    for (const [key, validator] of Object.entries(validators)) {
        if (trimmedUrl.includes(key)) {
            return await validator();
        }
    }
    return false;
}

function authorization(): void {
    // Your existing authorization logic, streamlined if necessary
}

// Attach listeners for audio player
function attachListeners(player: EventEmitter, resource: YouTubeStream | SoundCloudStream) {
    const cleanupListeners = (event: string, listener: (...args: any[]) => void) => {
        player.removeListener(event, listener);
    };

    const pauseListener = () => resource.pause();
    const resumeListener = () => resource.resume();
    const idleListener = () => {
        cleanupListeners(AudioPlayerStatus.Paused, pauseListener);
        cleanupListeners(AudioPlayerStatus.AutoPaused, pauseListener);
        cleanupListeners(AudioPlayerStatus.Playing, resumeListener);
    };

    player.on(AudioPlayerStatus.Paused, pauseListener);
    player.on(AudioPlayerStatus.AutoPaused, pauseListener);
    player.on(AudioPlayerStatus.Playing, resumeListener);
    player.once(AudioPlayerStatus.Idle, idleListener);
}

// Export Main Commands
export {
    DeezerAlbum,
    DeezerPlaylist,
    DeezerTrack,
    SoundCloudPlaylist,
    SoundCloudStream,
    SoundCloudTrack,
    SpotifyAlbum,
    SpotifyPlaylist,
    SpotifyTrack,
    YouTubeChannel,
    YouTubePlayList,
    YouTubeVideo,
    attachListeners,
    authorization,
    decipher_info,
    deezer,
    dz_validate,
    extractID,
    is_expired,
    playlist_info,
    refreshToken,
    search,
    setToken,
    so_validate,
    soundcloud,
    spotify,
    sp_validate,
    stream,
    validate,
    video_basic_info,
    video_info,
    yt_validate,
    InfoData
};

// Export Types
export { Deezer, YouTube, SoundCloud, Spotify, YouTubeStream };

// Export Default
export default {
    DeezerAlbum,
    DeezerPlaylist,
    DeezerTrack,
    SoundCloudPlaylist,
    SoundCloudStream,
    SoundCloudTrack,
    SpotifyAlbum,
    SpotifyPlaylist,
    SpotifyTrack,
    YouTubeChannel,
    YouTubePlayList,
    YouTubeVideo,
    attachListeners,
    authorization,
    decipher_info,
    deezer,
    dz_validate,
    extractID,
    is_expired,
    playlist_info,
    refreshToken,
    search,
    setToken,
    so_validate,
    soundcloud,
    spotify,
    sp_validate,
    stream,
    validate,
    video_basic_info,
    video_info,
    yt_validate
};
