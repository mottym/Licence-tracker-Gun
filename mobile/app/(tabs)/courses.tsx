import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, AnimatedFAB, Appbar, Snackbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { CourseCard } from "@/components/CourseCard";
import { CourseFormDialog } from "@/components/CourseFormDialog";
import { EmptyState } from "@/components/EmptyState";
import { RenewDialog } from "@/components/RenewDialog";
import {
  deleteGunCourse,
  fetchGunCourses,
  fetchTaxonomy,
  renewGunCourse,
  setGunCourseExpired,
} from "@/lib/data";
import type {
  GunCourseWithStatus,
  Organization,
  RecordType,
} from "@/types/database";

export default function CoursesScreen() {
  const [courses, setCourses] = useState<GunCourseWithStatus[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [courseTypes, setCourseTypes] = useState<RecordType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editing, setEditing] = useState<GunCourseWithStatus | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [renewTarget, setRenewTarget] = useState<GunCourseWithStatus | null>(null);
  const [snack, setSnack] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [courseData, taxonomy] = await Promise.all([
      fetchGunCourses(),
      fetchTaxonomy(),
    ]);
    setCourses(courseData);
    setOrganizations(taxonomy.organizations);
    setCourseTypes(
      taxonomy.recordTypes.filter(
        (type) => type.record_categories?.key === "gun_course",
      ),
    );
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const confirmDelete = (course: GunCourseWithStatus) => {
    Alert.alert(
      "Delete course?",
      "This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGunCourse(course.id);
              setSnack("Course deleted.");
              refresh();
            } catch {
              setSnack("Could not delete course.");
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const onToggleExpired = async (course: GunCourseWithStatus) => {
    try {
      await setGunCourseExpired(course.id, !course.manually_marked_expired);
      refresh();
    } catch {
      setSnack("Could not update course.");
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Appbar.Header style={styles.appbar} statusBarHeight={0}>
        <Appbar.Content title="Gun courses" subtitle="Track completion and renewals" />
      </Appbar.Header>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      ) : courses.length === 0 ? (
        <EmptyState
          icon="school-outline"
          title="No gun courses yet"
          description="Log a completed course to start tracking renewals."
          actionLabel="Add gun course"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              onRenew={() => setRenewTarget(item)}
              onEdit={() => setEditing(item)}
              onToggleExpired={() => onToggleExpired(item)}
              onDelete={() => confirmDelete(item)}
            />
          )}
        />
      )}

      <AnimatedFAB
        icon="plus"
        label="Add course"
        extended
        animateFrom="right"
        iconMode="dynamic"
        onPress={() => setShowCreate(true)}
        style={styles.fab}
      />

      <CourseFormDialog
        visible={showCreate}
        onDismiss={() => setShowCreate(false)}
        onSaved={() => {
          setSnack("Course added.");
          refresh();
        }}
        mode="create"
        organizations={organizations}
        courseTypes={courseTypes}
      />

      <CourseFormDialog
        visible={!!editing}
        onDismiss={() => setEditing(null)}
        onSaved={() => {
          setSnack("Course updated.");
          refresh();
        }}
        mode="edit"
        course={editing}
        organizations={organizations}
        courseTypes={courseTypes}
      />

      <RenewDialog
        visible={!!renewTarget}
        title={`Renew ${renewTarget?.record_types?.name ?? "course"}`}
        onDismiss={() => setRenewTarget(null)}
        onConfirm={async (date) => {
          if (!renewTarget) return;
          await renewGunCourse(renewTarget.id, date);
          setSnack("Course renewed.");
          refresh();
        }}
      />

      <Snackbar
        visible={!!snack}
        onDismiss={() => setSnack(null)}
        duration={2400}
        style={styles.snack}
      >
        {snack}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  appbar: {
    backgroundColor: "transparent",
    paddingHorizontal: 4,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    padding: 16,
    paddingBottom: 120,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 16,
  },
  snack: {
    marginBottom: 90,
  },
});
