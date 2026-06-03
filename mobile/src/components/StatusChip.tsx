import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { statusColors, statusLabel } from "@/lib/status";
import type { LicenceStatus } from "@/types/database";

interface StatusChipProps {
  status: LicenceStatus;
}

export function StatusChip({ status }: StatusChipProps) {
  const { background, text } = statusColors(status);
  return (
    <View style={[styles.chip, { backgroundColor: background }]}>
      <Text style={[styles.label, { color: text }]}>{statusLabel(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});
