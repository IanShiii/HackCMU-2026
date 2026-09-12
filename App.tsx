import 'react-native-reanimated';

import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import {
  FlowerShape,
  flowerColors,
  flowerShapes,
  FriendFlower,
  HistoryFlower,
  useBloomStore,
} from './src/store/useBloomStore';

type ViewMode = 'outside' | 'inside' | 'checkin';
type TimePhase = 'morning' | 'day' | 'sunset' | 'night';

type FlowerPreviewProps = {
  shape: FlowerShape;
  color: string;
  mood?: 'positive' | 'negative' | 'neutral';
  weedy?: boolean;
  glow?: boolean;
  scale?: number;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const phaseColors: Record<TimePhase, { sky: string; horizon: string; grass: string }> = {
  morning: { sky: '#93c5fd', horizon: '#bfdbfe', grass: '#4d7c0f' },
  day: { sky: '#60a5fa', horizon: '#93c5fd', grass: '#3f6212' },
  sunset: { sky: '#f97316', horizon: '#c084fc', grass: '#365314' },
  night: { sky: '#1e1b4b', horizon: '#312e81', grass: '#1f3a1a' },
};

function PixelFlower({ shape, color, mood = 'neutral', weedy, glow, scale = 1 }: FlowerPreviewProps) {
  const petal = Math.max(5, Math.round(7 * scale));
  const center = Math.max(4, Math.round(5 * scale));
  const stemWidth = Math.max(2, Math.round(2 * scale));
  const stemHeight = Math.max(18, Math.round(20 * scale));

  const petals = useMemo(() => {
    if (shape === 'Tulip') {
      return [
        { left: 8, top: 0 },
        { left: 2, top: 4 },
        { left: 14, top: 4 },
      ];
    }

    if (shape === 'Sunflower') {
      return [
        { left: 3, top: 1 },
        { left: 13, top: 1 },
        { left: 1, top: 10 },
        { left: 15, top: 10 },
        { left: 8, top: 0 },
        { left: 8, top: 18 },
      ];
    }

    if (shape === 'Rose') {
      return [
        { left: 7, top: 3 },
        { left: 3, top: 9 },
        { left: 11, top: 9 },
        { left: 7, top: 14 },
      ];
    }

    if (shape === 'Lily') {
      return [
        { left: 8, top: 0 },
        { left: 1, top: 8 },
        { left: 15, top: 8 },
        { left: 4, top: 15 },
        { left: 12, top: 15 },
      ];
    }

    return [
      { left: 1, top: 8 },
      { left: 8, top: 0 },
      { left: 15, top: 8 },
      { left: 8, top: 16 },
    ];
  }, [shape]);

  return (
    <View style={{ width: 28 * scale, height: 62 * scale, alignItems: 'center' }}>
      <View style={{ width: 26 * scale, height: 28 * scale, marginBottom: 2 * scale }}>
        {petals.map((petalStyle, index) => (
          <View
            key={`${shape}-petal-${index}`}
            style={[
              styles.petal,
              {
                width: petal,
                height: petal,
                left: petalStyle.left * scale,
                top: petalStyle.top * scale,
                backgroundColor: mood === 'negative' ? '#6b7280' : color,
                borderColor: '#1f2937',
              },
            ]}
          />
        ))}

        <View
          style={[
            styles.center,
            {
              width: center,
              height: center,
              left: 11 * scale,
              top: 11 * scale,
              backgroundColor: shape === 'Sunflower' ? '#713f12' : '#fef08a',
              shadowOpacity: glow ? 0.9 : 0,
              shadowRadius: glow ? 8 : 0,
            },
          ]}
        />
      </View>

      <View style={{ width: stemWidth, height: stemHeight, backgroundColor: '#166534' }} />
      <View style={[styles.leaf, { left: 3 * scale, bottom: 17 * scale, transform: [{ rotate: '-22deg' }] }]} />
      <View style={[styles.leaf, { right: 3 * scale, bottom: 13 * scale, transform: [{ rotate: '25deg' }] }]} />

      {weedy ? (
        <>
          <View style={[styles.weed, { left: 3 * scale, bottom: 13 * scale, transform: [{ rotate: '-30deg' }] }]} />
          <View style={[styles.weed, { right: 3 * scale, bottom: 8 * scale, transform: [{ rotate: '30deg' }] }]} />
          <View style={[styles.thorn, { left: 7 * scale, bottom: 20 * scale }]} />
        </>
      ) : null}
    </View>
  );
}

function Sparkle({ delay = 0 }: { delay?: number }) {
  const twinkle = useSharedValue(0.2);

  useEffect(() => {
    twinkle.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }), withTiming(0.2, { duration: 700 })),
        -1,
        true,
      ),
    );
  }, [delay, twinkle]);

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: twinkle.value,
    transform: [{ scale: 0.7 + twinkle.value * 0.5 }],
  }));

  return <Animated.View style={[styles.sparkle, sparkleStyle]} />;
}

function HistoricalPlant({ flower, index, onPress }: { flower: HistoryFlower; index: number; onPress: () => void }) {
  const sway = useSharedValue(0);

  useEffect(() => {
    sway.value = withDelay(
      index * 80,
      withRepeat(
        withSequence(withTiming(-1, { duration: 1200 }), withTiming(1, { duration: 1200 })),
        -1,
        true,
      ),
    );
  }, [index, sway]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${sway.value * 3}deg` }],
  }));

  const weedy = flower.mood === 'negative' && !flower.trimmed;

  return (
    <Pressable onPress={onPress} style={[styles.gardenPlant, weedy && styles.weedyTile]}>
      <Animated.View style={animatedStyle}>
        <PixelFlower
          shape={flower.shape}
          color={flower.color}
          mood={flower.mood}
          weedy={weedy}
          glow={flower.mood === 'positive'}
          scale={0.9}
        />
      </Animated.View>
      <Text style={styles.plantLabel}>{flower.dayLabel}</Text>
      <Text style={styles.plantDate}>{flower.dateLabel}</Text>
    </Pressable>
  );
}

function FriendBouquet({ flowers, highlight }: { flowers: FriendFlower[]; highlight: boolean }) {
  return (
    <View style={styles.bouquetArea}>
      {flowers.map((flower, index) => (
        <View
          key={flower.id}
          style={{
            position: 'absolute',
            left: 8 + index * 12,
            bottom: index * 7,
            zIndex: index + 1,
          }}
        >
          <PixelFlower shape={flower.shape} color={flower.color} glow={highlight && index === 2} scale={0.74} />
        </View>
      ))}
    </View>
  );
}

function FlowerSwatch({ shape, color, selected, onPress }: { shape: FlowerShape; color: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.shapeCard, selected && styles.shapeCardSelected]}>
      <PixelFlower shape={shape} color={color} scale={0.7} />
      <Text style={styles.shapeLabel}>{shape}</Text>
    </Pressable>
  );
}

export default function App() {
  const [mode, setMode] = useState<ViewMode>('outside');
  const [now, setNow] = useState(new Date());
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [paintingMode, setPaintingMode] = useState<'paint' | 'erase'>('paint');
  const [pruneMessage, setPruneMessage] = useState(false);

  const history = useBloomStore((state) => state.history);
  const friends = useBloomStore((state) => state.friends);
  const trimWeeds = useBloomStore((state) => state.trimWeeds);
  const selectedShape = useBloomStore((state) => state.selectedShape);
  const setSelectedShape = useBloomStore((state) => state.setSelectedShape);
  const selectedColor = useBloomStore((state) => state.selectedColor);
  const setSelectedColor = useBloomStore((state) => state.setSelectedColor);
  const journalEntry = useBloomStore((state) => state.journalEntry);
  const setJournalEntry = useBloomStore((state) => state.setJournalEntry);
  const potGrid = useBloomStore((state) => state.potGrid);
  const paintPotPixel = useBloomStore((state) => state.paintPotPixel);
  const erasePotPixel = useBloomStore((state) => state.erasePotPixel);
  const clearPotGrid = useBloomStore((state) => state.clearPotGrid);

  const sceneOpacity = useSharedValue(1);
  const sceneScale = useSharedValue(1);
  const reflectionWeeds = useSharedValue(1);
  const reflectionScale = useSharedValue(1);
  const pruneShake = useSharedValue(0);
  const pruneSpark = useSharedValue(0);

  useEffect(() => {
    setSelectedFriendId(friends[0]?.id ?? null);
  }, [friends]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const timePhase = useMemo<TimePhase>(() => {
    const hour = now.getHours();
    if (hour >= 6 && hour < 11) {
      return 'morning';
    }
    if (hour >= 11 && hour < 17) {
      return 'day';
    }
    if (hour >= 17 && hour < 20) {
      return 'sunset';
    }
    return 'night';
  }, [now]);

  const selectedHistory = history.find((flower) => flower.id === selectedHistoryId) ?? null;
  const selectedFriend = friends.find((friend) => friend.id === selectedFriendId) ?? friends[0];

  const sceneAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sceneOpacity.value,
    transform: [{ scale: sceneScale.value }],
  }));

  const weedsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: reflectionWeeds.value,
    transform: [{ scale: reflectionScale.value }],
  }));

  const pruneAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${pruneShake.value}deg` }, { scale: 1 + pruneSpark.value * 0.06 }],
  }));

  const sparkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pruneSpark.value,
    transform: [{ scale: 0.65 + pruneSpark.value * 0.7 }],
  }));

  const navigateTo = (nextMode: ViewMode) => {
    if (mode === nextMode) {
      return;
    }

    sceneOpacity.value = withTiming(0.2, { duration: 220 });
    sceneScale.value = withTiming(0.92, { duration: 220 });

    setTimeout(() => {
      setMode(nextMode);
      sceneOpacity.value = withTiming(1, { duration: 280 });
      sceneScale.value = withTiming(1, { duration: 280 });
    }, 210);
  };

  const onTrimWeeds = () => {
    if (!selectedHistory) {
      return;
    }

    reflectionScale.value = withSequence(withTiming(1.15, { duration: 140 }), withTiming(0.8, { duration: 170 }));
    reflectionWeeds.value = withTiming(0, { duration: 320 });

    setTimeout(() => {
      trimWeeds(selectedHistory.id);
      setSelectedHistoryId(null);
      reflectionWeeds.value = 1;
      reflectionScale.value = 1;
    }, 340);
  };

  const onPruneVase = async () => {
    pruneShake.value = withSequence(
      withTiming(-8, { duration: 70 }),
      withTiming(8, { duration: 70 }),
      withTiming(-4, { duration: 70 }),
      withTiming(0, { duration: 70 }),
    );
    pruneSpark.value = 1;
    pruneSpark.value = withTiming(0, { duration: 900 });
    setPruneMessage(true);
    setTimeout(() => setPruneMessage(false), 1800);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const selectedColorIndex = Math.max(1, flowerColors.indexOf(selectedColor) + 1);
  const sky = phaseColors[timePhase];

  return (
    <View style={[styles.screen, { backgroundColor: sky.sky }]}> 
      <StatusBar style={timePhase === 'night' ? 'light' : 'dark'} />

      <View style={styles.titleWrap}>
        <Text style={styles.title}>Bloom Village</Text>
        <Text style={styles.subtitle}>
          {mode === 'outside'
            ? 'Tend your memory garden and step into your warm cottage.'
            : mode === 'inside'
              ? 'Your friends are waiting on the shelf.'
              : 'Craft today’s flower and paint your pot.'}
        </Text>
      </View>

      <Animated.View style={[styles.sceneBody, sceneAnimatedStyle]}>
        {mode === 'outside' ? (
          <ScrollView contentContainerStyle={styles.outsideScroll} showsVerticalScrollIndicator={false}>
            <View style={[styles.skyBand, { backgroundColor: sky.horizon }]}>
              {timePhase !== 'night' ? (
                <View style={[styles.sun, timePhase === 'sunset' && styles.sunsetSun]} />
              ) : (
                <View style={styles.nightSky}>
                  <View style={[styles.starRow, { top: 12, left: 24 }]}>
                    <Sparkle />
                  </View>
                  <View style={[styles.starRow, { top: 28, left: 120 }]}>
                    <Sparkle delay={220} />
                  </View>
                  <View style={[styles.starRow, { top: 18, right: 34 }]}>
                    <Sparkle delay={420} />
                  </View>
                </View>
              )}

              <View style={styles.cottageWrap}>
                <View style={styles.roof} />
                <View style={styles.cottage}>
                  <View style={[styles.window, timePhase === 'night' && styles.windowGlow]} />
                  <View style={[styles.window, timePhase === 'night' && styles.windowGlow]} />
                  <Pressable onPress={() => navigateTo('inside')} style={styles.door}>
                    <View style={styles.doorKnob} />
                    <Text style={styles.doorHint}>Enter</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={[styles.ground, { backgroundColor: sky.grass }]}> 
              <View style={styles.path}>
                <View style={styles.steppingStone} />
                <View style={styles.steppingStone} />
                <View style={styles.steppingStone} />
              </View>

              <View style={styles.gardenRows}>
                {history.map((flower, index) => (
                  <HistoricalPlant
                    key={flower.id}
                    flower={flower}
                    index={index}
                    onPress={() => setSelectedHistoryId(flower.id)}
                  />
                ))}
              </View>

              <Pressable style={styles.deskSign} onPress={() => navigateTo('checkin')}>
                <Text style={styles.signText}>Journal Desk →</Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : null}

        {mode === 'inside' ? (
          <ScrollView contentContainerStyle={styles.insideScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.insideRoom}>
              <View style={styles.lamp}>
                <View style={styles.lampGlow} />
              </View>
              <View style={styles.insideWindow} />

              <View style={styles.shelfBoardTop} />
              <View style={styles.shelfSlots}>
                {friends.map((friend) => {
                  const selected = selectedFriendId === friend.id;
                  return (
                    <Pressable
                      key={friend.id}
                      onPress={() => setSelectedFriendId(friend.id)}
                      style={[styles.friendSlot, selected && styles.friendSlotSelected]}
                    >
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <FriendBouquet flowers={friend.flowers} highlight={selected} />

                      <View style={styles.potRim} />
                      <View style={styles.potBody}>
                        <View style={styles.potPatternRow}>
                          {friend.potPixels[4].slice(0, 8).map((pixel, index) => (
                            <View
                              key={`${friend.id}-pix-${index}`}
                              style={{
                                width: 5,
                                height: 5,
                                backgroundColor: pixel === 0 ? '#cbd5e1' : flowerColors[(pixel - 1) % flowerColors.length],
                                marginHorizontal: 0.5,
                              }}
                            />
                          ))}
                        </View>
                      </View>
                      <View style={styles.potBase} />
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.shelfBoardBottom} />

              <View style={styles.prunePanel}>
                <Text style={styles.pruneTitle}>{selectedFriend?.name ?? 'Friend'}’s Bouquet</Text>
                <Text style={styles.pruneHint}>Send care by pruning their vase.</Text>

                <Animated.View style={[styles.prunePreview, pruneAnimatedStyle]}>
                  <FriendBouquet flowers={selectedFriend?.flowers ?? []} highlight />
                </Animated.View>
                <Animated.View style={[styles.pruneSpark, sparkAnimatedStyle]}>
                  <Sparkle />
                  <Sparkle delay={120} />
                </Animated.View>

                <Pressable onPress={onPruneVase} style={styles.pruneButton}>
                  <Text style={styles.pruneButtonText}>Prune Vase</Text>
                </Pressable>

                {pruneMessage ? <Text style={styles.pruneMessage}>Notification sent!</Text> : null}
              </View>

              <Pressable style={styles.insideDoor} onPress={() => navigateTo('outside')}>
                <Text style={styles.insideDoorText}>Back to Garden</Text>
              </Pressable>

              <Pressable style={styles.insideDesk} onPress={() => navigateTo('checkin')}>
                <Text style={styles.insideDeskText}>Mood Craft Table</Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : null}

        {mode === 'checkin' ? (
          <ScrollView contentContainerStyle={styles.creatorScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.deskRoom}>
              <View style={styles.tableTop} />
              <View style={styles.tableLegRow}>
                <View style={styles.tableLeg} />
                <View style={styles.tableLeg} />
              </View>

              <Text style={styles.creatorHeading}>Seed Selection</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {flowerShapes.map((shape, index) => (
                  <FlowerSwatch
                    key={shape}
                    shape={shape}
                    color={flowerColors[index % flowerColors.length]}
                    selected={shape === selectedShape}
                    onPress={() => setSelectedShape(shape)}
                  />
                ))}
              </ScrollView>

              <Text style={styles.creatorHeading}>Petal Palette</Text>
              <View style={styles.paletteRow}>
                {flowerColors.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[styles.colorChip, { backgroundColor: color }, selectedColor === color && styles.colorChipSelected]}
                  />
                ))}
              </View>

              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Today’s Bloom Preview</Text>
                <PixelFlower shape={selectedShape} color={selectedColor} glow scale={0.9} />
              </View>

              <Text style={styles.creatorHeading}>Journal Notes</Text>
              <TextInput
                value={journalEntry}
                onChangeText={setJournalEntry}
                placeholder="Write today's reflection..."
                placeholderTextColor="#4b5563"
                multiline
                style={styles.journalInput}
              />

              <Text style={styles.creatorHeading}>Pot Painter (20 × 20)</Text>
              <View style={styles.paintToolsRow}>
                <Pressable
                  onPress={() => setPaintingMode('paint')}
                  style={[styles.toolButton, paintingMode === 'paint' && styles.toolButtonActive]}
                >
                  <Text style={styles.toolButtonText}>Paint</Text>
                </Pressable>
                <Pressable
                  onPress={() => setPaintingMode('erase')}
                  style={[styles.toolButton, paintingMode === 'erase' && styles.toolButtonActive]}
                >
                  <Text style={styles.toolButtonText}>Erase</Text>
                </Pressable>
                <Pressable onPress={clearPotGrid} style={styles.toolButton}>
                  <Text style={styles.toolButtonText}>Clear</Text>
                </Pressable>
              </View>

              <View style={styles.gridWrap}>
                {potGrid.map((row, y) => (
                  <View key={`row-${y}`} style={styles.gridRow}>
                    {row.map((pixel, x) => (
                      <Pressable
                        key={`pixel-${x}-${y}`}
                        onPress={() =>
                          paintingMode === 'paint' ? paintPotPixel(x, y, selectedColorIndex) : erasePotPixel(x, y)
                        }
                        style={[
                          styles.gridCell,
                          {
                            backgroundColor: pixel === 0 ? '#e5e7eb' : flowerColors[(pixel - 1) % flowerColors.length],
                          },
                        ]}
                      />
                    ))}
                  </View>
                ))}
              </View>

              <View style={styles.creatorNavRow}>
                <Pressable style={styles.creatorNavButton} onPress={() => navigateTo('outside')}>
                  <Text style={styles.creatorNavText}>Garden</Text>
                </Pressable>
                <Pressable style={styles.creatorNavButton} onPress={() => navigateTo('inside')}>
                  <Text style={styles.creatorNavText}>Cottage</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        ) : null}
      </Animated.View>

      <View style={styles.fallbackNav}>
        <Pressable onPress={() => navigateTo('outside')} style={[styles.fallbackChip, mode === 'outside' && styles.fallbackChipActive]}>
          <Text style={styles.fallbackChipText}>Garden</Text>
        </Pressable>
        <Pressable onPress={() => navigateTo('inside')} style={[styles.fallbackChip, mode === 'inside' && styles.fallbackChipActive]}>
          <Text style={styles.fallbackChipText}>Cottage</Text>
        </Pressable>
        <Pressable onPress={() => navigateTo('checkin')} style={[styles.fallbackChip, mode === 'checkin' && styles.fallbackChipActive]}>
          <Text style={styles.fallbackChipText}>Creator</Text>
        </Pressable>
      </View>

      <Modal transparent visible={Boolean(selectedHistory)} animationType="fade" onRequestClose={() => setSelectedHistoryId(null)}>
        <View style={styles.reflectionBackdrop}>
          <View style={styles.journalModal}>
            <Text style={styles.journalTitle}>Garden Reflection</Text>
            <Text style={styles.journalMeta}>{selectedHistory?.dateLabel} • {selectedHistory?.dayLabel}</Text>
            <Text style={styles.journalMood}>Mood: {selectedHistory?.mood}</Text>
            <Text style={styles.journalEntry}>{selectedHistory?.entry}</Text>

            {selectedHistory ? (
              <Animated.View style={[styles.reflectionFlowerWrap, weedsAnimatedStyle]}>
                <PixelFlower
                  shape={selectedHistory.shape}
                  color={selectedHistory.color}
                  mood={selectedHistory.mood}
                  weedy={selectedHistory.mood === 'negative' && !selectedHistory.trimmed}
                  glow={selectedHistory.mood === 'positive'}
                  scale={0.92}
                />
              </Animated.View>
            ) : null}

            <View style={styles.reflectionActions}>
              <Pressable style={styles.closeButton} onPress={() => setSelectedHistoryId(null)}>
                <Text style={styles.closeButtonText}>Close Journal</Text>
              </Pressable>
              {selectedHistory?.mood === 'negative' && !selectedHistory.trimmed ? (
                <Pressable style={styles.trimButton} onPress={onTrimWeeds}>
                  <Text style={styles.trimButtonText}>Trim Weeds</Text>
                </Pressable>
              ) : (
                <View style={styles.trimDone}>
                  <Text style={styles.trimDoneText}>Already tended</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  titleWrap: {
    paddingTop: 56,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fef3c7',
    textShadowColor: 'rgba(15, 23, 42, 0.45)',
    textShadowRadius: 2,
    textShadowOffset: { width: 1, height: 1 },
  },
  subtitle: {
    marginTop: 3,
    color: '#e0f2fe',
    fontSize: 12,
    fontWeight: '600',
  },
  sceneBody: {
    flex: 1,
  },
  outsideScroll: {
    paddingBottom: 24,
  },
  skyBand: {
    height: 225,
    position: 'relative',
  },
  sun: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#fef08a',
    position: 'absolute',
    top: 16,
    right: 24,
    borderWidth: 2,
    borderColor: '#78350f',
  },
  sunsetSun: {
    backgroundColor: '#fb7185',
  },
  nightSky: {
    ...StyleSheet.absoluteFill,
  },
  starRow: {
    position: 'absolute',
  },
  sparkle: {
    width: 8,
    height: 8,
    backgroundColor: '#fef08a',
    borderWidth: 1,
    borderColor: '#f8fafc',
  },
  cottageWrap: {
    position: 'absolute',
    bottom: 0,
    left: SCREEN_WIDTH * 0.5 - 88,
    alignItems: 'center',
  },
  roof: {
    width: 188,
    height: 52,
    backgroundColor: '#92400e',
    borderWidth: 3,
    borderColor: '#451a03',
  },
  cottage: {
    width: 170,
    height: 122,
    backgroundColor: '#d6d3d1',
    borderWidth: 3,
    borderColor: '#57534e',
    marginTop: -2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  window: {
    width: 30,
    height: 30,
    borderWidth: 2,
    borderColor: '#292524',
    backgroundColor: '#bfdbfe',
    marginBottom: 28,
  },
  windowGlow: {
    backgroundColor: '#fcd34d',
    shadowColor: '#fef08a',
    shadowOpacity: 0.8,
    shadowRadius: 7,
  },
  door: {
    width: 44,
    height: 70,
    borderWidth: 3,
    borderColor: '#422006',
    backgroundColor: '#854d0e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doorKnob: {
    width: 6,
    height: 6,
    backgroundColor: '#fde68a',
    borderWidth: 1,
    borderColor: '#713f12',
    position: 'absolute',
    right: 5,
    top: 34,
  },
  doorHint: {
    color: '#fef3c7',
    fontSize: 10,
    fontWeight: '700',
  },
  ground: {
    paddingTop: 8,
    paddingHorizontal: 10,
    paddingBottom: 18,
    borderTopWidth: 3,
    borderTopColor: '#14532d',
  },
  path: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  steppingStone: {
    width: 28,
    height: 12,
    backgroundColor: '#a8a29e',
    borderWidth: 1,
    borderColor: '#57534e',
    marginHorizontal: 8,
  },
  gardenRows: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gardenPlant: {
    width: '23%',
    minWidth: 76,
    backgroundColor: '#365314',
    borderWidth: 2,
    borderColor: '#14532d',
    marginBottom: 9,
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 6,
  },
  weedyTile: {
    borderColor: '#65a30d',
    backgroundColor: '#3f6212',
  },
  plantLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fefce8',
  },
  plantDate: {
    fontSize: 9,
    color: '#d9f99d',
    marginTop: 1,
  },
  deskSign: {
    marginTop: 8,
    alignSelf: 'flex-end',
    backgroundColor: '#854d0e',
    borderWidth: 2,
    borderColor: '#422006',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  signText: {
    color: '#fef3c7',
    fontSize: 11,
    fontWeight: '700',
  },
  petal: {
    position: 'absolute',
    borderWidth: 1,
  },
  center: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#78350f',
    shadowColor: '#fde68a',
  },
  leaf: {
    position: 'absolute',
    width: 7,
    height: 10,
    backgroundColor: '#22c55e',
    borderWidth: 1,
    borderColor: '#14532d',
  },
  weed: {
    position: 'absolute',
    width: 3,
    height: 14,
    backgroundColor: '#3f6212',
  },
  thorn: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#365314',
  },
  insideScroll: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  insideRoom: {
    backgroundColor: '#78350f',
    borderWidth: 3,
    borderColor: '#451a03',
    padding: 12,
    position: 'relative',
  },
  lamp: {
    width: 48,
    height: 18,
    alignSelf: 'center',
    backgroundColor: '#292524',
    borderWidth: 2,
    borderColor: '#0c0a09',
  },
  lampGlow: {
    position: 'absolute',
    top: 12,
    left: 7,
    width: 30,
    height: 26,
    backgroundColor: 'rgba(254, 240, 138, 0.34)',
    borderRadius: 4,
  },
  insideWindow: {
    width: 56,
    height: 44,
    borderWidth: 2,
    borderColor: '#292524',
    backgroundColor: '#1e3a8a',
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  shelfBoardTop: {
    marginTop: 8,
    height: 12,
    backgroundColor: '#a16207',
    borderWidth: 2,
    borderColor: '#451a03',
  },
  shelfSlots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  friendSlot: {
    width: '31%',
    minHeight: 216,
    backgroundColor: '#b45309',
    borderWidth: 2,
    borderColor: '#78350f',
    padding: 6,
    alignItems: 'center',
  },
  friendSlotSelected: {
    borderColor: '#fef08a',
    backgroundColor: '#c2410c',
  },
  friendName: {
    color: '#fef3c7',
    fontWeight: '800',
    fontSize: 12,
  },
  bouquetArea: {
    width: 74,
    height: 92,
    marginTop: 4,
    marginBottom: 2,
  },
  potRim: {
    width: 56,
    height: 10,
    backgroundColor: '#9a3412',
    borderWidth: 2,
    borderColor: '#431407',
  },
  potBody: {
    width: 46,
    height: 28,
    backgroundColor: '#b45309',
    borderWidth: 2,
    borderColor: '#7c2d12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  potPatternRow: {
    flexDirection: 'row',
  },
  potBase: {
    width: 30,
    height: 8,
    backgroundColor: '#7c2d12',
    borderWidth: 1,
    borderColor: '#431407',
  },
  shelfBoardBottom: {
    marginTop: 6,
    height: 12,
    backgroundColor: '#92400e',
    borderWidth: 2,
    borderColor: '#451a03',
  },
  prunePanel: {
    marginTop: 12,
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: '#78350f',
    padding: 10,
    alignItems: 'center',
  },
  pruneTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#7c2d12',
  },
  pruneHint: {
    color: '#92400e',
    fontSize: 11,
    marginBottom: 6,
  },
  prunePreview: {
    width: 104,
    height: 110,
    marginBottom: 4,
  },
  pruneSpark: {
    position: 'absolute',
    top: 54,
    right: 34,
    width: 36,
    height: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pruneButton: {
    width: '100%',
    backgroundColor: '#16a34a',
    borderWidth: 2,
    borderColor: '#14532d',
    paddingVertical: 8,
    alignItems: 'center',
  },
  pruneButtonText: {
    color: '#f0fdf4',
    fontWeight: '800',
    fontSize: 13,
  },
  pruneMessage: {
    marginTop: 8,
    color: '#166534',
    fontWeight: '800',
    fontSize: 12,
  },
  insideDoor: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#92400e',
    borderWidth: 2,
    borderColor: '#451a03',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  insideDoorText: {
    color: '#fef3c7',
    fontWeight: '700',
    fontSize: 11,
  },
  insideDesk: {
    marginTop: 8,
    alignSelf: 'flex-end',
    backgroundColor: '#854d0e',
    borderWidth: 2,
    borderColor: '#451a03',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  insideDeskText: {
    color: '#fef3c7',
    fontWeight: '700',
    fontSize: 11,
  },
  creatorScroll: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  deskRoom: {
    backgroundColor: '#8b5a2b',
    borderWidth: 3,
    borderColor: '#422006',
    padding: 12,
  },
  tableTop: {
    height: 18,
    backgroundColor: '#a16207',
    borderWidth: 2,
    borderColor: '#451a03',
  },
  tableLegRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tableLeg: {
    width: 16,
    height: 16,
    backgroundColor: '#78350f',
    borderWidth: 2,
    borderColor: '#451a03',
  },
  creatorHeading: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '800',
    color: '#fef3c7',
  },
  shapeCard: {
    width: 92,
    backgroundColor: '#b45309',
    borderWidth: 2,
    borderColor: '#78350f',
    marginRight: 8,
    alignItems: 'center',
    paddingVertical: 6,
  },
  shapeCardSelected: {
    borderColor: '#fef08a',
    backgroundColor: '#c2410c',
  },
  shapeLabel: {
    color: '#fef3c7',
    fontSize: 11,
    fontWeight: '700',
    marginTop: -4,
  },
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorChip: {
    width: 28,
    height: 28,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#f8fafc',
  },
  colorChipSelected: {
    borderColor: '#111827',
    transform: [{ scale: 1.08 }],
  },
  previewCard: {
    marginTop: 4,
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: '#92400e',
    padding: 8,
    alignItems: 'center',
  },
  previewTitle: {
    color: '#7c2d12',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  journalInput: {
    minHeight: 98,
    backgroundColor: '#fefce8',
    borderWidth: 2,
    borderColor: '#92400e',
    color: '#431407',
    padding: 8,
    textAlignVertical: 'top',
    fontSize: 12,
  },
  paintToolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolButton: {
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: '#92400e',
    marginRight: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  toolButtonActive: {
    backgroundColor: '#fde68a',
  },
  toolButtonText: {
    color: '#7c2d12',
    fontWeight: '700',
    fontSize: 11,
  },
  gridWrap: {
    borderWidth: 3,
    borderColor: '#78350f',
    backgroundColor: '#d1d5db',
    alignSelf: 'flex-start',
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCell: {
    width: 10,
    height: 10,
    borderWidth: 0.4,
    borderColor: '#9ca3af',
  },
  creatorNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  creatorNavButton: {
    width: '48%',
    backgroundColor: '#92400e',
    borderWidth: 2,
    borderColor: '#451a03',
    alignItems: 'center',
    paddingVertical: 7,
  },
  creatorNavText: {
    color: '#fef3c7',
    fontWeight: '700',
    fontSize: 12,
  },
  fallbackNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 10,
    paddingTop: 6,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
  },
  fallbackChip: {
    marginHorizontal: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  fallbackChipActive: {
    backgroundColor: 'rgba(250, 204, 21, 0.7)',
    borderColor: '#422006',
  },
  fallbackChipText: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 11,
  },
  reflectionBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  journalModal: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#fef3c7',
    borderWidth: 3,
    borderColor: '#92400e',
    padding: 14,
  },
  journalTitle: {
    color: '#7c2d12',
    fontSize: 18,
    fontWeight: '800',
  },
  journalMeta: {
    marginTop: 2,
    color: '#92400e',
    fontSize: 11,
    fontWeight: '700',
  },
  journalMood: {
    marginTop: 6,
    color: '#78350f',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  journalEntry: {
    marginTop: 6,
    color: '#451a03',
    fontSize: 13,
    lineHeight: 18,
  },
  reflectionFlowerWrap: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 68,
  },
  reflectionActions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeButton: {
    flex: 1,
    marginRight: 7,
    backgroundColor: '#a8a29e',
    borderWidth: 2,
    borderColor: '#57534e',
    paddingVertical: 7,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 12,
  },
  trimButton: {
    flex: 1,
    marginLeft: 7,
    backgroundColor: '#16a34a',
    borderWidth: 2,
    borderColor: '#14532d',
    paddingVertical: 7,
    alignItems: 'center',
  },
  trimButtonText: {
    color: '#f0fdf4',
    fontWeight: '800',
    fontSize: 12,
  },
  trimDone: {
    flex: 1,
    marginLeft: 7,
    backgroundColor: '#84cc16',
    borderWidth: 2,
    borderColor: '#3f6212',
    paddingVertical: 7,
    alignItems: 'center',
  },
  trimDoneText: {
    color: '#365314',
    fontWeight: '800',
    fontSize: 12,
  },
});
