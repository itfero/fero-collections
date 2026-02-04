import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Switch,
  TextInput,
  Pressable,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { getMainTopics, getSubTopicsByMainTopic, createSubTopic, updateSubTopic } from '../../../lib/api';

type SubTopicItem = {
  id: string | number;
  title: string;
  mainTopicName?: string;
  sortOrder?: number;
  delStatus?: boolean;
  active?: boolean;
};

type MainTopicItem = {
  id: string | number;
  name: string;
};

export default function SubTopicScreen() {
  const [loading, setLoading] = useState(false);
  const [mainTopics, setMainTopics] = useState<MainTopicItem[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | number | null>(null);

  const [subTopicName, setSubTopicName] = useState('');
  const [subTopics, setSubTopics] = useState<SubTopicItem[]>([]);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  useEffect(() => {
    loadMainTopics();
  }, []);

  async function loadMainTopics() {
    try {
      setLoading(true);
      console.log('[API] Loading main topics for sub-topic screen...');

      const topics = await getMainTopics();
      console.log('[API] Loaded main topics:', topics.length);
      setMainTopics(topics);

      if (topics.length > 0) {
        setSelectedTopicId(topics[0].id);
      }
    } catch (e) {
      console.error('[API] Failed to load main topics:', e);
      Alert.alert('Error', 'Failed to load main topics');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedTopicId) {
      loadSubTopics();
    }
  }, [selectedTopicId]);

  async function loadSubTopics() {
    try {
      console.log('[API] Loading sub-topics for main topic:', selectedTopicId);
      const subTopicsList = await getSubTopicsByMainTopic(selectedTopicId!);
      console.log('[API] Loaded sub-topics:', subTopicsList.length);
      
      setSubTopics(
        subTopicsList.map(st => {
          // Get the main topic name for this specific sub-topic using its mainTopicId
          const subTopicMainTopicId = (st as any).mainTopicId ?? selectedTopicId;
          const mainTopicName = mainTopics.find(t => t.id === subTopicMainTopicId)?.name ?? '';
          
          return {
            id: st.id,
            title: (st as any).name ?? (st as any).title ?? String(st.id),
            mainTopicName,
            sortOrder: (st as any).sortOrder,
            delStatus: (st as any).delStatus,
            active: true,
          };
        })
      );
    } catch (e) {
      console.error('[API] Failed to load sub-topics:', e);
      setSubTopics([]);
      setLoading(false);
    }
  }

  /* ---------------- SAVE SUB TOPIC ---------------- */

  const saveSubTopic = async () => {
    if (!selectedTopicId || !subTopicName.trim()) {
      Alert.alert('Validation', 'Select main topic and enter sub topic name');
      return;
    }

    const name = subTopicName.trim();

    try {
      if (editingId) {
        console.log('[API] Updating sub-topic:', editingId, name);
          await updateSubTopic({ id: editingId, name: name, mainTopicId: selectedTopicId });
        console.log('[API] Sub-topic updated');
      } else {
        console.log('[API] Creating sub-topic:', name, 'for main topic:', selectedTopicId);
        // determine next sortOrder
        const maxSort = subTopics.reduce((m, s) => Math.max(m, s.sortOrder ?? 0), 0);
          await createSubTopic({ name: name, mainTopicId: selectedTopicId, sortOrder: maxSort + 1 });
        console.log('[API] Sub-topic created');
      }

      setSubTopicName('');
      setEditingId(null);
      await loadSubTopics();
    } catch (e) {
      console.error('[API] Create sub-topic failed:', e);
      Alert.alert('Error', 'Failed to create sub-topic');
    }
  };

  /* ---------------- TOGGLE ACTIVE ---------------- */

  const toggleStatus = async (subId: string | number) => {
    if (!selectedTopicId) return;

    const item = subTopics.find(i => i.id === subId);
    if (!item) return;

    const next = !item.active;

    // optimistic
    setSubTopics(prev =>
      prev.map(st => (st.id === subId ? { ...st, active: next } : st))
    );

    try {
      console.log('[API] Toggling sub-topic status:', subId, 'to:', next);
      // TODO: Call toggle endpoint when available
      console.log('[API] Sub-topic status updated:', subId);
    } catch (e) {
      console.error('[API] Failed to update sub-topic status:', e);
      // rollback
      setSubTopics(prev =>
        prev.map(st => (st.id === subId ? { ...st, active: !next } : st))
      );
      Alert.alert('Error', 'Failed to update sub-topic status');
    }
  };

  /* ---------------- MOVE UP/DOWN ---------------- */

  const handleMoveUp = async (subId: string | number) => {
    const index = subTopics.findIndex(i => i.id === subId);
    if (index <= 0) return;

    const current = subTopics[index];
    const above = subTopics[index - 1];

    const tempSort = current.sortOrder ?? 0;
    const newTopics = [...subTopics];
    newTopics[index].sortOrder = above.sortOrder ?? 0;
    newTopics[index - 1].sortOrder = tempSort;

    setSubTopics(newTopics);

    try {
      console.log('[API] Moving sub-topic up:', subId);
      await Promise.all([
        updateSubTopic({ id: current.id, sortOrder: newTopics[index].sortOrder }),
        updateSubTopic({ id: above.id, sortOrder: newTopics[index - 1].sortOrder }),
      ]);
      console.log('[API] Sub-topic moved up');
    } catch (e) {
      console.error('[API] Move up failed:', e);
      setSubTopics(subTopics);
    }
  };

  const handleMoveDown = async (subId: string | number) => {
    const index = subTopics.findIndex(i => i.id === subId);
    if (index >= subTopics.length - 1) return;

    const current = subTopics[index];
    const below = subTopics[index + 1];

    const tempSort = current.sortOrder ?? 0;
    const newTopics = [...subTopics];
    newTopics[index].sortOrder = below.sortOrder ?? 0;
    newTopics[index + 1].sortOrder = tempSort;

    setSubTopics(newTopics);

    try {
      console.log('[API] Moving sub-topic down:', subId);
      await Promise.all([
        updateSubTopic({ id: current.id, sortOrder: newTopics[index].sortOrder }),
        updateSubTopic({ id: below.id, sortOrder: newTopics[index + 1].sortOrder }),
      ]);
      console.log('[API] Sub-topic moved down');
    } catch (e) {
      console.error('[API] Move down failed:', e);
      setSubTopics(subTopics);
    }
  };

  const handleDeleteSubTopic = async (subId: string | number) => {
    try {
      console.log('[API] Soft deleting sub-topic:', subId);
      // soft delete via update
      await updateSubTopic({ id: subId, delStatus: true });
      console.log('[API] Sub-topic soft deleted:', subId);
      await loadSubTopics();
    } catch (e) {
      console.error('[API] Soft delete failed:', e);
      Alert.alert('Error', 'Failed to delete sub-topic');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Topic Picker */}
      <Text style={styles.label}>Main Topic</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={selectedTopicId} onValueChange={(value) => setSelectedTopicId(value)}>
          <Picker.Item label="-- Select Main Topic --" value={null} />
          {mainTopics.map(t => (
            <Picker.Item key={t.id} label={String(t.name)} value={t.id} />
          ))}
        </Picker>
      </View>

      {/* Sub Topic Input */}
      <Text style={styles.label}>Add Sub Topic</Text>
      <View style={styles.row}>
        <TextInput
          value={subTopicName}
          onChangeText={setSubTopicName}
          placeholder="Enter sub topic name"
          style={styles.input}
        />
        <Pressable style={styles.saveBtn} onPress={saveSubTopic}>
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>

      {/* List */}
      <Text style={styles.label}>Sub Topics</Text>

      {subTopics.length === 0 ? (
        <Text style={styles.empty}>No sub topics</Text>
      ) : (
        <FlatList
          data={subTopics}
          keyExtractor={i => String(i.id)}
          renderItem={({ item, index }) => {
            const canMoveUp = index > 0;
            const canMoveDown = index < subTopics.length - 1;
            return (
              <View style={styles.card}>
                <Pressable style={{ flex: 1 }} onPress={() => { setEditingId(item.id); setSubTopicName(String(item.title)); }}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>Main Topic: {item.mainTopicName}</Text>
                  <Text style={styles.cardMeta}>id: {item.id} • sort: {item.sortOrder ?? 0}</Text>
                  <Text
                    style={[
                      styles.status,
                      { color: item.active ? '#2ecc71' : '#e74c3c' },
                    ]}
                  >
                    {item.active ? 'ACTIVE' : 'INACTIVE'}
                  </Text>
                  </Pressable>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => handleMoveUp(item.id)}
                    disabled={!canMoveUp}
                    style={[styles.actionIcon, !canMoveUp && styles.actionIconDisabled]}
                  >
                    <MaterialIcons name="arrow-upward" size={18} color={canMoveUp ? '#666' : '#ccc'} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleMoveDown(item.id)}
                    disabled={!canMoveDown}
                    style={[styles.actionIcon, !canMoveDown && styles.actionIconDisabled]}
                  >
                    <MaterialIcons name="arrow-downward" size={18} color={canMoveDown ? '#666' : '#ccc'} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeleteSubTopic(item.id)}
                    style={styles.actionIcon}
                  >
                    <MaterialIcons name="delete" size={18} color="#e53935" />
                  </TouchableOpacity>

                  <Switch
                    value={item.active ?? true}
                    onValueChange={() => toggleStatus(item.id)}
                  />
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  pickerWrapper: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
  },
  saveBtn: {
    backgroundColor: '#0c4ef4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveText: { color: '#fff', fontWeight: '700' },
  empty: { marginTop: 20, color: '#999', textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#f7f7f7',
    marginTop: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSubtitle: { fontSize: 13, color: '#666', marginTop: 4, fontStyle: 'italic' },
  cardMeta: { fontSize: 11, color: '#999', marginTop: 4 },
  status: { marginTop: 4, fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  actionIcon: { padding: 6, borderRadius: 6 },
  actionIconDisabled: { opacity: 0.5 },
});
