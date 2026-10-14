import React, {useEffect, useRef, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {
  KeplerVideoSurfaceView,
  VideoPlayer,
} from '@amazon-devices/react-native-w3cmedia';
import {debugLog} from '../lib/debug';
import {useColors} from '../state/PrefsContext';

/**
 * The theme's backdrop, bottom to top: canvas colour, still, the looping video,
 * an optional flat dim, and the vignette. `motion={false}` leaves the video out
 * (the splash, which is gone before a player would start).
 */
export function Background({
  dim = 0,
  motion = true,
}: {
  dim?: number;
  motion?: boolean;
}) {
  const c = useColors();
  return (
    <View
      style={[StyleSheet.absoluteFill, {backgroundColor: c.canvas}]}
      pointerEvents="none">
      <Image
        source={c.still}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      {motion && c.video ? (
        <BackgroundVideo key={c.video} src={c.video} />
      ) : null}
      {dim > 0 ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            {backgroundColor: c.canvas, opacity: dim},
          ]}
        />
      ) : null}
      {c.vignette ? (
        <Image
          source={c.vignette}
          style={[StyleSheet.absoluteFill, styles.stretch]}
          resizeMode="stretch"
        />
      ) : null}
    </View>
  );
}

/**
 * URL-mode playback of a bundled MP4: muted, looping, no controls. The surface
 * stays hidden until the first frame plays, so the still shows through while it
 * starts and stays if it fails. Keyed by `src`, so a theme change gets a fresh
 * player.
 */
function BackgroundVideo({src}: {src: string}) {
  const player = useRef<VideoPlayer | null>(null);
  const gone = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(
    () => () => {
      gone.current = true;
    },
    [],
  );

  const onSurfaceViewCreated = async (handle: string) => {
    const video = new VideoPlayer();
    player.current = video;
    try {
      await video.initialize();
      if (gone.current) {
        await video.deinitialize();
        return;
      }
      video.addEventListener('playing', () => {
        if (!gone.current) setPlaying(true);
      });
      video.addEventListener('error', () => {
        debugLog('background.video.error', {src, code: video.error?.code});
        if (!gone.current) setFailed(true);
      });
      video.setSurfaceHandle(handle);
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.src = src;
    } catch (err) {
      debugLog('background.video.init_failed', {src, error: String(err)});
      if (!gone.current) setFailed(true);
    }
  };

  const onSurfaceViewDestroyed = async (handle: string) => {
    const video = player.current;
    player.current = null;
    if (!video) return;
    video.pause();
    video.clearSurfaceHandle(handle);
    await video.deinitialize().catch(() => {});
  };

  if (failed) return null;
  return (
    <KeplerVideoSurfaceView
      style={[StyleSheet.absoluteFill, {opacity: playing ? 1 : 0}]}
      scalingmode="fill"
      onSurfaceViewCreated={onSurfaceViewCreated}
      onSurfaceViewDestroyed={onSurfaceViewDestroyed}
    />
  );
}

const styles = StyleSheet.create({
  stretch: {width: '100%', height: '100%'},
});
