import { Linking, StyleSheet, View } from "react-native";
import { Card, IconButton, Menu, Text } from "react-native-paper";
import { useState } from "react";
import { formatDate } from "@/lib/format";
import { StatusChip } from "@/components/StatusChip";
import type { GunLicenceWithStatus } from "@/types/database";

interface LicenceCardProps {
  licence: GunLicenceWithStatus;
  onRenew: () => void;
  onEdit: () => void;
  onToggleExpired: () => void;
  onDelete: () => void;
}

export function LicenceCard({
  licence,
  onRenew,
  onEdit,
  onToggleExpired,
  onDelete,
}: LicenceCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const jurisdictionName =
    licence.jurisdictions?.name ?? licence.states?.name ?? "Unknown jurisdiction";
  const stateCode = licence.states?.code ?? licence.jurisdictions?.states?.code;
  const typeName = licence.record_types?.name ?? "License";

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text variant="titleMedium" style={styles.title}>
              {typeName}
            </Text>
            <Text variant="bodySmall" style={styles.subtitle}>
              {jurisdictionName}
              {stateCode ? ` · ${stateCode}` : ""}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <StatusChip status={licence.status} />
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
              <Menu.Item
                leadingIcon="refresh"
                title="Renew"
                onPress={() => {
                  setMenuOpen(false);
                  onRenew();
                }}
              />
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
                  licence.manually_marked_expired ? "shield-check" : "alert"
                }
                title={
                  licence.manually_marked_expired ? "Clear expired" : "Mark expired"
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
          <Detail label="License #" value={licence.licence_number ?? "Not set"} />
          <Detail label="Last renewed" value={formatDate(licence.last_renewed_at)} />
          <Detail label="Renewal opens" value={formatDate(licence.startRenewalBy)} />
          <Detail
            label="Expires"
            value={licence.expiresAt ? formatDate(licence.expiresAt) : "Does not expire"}
          />
        </View>

        {licence.photo_signed_url ? (
          <Text
            variant="bodySmall"
            onPress={() => {
              if (licence.photo_signed_url) Linking.openURL(licence.photo_signed_url);
            }}
            style={styles.link}
          >
            View license photo
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
