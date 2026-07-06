import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ActivityIndicator, Card, Icon, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchGunCourses, fetchGunLicences } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { statusColors, statusLabel } from "@/lib/status";
import type {
  GunCourseWithStatus,
  GunLicenceWithStatus,
  LicenceStatus,
} from "@/types/database";

export default function OverviewScreen() {
  const router = useRouter();
  const [licences, setLicences] = useState<GunLicenceWithStatus[]>([]);
  const [courses, setCourses] = useState<GunCourseWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [licenceData, courseData] = await Promise.all([
      fetchGunLicences(),
      fetchGunCourses(),
    ]);
    setLicences(licenceData);
    setCourses(courseData);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const expiringSoon = licences.filter(
    (licence) =>
      licence.daysUntilExpiry != null &&
      licence.daysUntilExpiry <= 30 &&
      licence.status !== "expired",
  ).length;
  const expired = licences.filter((licence) => licence.status === "expired").length;
  const upcoming = [...licences]
    .filter((licence) => licence.expiresAt != null && licence.daysUntilExpiry != null)
    .sort((a, b) => a.daysUntilExpiry! - b.daysUntilExpiry!)
    .slice(0, 5);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Overview
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            A snapshot of your licences and courses.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatTile
            label="Gun licences"
            value={licences.length}
            tone="slate"
            icon="shield-outline"
            onPress={() => router.push("/(tabs)/licences")}
          />
          <StatTile
            label="Gun courses"
            value={courses.length}
            tone="slate"
            icon="school-outline"
            onPress={() => router.push("/(tabs)/courses")}
          />
        </View>
        <View style={styles.statsRow}>
          <StatTile
            label="Renewal soon"
            value={expiringSoon}
            tone="warning"
            icon="calendar-clock"
          />
          <StatTile label="Expired" value={expired} tone="error" icon="alert-circle-outline" />
        </View>

        <Card style={styles.section} mode="elevated">
          <Card.Title
            title="Upcoming renewals"
            subtitle="Closest expiry dates first"
            titleVariant="titleMedium"
          />
          <Card.Content style={styles.upcomingList}>
            {upcoming.length === 0 ? (
              <Text variant="bodyMedium" style={styles.empty}>
                No licences yet. Add one from the Licences tab to start tracking renewals.
              </Text>
            ) : (
              upcoming.map((licence) => (
                <UpcomingRow key={licence.id} licence={licence} />
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const toneStyles = {
  slate: {
    background: "#ffffff",
    icon: "#0f172a",
    iconBg: "#f1f5f9",
    value: "#0f172a",
    label: "#64748b",
  },
  warning: {
    background: "#fffbeb",
    icon: "#92400e",
    iconBg: "#fef3c7",
    value: "#92400e",
    label: "#a16207",
  },
  error: {
    background: "#fef2f2",
    icon: "#991b1b",
    iconBg: "#fee2e2",
    value: "#991b1b",
    label: "#b91c1c",
  },
} as const;

function StatTile({
  label,
  value,
  tone,
  icon,
  onPress,
}: {
  label: string;
  value: number;
  tone: keyof typeof toneStyles;
  icon: string;
  onPress?: () => void;
}) {
  const styling = toneStyles[tone];
  return (
    <Card
      style={[styles.statTile, { backgroundColor: styling.background }]}
      mode="elevated"
      onPress={onPress}
    >
      <Card.Content style={styles.statTileContent}>
        <View style={[styles.statIcon, { backgroundColor: styling.iconBg }]}>
          <Icon source={icon} size={18} color={styling.icon} />
        </View>
        <Text style={[styles.statLabel, { color: styling.label }]}>{label}</Text>
        <Text style={[styles.statValue, { color: styling.value }]}>{value}</Text>
      </Card.Content>
    </Card>
  );
}

function UpcomingRow({ licence }: { licence: GunLicenceWithStatus }) {
  const jurisdictionName =
    licence.jurisdictions?.name ?? licence.states?.name ?? "Unknown jurisdiction";
  return (
    <View style={styles.upcomingRow}>
      <View style={styles.upcomingText}>
        <Text variant="bodyMedium" style={styles.upcomingTitle}>
          {licence.record_types?.name ?? "Licence"}
        </Text>
        <Text variant="bodySmall" style={styles.upcomingSubtitle}>
          {jurisdictionName} · expires {formatDate(licence.expiresAt)}
        </Text>
      </View>
      <StatusBadge status={licence.status} />
    </View>
  );
}

function StatusBadge({ status }: { status: LicenceStatus }) {
  const { background, text } = statusColors(status);
  return (
    <View style={[styles.statusBadge, { backgroundColor: background }]}>
      <Text style={[styles.statusBadgeText, { color: text }]}>{statusLabel(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontWeight: "700",
  },
  subtitle: {
    color: "#64748b",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statTile: {
    flex: 1,
  },
  statTileContent: {
    gap: 6,
    paddingVertical: 12,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  section: {
    marginTop: 12,
  },
  upcomingList: {
    gap: 12,
  },
  upcomingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 6,
  },
  upcomingText: {
    flex: 1,
    minWidth: 0,
  },
  upcomingTitle: {
    fontWeight: "600",
  },
  upcomingSubtitle: {
    color: "#64748b",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  empty: {
    color: "#64748b",
    paddingVertical: 8,
  },
});
