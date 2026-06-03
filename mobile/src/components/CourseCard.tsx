import { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { Card, IconButton, Menu, Text } from "react-native-paper";
import { formatDate } from "@/lib/format";
import { StatusChip } from "@/components/StatusChip";
import type { GunCourseWithStatus } from "@/types/database";

interface CourseCardProps {
  course: GunCourseWithStatus;
  onRenew: () => void;
  onEdit: () => void;
  onToggleExpired: () => void;
  onDelete: () => void;
}

export function CourseCard({
  course,
  onRenew,
  onEdit,
  onToggleExpired,
  onDelete,
}: CourseCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const typeName = course.record_types?.name ?? "Course";
  const organizationName = course.organizations?.name ?? "No organization";
  const requiresRenewal = Boolean(course.record_types?.requires_renewal);

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text variant="titleMedium" style={styles.title}>
              {typeName}
            </Text>
            <Text variant="bodySmall" style={styles.subtitle}>
              {organizationName}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <StatusChip status={course.status} />
            <Menu
              visible={menuOpen}
              onDismiss={() => setMenuOpen(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setMenuOpen(true)}
                />
              }
            >
              {requiresRenewal ? (
                <Menu.Item
                  leadingIcon="refresh"
                  title="Renew"
                  onPress={() => {
                    setMenuOpen(false);
                    onRenew();
                  }}
                />
              ) : null}
              <Menu.Item
                leadingIcon="pencil"
                title="Edit details"
                onPress={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
              />
              <Menu.Item
                leadingIcon={
                  course.manually_marked_expired ? "shield-check" : "alert"
                }
                title={
                  course.manually_marked_expired ? "Clear expired" : "Mark expired"
                }
                onPress={() => {
                  setMenuOpen(false);
                  onToggleExpired();
                }}
              />
              <Menu.Item
                leadingIcon="trash-can"
                title="Delete"
                onPress={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                titleStyle={{ color: "#dc2626" }}
              />
            </Menu>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <Detail label="Completed" value={formatDate(course.completed_at)} />
          <Detail
            label="Expires"
            value={course.expiresAt ? formatDate(course.expiresAt) : "No expiry"}
          />
        </View>

        {course.certificate_signed_url ? (
          <Text
            variant="bodySmall"
            onPress={() => {
              if (course.certificate_signed_url)
                Linking.openURL(course.certificate_signed_url);
            }}
            style={styles.link}
          >
            View certificate
          </Text>
        ) : null}
      </Card.Content>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text variant="labelSmall" style={styles.detailLabel}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontWeight: "600",
  },
  subtitle: {
    color: "#64748b",
    marginTop: 2,
  },
  detailsGrid: {
    marginTop: 14,
    gap: 8,
  },
  detail: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  detailValue: {
    color: "#0f172a",
  },
  link: {
    marginTop: 12,
    color: "#2563eb",
    textDecorationLine: "underline",
  },
});
