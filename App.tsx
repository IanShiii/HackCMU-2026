import 'react-native-reanimated';

import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { flowerColors, flowerShapes, useBloomStore } from './src/store/useBloomStore';

type ViewMode = 'outside' | 'inside' | 'checkin';

const tabLabels: { key: ViewMode; label: string }[] = [
  { key: 'outside', label: 'Outside' },
  { key: 'inside', label: 'Inside' },
  { key: 'checkin', label: 'Mood Creator' },
];

function FlowerSprite({ color, weedy, glow }: { color: string; weedy?: boolean; glow?: boolean }) {
  return (
    <View className="items-center">
      <View style={[styles.stem]} />
      <View
        style={[
          styles.flower,
          {
            backgroundColor: color,
            shadowOpacity: glow ? 0.8 : 0,
            shadowRadius: glow ? 8 : 0,
          },
        ]}
      />
      {weedy ? (
        <>
          <View style={[styles.vine, { transform: [{ rotate: '-25deg' }] }]} />
          <View style={[styles.vine, { transform: [{ rotate: '25deg' }] }]} />
        </>
      ) : null}
    </View>
  );
}

export default function App() {
  const [mode, setMode] = useState<ViewMode>('outside');
  const [now, setNow] = useState(new Date());

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

  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(friends[0]?.id ?? null);

  const trimScale = useSharedValue(1);
  const trimWeedOpacity = useSharedValue(1);
  const sparkPulse = useSharedValue(0);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const isDay = now.getHours() >= 6 && now.getHours() < 18;
  const bgColor = isDay ? '#bfdbfe' : '#312e81';

  const selectedHistory = history.find((flower) => flower.id === selectedHistoryId);
  const selectedFriend = friends.find((friend) => friend.id === selectedFriendId) ?? friends[0];
  const selectedColorIndex = Math.max(1, flowerColors.indexOf(selectedColor) + 1);

  const trimFlowerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: trimScale.value }],
  }));

  const weedStyle = useAnimatedStyle(() => ({
    opacity: trimWeedOpacity.value,
  }));

  const sparkStyle = useAnimatedStyle(() => ({
    opacity: sparkPulse.value,
    transform: [{ scale: 0.7 + sparkPulse.value * 0.6 }],
  }));

  const greeting = useMemo(() => {
    if (isDay) {
      return 'A soft morning breeze rustles the petals.';
    }
    return 'Lantern light makes the village glow tonight.';
  }, [isDay]);

  const onTrimWeeds = () => {
    if (!selectedHistory) {
      return;
    }

    trimScale.value = withSequence(withTiming(1.18, { duration: 130 }), withSpring(1));
    trimWeedOpacity.value = withTiming(0, { duration: 220 });

    setTimeout(() => {
      trimWeeds(selectedHistory.id);
      setSelectedHistoryId(null);
      trimScale.value = 1;
      trimWeedOpacity.value = 1;
    }, 230);
  };

  const onPruneVase = async () => {
    sparkPulse.value = 1;
    sparkPulse.value = withTiming(0, { duration: 550 });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Notification sent!');
  };

  return (
    <View style={[styles.screen, { backgroundColor: bgColor }]} className="pt-14">
      <StatusBar style={isDay ? 'dark' : 'light'} />

      <View className="px-4 pb-2">
        <Text className="text-center text-xl font-bold text-stone-900">Bloom Village</Text>
        <Text className="mt-1 text-center text-xs text-stone-700">{greeting}</Text>
      </View>

      <View className="mx-4 mb-3 flex-row rounded-2xl bg-black/10 p-1">
        {tabLabels.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setMode(tab.key)}
            className={`flex-1 rounded-xl px-2 py-2 ${mode === tab.key ? 'bg-white/80' : 'bg-transparent'}`}
          >
            <Text className="text-center text-xs font-semibold text-stone-800">{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      {mode === 'outside' ? (
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 18 }}>
          <Text className="mb-2 text-sm font-semibold text-stone-800">Outside Garden • Last 14 Days</Text>
          <View className="flex-row flex-wrap justify-between rounded-2xl border border-stone-700/30 bg-green-900/25 p-3">
            {history.map((flower, index) => {
              const weedy = flower.mood === 'negative' && !flower.trimmed;
              const glow = flower.mood === 'positive';
              return (
                <Pressable
                  key={flower.id}
                  onPress={() => weedy && setSelectedHistoryId(flower.id)}
                  className={`mb-3 h-24 w-[13%] min-w-[44px] items-center justify-end rounded-lg border ${
                    weedy ? 'border-emerald-800 bg-emerald-200/60' : 'border-stone-500/50 bg-stone-100/55'
                  }`}
                >
                  <FlowerSprite color={flowerColors[index % flowerColors.length]} weedy={weedy} glow={glow} />
                  <Text className="pt-1 text-[9px] text-stone-700">{flower.dayLabel}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text className="mt-3 text-xs text-stone-800">
            Tap only the weedy flowers to open reflection and trim overgrowth.
          </Text>
        </ScrollView>
      ) : null}

      {mode === 'inside' ? (
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 18 }}>
          <Text className="mb-2 text-sm font-semibold text-stone-800">Inside Cottage • Friends Shelf</Text>
          <View className="rounded-2xl border border-amber-900/50 bg-amber-900/35 p-3">
            <View className="h-3 rounded bg-amber-800/90" />
            <View className="mt-2 flex-row justify-between">
              {friends.map((friend) => (
                <Pressable
                  key={friend.id}
                  onPress={() => setSelectedFriendId(friend.id)}
                  className={`h-32 w-[31%] rounded-lg border p-2 ${
                    selectedFriendId === friend.id ? 'border-amber-100 bg-amber-100/35' : 'border-amber-200/50 bg-amber-200/20'
                  }`}
                >
                  <Text className="text-center text-xs font-semibold text-stone-900">{friend.name}</Text>
                  <View className="mt-2 flex-1 items-center justify-end">
                    <View className="h-16 w-16">
                      {friend.flowers.map((flower, i) => (
                        <View
                          key={flower.id}
                          style={{
                            position: 'absolute',
                            bottom: i * 6,
                            left: i * 9,
                          }}
                        >
                          <FlowerSprite color={flower.color} glow={i === 2} />
                        </View>
                      ))}
                    </View>
                    <View className="mt-1 h-5 w-14 flex-row flex-wrap overflow-hidden rounded border border-stone-600 bg-stone-300">
                      {friend.potPixels.slice(0, 4).map((row, rowIndex) =>
                        row.slice(0, 8).map((pixel, colIndex) => (
                          <View
                            key={`${friend.id}-${rowIndex}-${colIndex}`}
                            style={{
                              width: 3,
                              height: 3,
                              backgroundColor: pixel === 0 ? '#cbd5e1' : flowerColors[(pixel - 1) % flowerColors.length],
                            }}
                          />
                        )),
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mt-4 rounded-2xl border border-stone-700/25 bg-white/65 p-3">
            <Text className="text-sm font-semibold text-stone-900">{selectedFriend?.name}&apos;s Vase</Text>
            <Text className="text-xs text-stone-700">Send a caring check-in with a magical prune.</Text>
            <View className="mt-3 h-14 items-center justify-center">
              <Animated.View style={[styles.sparkContainer, sparkStyle]}>
                <View style={[styles.spark, { top: 0, left: 18 }]} />
                <View style={[styles.spark, { top: 12, left: 0 }]} />
                <View style={[styles.spark, { top: 12, right: 0 }]} />
                <View style={[styles.spark, { bottom: 0, left: 18 }]} />
              </Animated.View>
            </View>
            <Pressable onPress={onPruneVase} className="mt-1 rounded-xl bg-emerald-600 px-4 py-2">
              <Text className="text-center text-sm font-semibold text-white">Prune Vase</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : null}

      {mode === 'checkin' ? (
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 18 }}>
          <Text className="mb-2 text-sm font-semibold text-stone-800">Daily Mood Creator</Text>

          <View className="rounded-2xl border border-stone-700/25 bg-white/65 p-3">
            <Text className="text-xs font-semibold text-stone-800">Flower Shape</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
              {flowerShapes.map((shape) => (
                <Pressable
                  key={shape}
                  onPress={() => setSelectedShape(shape)}
                  className={`mr-2 rounded-full border px-3 py-2 ${
                    selectedShape === shape ? 'border-indigo-700 bg-indigo-100' : 'border-stone-400 bg-stone-100'
                  }`}
                >
                  <Text className="text-xs font-semibold text-stone-800">{shape}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text className="mt-4 text-xs font-semibold text-stone-800">Flower Color</Text>
            <View className="mt-2 flex-row flex-wrap">
              {flowerColors.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[styles.colorDot, { backgroundColor: color }]}
                  className={`mr-2 mt-2 border-2 ${selectedColor === color ? 'border-black' : 'border-white'}`}
                />
              ))}
            </View>

            <Text className="mt-4 text-xs font-semibold text-stone-800">Private Journal</Text>
            <TextInput
              value={journalEntry}
              onChangeText={setJournalEntry}
              placeholder="Today I felt..."
              placeholderTextColor="#57534e"
              multiline
              className="mt-2 min-h-24 rounded-xl border border-stone-400 bg-stone-100 px-3 py-2 text-sm text-stone-900"
            />
          </View>

          <View className="mt-4 rounded-2xl border border-stone-700/25 bg-white/65 p-3">
            <Text className="text-xs font-semibold text-stone-800">Paint Your Pot (20x20)</Text>
            <View className="mt-2 self-start rounded border border-stone-400">
              {potGrid.map((row, y) => (
                <View key={`row-${y}`} className="flex-row">
                  {row.map((pixel, x) => (
                    <Pressable
                      key={`pixel-${x}-${y}`}
                      onPress={() => paintPotPixel(x, y, selectedColorIndex)}
                      style={[
                        styles.pixel,
                        {
                          backgroundColor: pixel === 0 ? '#e2e8f0' : flowerColors[(pixel - 1) % flowerColors.length],
                        },
                      ]}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : null}

      <Modal transparent visible={Boolean(selectedHistory)} animationType="fade" onRequestClose={() => setSelectedHistoryId(null)}>
        <View className="flex-1 items-center justify-center bg-black/45 px-6">
          <View className="w-full rounded-2xl bg-stone-100 p-4">
            <Text className="text-base font-bold text-stone-900">Reflection</Text>
            <Text className="mt-2 text-sm text-stone-700">{selectedHistory?.entry}</Text>
            <Animated.View style={[trimFlowerStyle]} className="mt-4 items-center">
              <Animated.View style={weedStyle}>
                <FlowerSprite color="#f97316" weedy />
              </Animated.View>
            </Animated.View>
            <View className="mt-4 flex-row gap-2">
              <Pressable onPress={() => setSelectedHistoryId(null)} className="flex-1 rounded-lg bg-stone-400 px-3 py-2">
                <Text className="text-center text-sm font-semibold text-white">Close</Text>
              </Pressable>
              <Pressable onPress={onTrimWeeds} className="flex-1 rounded-lg bg-emerald-600 px-3 py-2">
                <Text className="text-center text-sm font-semibold text-white">Trim Weeds</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flower: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#1f2937',
    shadowColor: '#fde68a',
  },
  stem: {
    width: 4,
    height: 18,
    backgroundColor: '#14532d',
    borderRadius: 2,
    marginBottom: 2,
  },
  vine: {
    position: 'absolute',
    bottom: 10,
    width: 3,
    height: 12,
    backgroundColor: '#166534',
  },
  sparkContainer: {
    width: 40,
    height: 40,
    position: 'relative',
  },
  spark: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#facc15',
    borderRadius: 1,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 99,
  },
  pixel: {
    width: 9,
    height: 9,
    borderWidth: 0.3,
    borderColor: '#94a3b8',
  },
});
