import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { getSubTitles, getAllSubTopics, createSubTitle, updateSubTitle, getUploadUrl, saveImage } from "../../../lib/api";
import { API_PREFIX } from "../../../lib/config";

/* ---------------- TYPES ---------------- */
type SubTopic = {
  id: string | number;
  name: string;
};

type SubTitleItem = {
  id: string | number;
  title: string;
  subTopicId: string | number;
  sortOrder?: number;
  delStatus?: boolean;
  images?: string[];
};

export default function SubTitleScreen() {
  /* ---------------- STATE ---------------- */
  const [titleName, setTitleName] = useState("");
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [selectedSubTopic, setSelectedSubTopic] = useState<string | number | null>(null);
  const [images, setImages] = useState<{ uri: string; uri_original?: string; uri_medium?: string; uri_thumb?: string; uri_webp?: string }[]>([]);
  const [subTitles, setSubTitles] = useState<SubTitleItem[]>([]);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  /* ---------------- MESSAGE ---------------- */
  const showMessage = (success: boolean, msg: string) => {
    Alert.alert(success ? "Success" : "Error", msg);
  };

  /* ---------------- LOAD SUBTITLES & SUBTOPICS ---------------- */
  useEffect(() => {
    loadSubTitles();
  }, []);

  async function loadSubTitles() {
    try {
      setLoading(true);
      console.log('[API] Loading sub-titles...');
      const rows = await getSubTitles();
      console.log('[API] Loaded sub-titles:', rows.length);
      setSubTitles(rows);

      // Load all sub-topics separately
      console.log('[API] Loading all sub-topics...');
      const allSubTopics = await getAllSubTopics();
      console.log('[API] Loaded sub-topics:', allSubTopics.length);
      setSubTopics(allSubTopics);

      if (allSubTopics.length > 0 && !selectedSubTopic) {
        setSelectedSubTopic(allSubTopics[0].id);
      }
    } catch (e) {
      console.error('[API] Failed to load sub-titles or sub-topics:', e);
      showMessage(false, 'Failed to load data from API');
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- IMAGE PICK & UPLOAD ---------------- */
  const pickImages = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (res.canceled) return;

    for (const asset of res.assets) {
      // Just add to local images list - don't upload yet
      setImages((p) => [...p, { 
        uri: asset.uri,
      }]);
    }
  };

  /* ---------------- SAVE / UPDATE ---------------- */
  const handleSave = async () => {
    if (!titleName || !selectedSubTopic) {
      showMessage(false, 'Please enter title and select sub-topic');
      return;
    }

    if (images.length === 0) {
      showMessage(false, 'Please upload at least one image before saving');
      return;
    }

    try {
      setUploading(true);
      console.log('[API] Saving subtitle:', titleName, 'for sub-topic:', selectedSubTopic);
      
      let subTitleId: string | number;
      if (editingId) {
        console.log('[API] Updating subtitle:', editingId, titleName);
        await updateSubTitle({ id: editingId, title: titleName, subTopicId: selectedSubTopic });
        subTitleId = editingId;
      } else {
        console.log('[API] Creating subtitle:', titleName, 'for sub-topic:', selectedSubTopic);
        const maxSort = subTitles.reduce((m, s) => Math.max(m, s.sortOrder ?? 0), 0);
        const created = await createSubTitle({ title: titleName, subTopicId: selectedSubTopic, sortOrder: maxSort + 1 });
        subTitleId = created?.id;
      }
console.log('subTitleId',subTitleId);

      if (!subTitleId) throw "Save failed";
      console.log('[API] Subtitle saved with ID:', subTitleId);

      // Upload images to S3 AFTER subtitle is created
      for (let i = 0; i < images.length; i++) {
        console.log('[API] Uploading image', i + 1, 'of', images.length);
        try {
          const fileName = `subtitle-${Date.now()}-${i}.jpg`;
          const uploadUrlRes = await getUploadUrl({
            subTitleId,
            fileName: fileName,
            mime: 'image/jpeg',
          });
          const { uploadUrl, imageUrl } = uploadUrlRes;
          console.log('[API] Got signed upload URL:', uploadUrl);

          // Upload to S3 using appropriate method for platform
          if (Platform.OS === 'web') {
            // Web: fetch file as blob and upload
            const fileBlob = await (await fetch(images[i].uri)).blob();
            const uploadRes = await fetch(uploadUrl, {
              method: 'PUT',
              headers: { 'Content-Type': 'image/jpeg' },
              body: fileBlob,
            });

            if (!uploadRes.ok) {
              const text = await uploadRes.text();
              throw new Error(`S3 upload failed: ${uploadRes.status} ${text}`);
            }
          } else {
            // Native: use FileSystem.uploadAsync for direct file upload
            const result = await FileSystem.uploadAsync(uploadUrl, images[i].uri, {
              httpMethod: 'PUT',
              headers: { 'Content-Type': 'image/jpeg' },
            });

            if (result.status !== 200) {
              throw new Error(`S3 upload failed: ${result.status}`);
            }
          }

          console.log('[API] S3 upload successful, image URL:', imageUrl);

          // Save image metadata
          await saveImage({ 
            subTitleId, 
            imageUrl: imageUrl,
            uri_original: uploadUrlRes.uri_original,
            uri_medium: uploadUrlRes.uri_medium,
            uri_thumb: uploadUrlRes.uri_thumb,
            uri_webp: uploadUrlRes.uri_webp,
            sortOrder: i + 1 
          });
        } catch (imgErr) {
          console.warn('[API] Image upload failed for index', i, imgErr);
        }
      }

      console.log('[API] All images processed');
      showMessage(true, editingId ? "Updated successfully" : "Saved successfully");

      setTitleName("");
      setSelectedSubTopic(null);
      setImages([]);
      setEditingId(null);

      await loadSubTitles();
    } catch(err:any) {
      console.error('[API] Save operation failed:', err);
      showMessage(false, "Operation failed");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- DELETE SUBTITLE (SOFT DELETE) ---------------- */
  const deleteSubtitle = async (id: string | number) => {
    try {
      console.log('[API] Soft deleting subtitle:', id);
      await updateSubTitle({ id, delStatus: true });
      console.log('[API] Subtitle soft deleted successfully');
      showMessage(true, "Subtitle deleted");
      await loadSubTitles();
    } catch (e) {
      console.error('[API] Failed to delete subtitle:', e);
      showMessage(false, "Delete failed");
    }
  };

  /* ---------------- MOVE UP/DOWN SUBTITLES ---------------- */

  const handleMoveUp = async (id: string | number) => {
    const index = subTitles.findIndex(s => s.id === id);
    if (index <= 0) return;

    const current = subTitles[index];
    const above = subTitles[index - 1];

    const tempSort = current.sortOrder ?? 0;
    const newTitles = [...subTitles];
    newTitles[index].sortOrder = above.sortOrder ?? 0;
    newTitles[index - 1].sortOrder = tempSort;

    setSubTitles(newTitles);

    try {
      console.log('[API] Moving subtitle up:', id);
      await Promise.all([
        updateSubTitle({ id: current.id, sortOrder: newTitles[index].sortOrder }),
        updateSubTitle({ id: above.id, sortOrder: newTitles[index - 1].sortOrder }),
      ]);
    } catch (e) {
      console.error('[API] Move up failed:', e);
      setSubTitles(subTitles);
    }
  };

  const handleMoveDown = async (id: string | number) => {
    const index = subTitles.findIndex(s => s.id === id);
    if (index >= subTitles.length - 1) return;

    const current = subTitles[index];
    const below = subTitles[index + 1];

    const tempSort = current.sortOrder ?? 0;
    const newTitles = [...subTitles];
    newTitles[index].sortOrder = below.sortOrder ?? 0;
    newTitles[index + 1].sortOrder = tempSort;

    setSubTitles(newTitles);

    try {
      console.log('[API] Moving subtitle down:', id);
      await Promise.all([
        updateSubTitle({ id: current.id, sortOrder: newTitles[index].sortOrder }),
        updateSubTitle({ id: below.id, sortOrder: newTitles[index + 1].sortOrder }),
      ]);
    } catch (e) {
      console.error('[API] Move down failed:', e);
      setSubTitles(subTitles);
    }
  };

  /* ---------------- DELETE IMAGE ---------------- */
  const deleteImage = async (imageUrl: string) => {
    try {
      console.log('[API] Deleting image:', imageUrl);
      // TODO: Add delete image endpoint when available
      showMessage(true, "Image deleted");
      await loadSubTitles();
    } catch (e) {
      console.error('[API] Failed to delete image:', e);
      showMessage(false, "Image delete failed");
    }
  };

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sub Topic</Text>
      <Picker selectedValue={selectedSubTopic} onValueChange={setSelectedSubTopic}>
        <Picker.Item label="Select sub topic..." value={null} />
        {subTopics.map((s) => (
          <Picker.Item key={s.id} label={s.name} value={s.id} />
        ))}
      </Picker>

      <TextInput
        placeholder="Enter sub title"
        value={titleName}
        onChangeText={setTitleName}
        style={styles.input}
      />

      <Pressable 
        style={[styles.saveBtn, uploading && styles.saveBtnDisabled]} 
        onPress={handleSave}
        disabled={uploading}
      >
        <Text style={styles.saveText}>{uploading ? "Uploading..." : (editingId ? "Update" : "Save")}</Text>
      </Pressable>

      <Pressable onPress={pickImages} style={styles.attachBtn}>
        <Text>Attach Images</Text>
      </Pressable>
      
      <View style={styles.imageRow}>
  {images.map((img, index) => (
    <View key={`new-${index}`} style={styles.thumbWrapper}>
      <Image source={{ uri: img.uri }} style={styles.thumb} />

      <TouchableOpacity
        style={styles.deleteIcon}
        onPress={() =>
          setImages(prev => prev.filter((_, i) => i !== index))
        }
      >
        <MaterialIcons name="close" size={14} color="#fff" />
      </TouchableOpacity>
    </View>
  ))}
</View>

      {uploading && <Text>Uploading...</Text>}

      <Text style={styles.sectionTitle}>Report</Text>

      <FlatList
        data={subTitles}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.cardMeta}>id: {item.id} • sort: {item.sortOrder ?? 0}</Text>

              <View style={{ flexDirection: "row", marginTop: 8 }}>
                {item.images?.map((uri, i) => (
                  <TouchableOpacity key={i} onPress={() => deleteImage(uri)}>
                    <Image source={{ uri }} style={styles.thumb} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => handleMoveUp(item.id)}
                disabled={subTitles[0]?.id === item.id}
              >
                <MaterialIcons
                  name="arrow-upward"
                  size={24}
                  color={subTitles[0]?.id === item.id ? '#ccc' : '#4CAF50'}
                  style={[
                    styles.actionIcon,
                    subTitles[0]?.id === item.id ? styles.actionIconDisabled : null,
                  ]}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleMoveDown(item.id)}
                disabled={subTitles[subTitles.length - 1]?.id === item.id}
              >
                <MaterialIcons
                  name="arrow-downward"
                  size={24}
                  color={subTitles[subTitles.length - 1]?.id === item.id ? '#ccc' : '#FF9800'}
                  style={[
                    styles.actionIcon,
                    subTitles[subTitles.length - 1]?.id === item.id ? styles.actionIconDisabled : null,
                  ]}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => deleteSubtitle(item.id)}>
                <MaterialIcons
                  name="delete"
                  size={24}
                  color="#F44336"
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center" },
  label: { fontWeight: "700", marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 8 },
  saveBtn: { backgroundColor: "#0c4ef4", padding: 12, borderRadius: 8 },
  saveBtnDisabled: { backgroundColor: "#ccc", opacity: 0.6 },
  saveText: { color: "#fff", textAlign: "center", fontWeight: "700" },
  attachBtn: { padding: 10, backgroundColor: "#eee", borderRadius: 8, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginVertical: 12 },
  
  /* Card Styles */
  card: { 
    backgroundColor: "#fff", 
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
  },
  title: { fontSize: 16, fontWeight: "700" },
  cardMeta: { fontSize: 11, color: "#999", marginTop: 4 },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 12,
  },
  actionIcon: {
    padding: 4,
  },
  actionIconDisabled: {
    opacity: 0.5,
  },
  
  /* Legacy Report Card (deprecated) */
  reportCard: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 10 },
  reportTitle: { fontSize: 16, fontWeight: "700" },
  reportMeta: { fontSize: 12, color: "#666", marginBottom: 4 },
  
  thumb: { width: 60, height: 60, borderRadius: 6, marginRight: 6 },
  imageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  thumbWrapper: {
    position: "relative",
    marginRight: 8,
    marginBottom: 8,
  },
  deleteIcon: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#d00",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
});
