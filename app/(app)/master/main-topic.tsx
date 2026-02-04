import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Platform,
  Modal,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { brochureData as localData, Topic as LocalTopic } from '../../../data/brochureData';
import { MaterialIcons } from '@expo/vector-icons';
import { getMainTopics, createMainTopic, updateMainTopic, deleteMainTopic } from '../../../lib/api';

/**
 * This screen now:
 * - Fetches rows from API (using lib/api)
 * - Converts rows to Topic[] using your SUB_TITLE_ID -> { title, images } mapping
 * - Falls back to local brochureData if API fails
 * - Keeps inline edit / create / pagination / search behavior as before
 */

const PAGE_SIZE = 5;

type TopicItem = {
  id: string;
  title: string;
  sortOrder?: number;
  delStatus?: boolean;
  subtopics: { id: string; title: string; images: string[] }[];
  images: string[];
};

export default function MainTopicScreen() {
  const router = useRouter();

  // Local create input
  const [topicName, setTopicName] = useState('');

  // Table state
  const [search, setSearch] = useState('');
  const [hasImagesFilter, setHasImagesFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE);

  const [items, setItems] = useState<TopicItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const inlineInputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    // fetch remote rows then map to topics
    let mounted = true;
    (async () => {
      try {
        console.log('Loading main topics via REST /main-topic...');
        const topics = await getMainTopics();
        if (!mounted) return;
        const prepared: TopicItem[] = topics.map(t => ({
          id: String(t.id),
          title: t.name,
          sortOrder: t.sortOrder ?? 0,
          delStatus: t.delStatus ?? false,
          subtopics: [],
          images: [],
        }));
        console.log('Successfully loaded main topics:', prepared.length);
        setItems(prepared);
      } catch (err) {
        console.warn('REST API failed, falling back to local data:', err);
        const fallback = (localData as LocalTopic[]).map(ld => ({
          id: ld.id,
          title: ld.title,
          sortOrder: 0,
          delStatus: false,
          subtopics: ld.subtopics.map(s => ({
            id: s.id,
            title: s.title,
            images: (s.images || []).map(img => (typeof img === 'string' ? img : (img as any).uri ?? String(img)))
          })),
          images: (ld.images || []).map(img => (typeof img === 'string' ? img : (img as any).uri ?? String(img))),
        }));
        setItems(fallback);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (editingId && inlineInputRef.current) inlineInputRef.current.focus();
  }, [editingId]);

  // filtering & pagination (same as before)
  const filtered = useMemo(() => {
    let list = items.slice();
    if (hasImagesFilter) {
      list = list.filter(t => Array.isArray(t.images) && t.images.length > 0);
    }
    if (search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q));
    }
    return list;
  }, [items, search, hasImagesFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  // handlers (create/edit persist locally only; adapt to API calls if needed)
  // const handleSaveTopic = () => {
  //   const name = topicName.trim();
  //   if (!name) return;
  //   const newTopic: TopicItem = { id: `${Date.now()}`, title: name, subtopics: [], images: [] };
  //   setItems(prev => [newTopic, ...prev]);
  //   setTopicName('');
  //   setCurrentPage(1);
  // };
  const handleSaveTopic = async () => {
    const name = topicName.trim();
    if (!name) return;
    try {
      console.log('Creating main topic via /main-topic:', name);
      const maxSort = items.length > 0 ? Math.max(...items.map(i => i.sortOrder ?? 0)) : 0;
      const created: any = await createMainTopic({ name, sortOrder: maxSort + 1, delStatus: false });
      const newId = String(created?.id ?? Date.now());

      const newTopic: TopicItem = {
        id: newId,
        title: created?.name ?? name,
        sortOrder: created?.sortOrder ?? maxSort + 1,
        delStatus: created?.delStatus ?? false,
        subtopics: [],
        images: [],
      };

      setItems(prev => [newTopic, ...prev]);
      setTopicName('');
      setCurrentPage(1);
      console.log('Main topic created:', newId);
    } catch (err) {
      console.warn('Create main topic failed, using local fallback:', err);
      const localId = `local-${Date.now()}`;
      const maxSort = items.length > 0 ? Math.max(...items.map(i => i.sortOrder ?? 0)) : 0;
      setItems(prev => [
        { id: localId, title: name, sortOrder: maxSort + 1, delStatus: false, subtopics: [], images: [] },
        ...prev,
      ]);
    }
  };
  const handleUpdateTopic = async (id: string, name: string) => {
    const title = name.trim();
    if (!title) return;

    try {
      console.log('Updating main topic via /main-topic/:id', id, title);
      const item = items.find(t => t.id === id);
      const updated: any = await updateMainTopic({ name: title, id, sortOrder: item?.sortOrder, delStatus: item?.delStatus });

      setItems(prev => prev.map(t => (t.id === String(id) ? { ...t, title: updated?.name ?? title } : t)));
      console.log('Main topic updated:', id);

    } catch (err) {
      console.warn('Update failed, local update only:', err);

      // fallback local update
      setItems(prev =>
        prev.map(t => (t.id === id ? { ...t, title } : t))
      );
    } finally {
      setEditingId(null);
      setEditingName('');
      Keyboard.dismiss();
    }
  };

  const handleMoveUp = async (id: string) => {
    const index = items.findIndex(t => t.id === id);
    if (index <= 0) return;

    const current = items[index];
    const above = items[index - 1];

    // Swap sortOrder
    const tempSort = current.sortOrder ?? 0;
    const newItems = [...items];
    newItems[index].sortOrder = above.sortOrder ?? 0;
    newItems[index - 1].sortOrder = tempSort;

    setItems(newItems);

    // Persist both changes
    try {
      console.log('[API] Moving topic up:', id);
      await Promise.all([
        updateMainTopic({ name: current.title, id, sortOrder: newItems[index].sortOrder, delStatus: current.delStatus }),
        updateMainTopic({ name: above.title, id: above.id, sortOrder: newItems[index - 1].sortOrder, delStatus: above.delStatus }),
      ]);
    } catch (err) {
      console.warn('Move up failed:', err);
      // Revert on error
      setItems(items);
    }
  };

  const handleMoveDown = async (id: string) => {
    const index = items.findIndex(t => t.id === id);
    if (index >= items.length - 1) return;

    const current = items[index];
    const below = items[index + 1];

    // Swap sortOrder
    const tempSort = current.sortOrder ?? 0;
    const newItems = [...items];
    newItems[index].sortOrder = below.sortOrder ?? 0;
    newItems[index + 1].sortOrder = tempSort;

    setItems(newItems);

    // Persist both changes
    try {
      console.log('[API] Moving topic down:', id);
      await Promise.all([
        updateMainTopic({ name: current.title, id, sortOrder: newItems[index].sortOrder, delStatus: current.delStatus }),
        updateMainTopic({ name: below.title, id: below.id, sortOrder: newItems[index + 1].sortOrder, delStatus: below.delStatus }),
      ]);
    } catch (err) {
      console.warn('Move down failed:', err);
      // Revert on error
      setItems(items);
    }
  };

  // const saveInlineEdit = () => {
  //   if (!editingId) return;
  //   const name = editingName.trim();
  //   if (!name) return;
  //   setItems(prev => prev.map(p => (p.id === editingId ? { ...p, title: name } : p)));
  //   setEditingId(null);
  //   setEditingName('');
  //   Keyboard.dismiss();
  // };
  const saveInlineEdit = () => {
    if (!editingId) return;
    handleUpdateTopic(editingId, editingName);
  };

  const handleDeleteTopic = async (id: string) => {
    try {
      console.log('Soft deleting main topic via /main-topic/:id', id);
      const item = items.find(t => t.id === id);
      if (!item) return;

      await updateMainTopic({ 
        name: item.title, 
        id, 
        sortOrder: item.sortOrder, 
        delStatus: true 
      });

      // Remove from UI
      setItems(prev => prev.filter(t => t.id !== id));
      console.log('Main topic soft deleted:', id);

    } catch (err) {
      console.warn('Soft delete failed:', err);

      // fallback local remove
      setItems(prev => prev.filter(t => t.id !== id));
    }
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
    setEditingName('');
    Keyboard.dismiss();
  };

  const openInlineEdit = (t: TopicItem) => {
    setEditingId(t.id);
    setEditingName(t.title);
  };

  const handleRowPress = (t: TopicItem) => {
    // example: navigate to topic slider using id
    router.push({ pathname: '/topic/[id]', params: { id: t.id } } as any);
  };

  const renderRow = ({ item, index }: { item: TopicItem; index: number }) => {
    const isEditing = editingId === item.id;
    const canMoveUp = index > 0;
    const canMoveDown = index < paginated.length - 1;

    return (
      <View style={styles.rowContainer}>
        <View style={styles.rowInner}>
          <Pressable style={styles.row} onPress={() => !isEditing && handleRowPress(item)}>
            <View style={styles.cellLeft}>
              {isEditing ? (
                <TextInput
                  ref={inlineInputRef}
                  value={editingName}
                  onChangeText={setEditingName}
                  placeholder="Topic title"
                  placeholderTextColor="#888"
                  onSubmitEditing={saveInlineEdit}
                  returnKeyType="done"
                  style={[styles.inlineInput, { color: '#222' }]}
                />
              ) : (
                <Text style={styles.title}>{item.title}</Text>
              )}
              <Text style={styles.meta}>
                id: {item.id} • sort: {item.sortOrder ?? 0} • subtopics: {item.subtopics?.length ?? 0}
              </Text>
            </View>

            <View style={styles.cellRight}>
              <Text style={styles.badge}>
                {item.images?.length ? `${item.images.length} imgs` : 'no imgs'}
              </Text>
              {!isEditing && <MaterialIcons name="chevron-right" size={22} color="#666" />}
            </View>
          </Pressable>

          <View style={styles.rowActions}>
            {isEditing ? (
              <>
                <TouchableOpacity onPress={saveInlineEdit} style={styles.actionBtn}>
                  <MaterialIcons name="check" size={20} color="#0c4ef4" />
                </TouchableOpacity>
                <TouchableOpacity onPress={cancelInlineEdit} style={[styles.actionBtn, { marginLeft: 8 }]}>
                  <MaterialIcons name="close" size={20} color="#999" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={() => openInlineEdit(item)} style={styles.iconBtn}>
                  <MaterialIcons name="edit" size={20} color="#0c4ef4" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleMoveUp(item.id)}
                  disabled={!canMoveUp}
                  style={[styles.iconBtn, !canMoveUp && styles.iconBtnDisabled]}
                >
                  <MaterialIcons name="arrow-upward" size={20} color={canMoveUp ? '#666' : '#ccc'} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleMoveDown(item.id)}
                  disabled={!canMoveDown}
                  style={[styles.iconBtn, !canMoveDown && styles.iconBtnDisabled]}
                >
                  <MaterialIcons name="arrow-downward" size={20} color={canMoveDown ? '#666' : '#ccc'} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDeleteTopic(item.id)}
                  style={styles.iconBtn}
                >
                  <MaterialIcons name="delete" size={20} color="#e53935" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* create input */}
      <View style={styles.form}>
        <Text style={styles.label}>Topic Name</Text>
        <View style={styles.rowInput}>
          <TextInput
            value={topicName}
            onChangeText={setTopicName}
            placeholder="Enter topic name..."
            placeholderTextColor="#888"
            style={[styles.input, { color: '#222' }]}
            returnKeyType="done"
          />
          <Pressable style={styles.saveBtn} onPress={handleSaveTopic}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>
      </View>

      {/* controls */}
      <View style={styles.controls}>
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            value={search}
            onChangeText={text => {
              setSearch(text);
              setCurrentPage(1);
            }}
            placeholder="Search topics..."
            placeholderTextColor="#888"
            style={[styles.searchInput, { color: '#222' }]}
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <Pressable onPress={() => { setSearch(''); setCurrentPage(1); }} style={styles.clearButton}>
              <MaterialIcons name="close" size={18} color="#999" />
            </Pressable>
          )}
        </View>

        <View style={styles.filterWrap}>
          <Pressable
            style={[styles.filterBtn, hasImagesFilter ? styles.filterActive : undefined]}
            onPress={() => { setHasImagesFilter(prev => !prev); setCurrentPage(1); }}
          >
            <Text style={[styles.filterText, hasImagesFilter ? styles.filterTextActive : undefined]}>Has Images</Text>
          </Pressable>

          <Pressable style={styles.filterBtn} onPress={() => { setItemsPerPage(prev => (prev === PAGE_SIZE ? 10 : PAGE_SIZE)); setCurrentPage(1); }}>
            <Text style={styles.filterText}>Per page: {itemsPerPage}</Text>
          </Pressable>
        </View>
      </View>

      {/* table */}
      <View style={styles.table}>
        <FlatList
          data={paginated}
          keyExtractor={item => item.id}
          renderItem={renderRow}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (<View style={styles.empty}><Text style={styles.emptyText}>No topics found.</Text></View>)}
        />
      </View>

      {/* pagination */}
      <View style={styles.pagination}>
        <Pressable onPress={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={[styles.pageBtn, currentPage === 1 ? styles.pageBtnDisabled : undefined]}>
          <Text style={styles.pageBtnText}>Prev</Text>
        </Pressable>

        <Text style={styles.pageInfo}>Page {currentPage} of {totalPages} • {filtered.length} result{filtered.length !== 1 ? 's' : ''}</Text>

        <Pressable onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={[styles.pageBtn, currentPage === totalPages ? styles.pageBtnDisabled : undefined]}>
          <Text style={styles.pageBtnText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Reuse styles from previous implementation or keep as-is
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: Platform.OS === 'android' ? 48 : 16 },
  center: { justifyContent: 'center', alignItems: 'center' },
  form: { marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 8, color: '#333', fontWeight: '700' },
  rowInput: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#e6e6e6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  inlineInput: { flex: 1, paddingVertical: 6, paddingHorizontal: 4, fontSize: 16, borderBottomWidth: 1, borderBottomColor: '#e6e6e6', backgroundColor: 'transparent' },
  saveBtn: { marginLeft: 8, backgroundColor: '#0c4ef4', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  saveText: { color: '#fff', fontWeight: '700' },

  controls: { marginBottom: 12 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee', borderRadius: 8, paddingHorizontal: 8, backgroundColor: '#fff' },
  searchInput: { flex: 1, paddingVertical: 8, paddingHorizontal: 8 },
  clearButton: { padding: 6 },

  filterWrap: { flexDirection: 'row', marginTop: 8 },
  filterBtn: { borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#fff', marginRight: 8 },
  filterActive: { backgroundColor: '#0c4ef4', borderColor: '#0c4ef4' },
  filterText: { color: '#333', fontWeight: '600' },
  filterTextActive: { color: '#fff' },

  table: { flex: 1, marginTop: 8 },
  rowContainer: { paddingVertical: 6 },
  rowInner: { backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' },
  row: { paddingVertical: 12, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowActions: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 10, paddingBottom: 10 },
  iconBtn: { padding: 8, borderRadius: 8 },
  iconBtnDisabled: { opacity: 0.5 },
  actionBtn: { padding: 8, borderRadius: 8 },
  cellLeft: { flex: 1 },
  cellRight: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: '#222' },
  meta: { fontSize: 12, color: '#777', marginTop: 6 },
  badge: { backgroundColor: '#eee', color: '#222', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, marginRight: 8, fontSize: 12 },
  separator: { height: 8 },
  empty: { padding: 24, alignItems: 'center' },
  emptyText: { color: '#999' },

  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  pageBtn: { backgroundColor: '#0c4ef4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  pageBtnDisabled: { opacity: 0.4, backgroundColor: '#c8d8ff' },
  pageBtnText: { color: '#fff', fontWeight: '700' },
  pageInfo: { color: '#333', fontWeight: '600' },
});