import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, AnimatedFAB, Appbar, Snackbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { LicenceCard } from "@/components/LicenceCard";
import { LicenceFormDialog } from "@/components/LicenceFormDialog";
import { RenewDialog } from "@/components/RenewDialog";
import {
  deleteGunLicence,
  fetchGunLicences,
  fetchTaxonomy,
  renewGunLicence,
  setGunLicenceExpired,
} from "@/lib/data";
import type {
  GunLicenceWithStatus,
  Jurisdiction,
  RecordType,
} from "@/types/database";

export default function LicencesScreen() {
  const [licences, setLicences] = useState<GunLicenceWithStatus[]>([]);
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [licenceTypes, setLicenceTypes] = useState<RecordType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editingLicence, setEditingLicence] = useState<GunLicenceWithStatus | null>(
    null,
  );
  const [showCreate, setShowCreate] = useState(false);
  const [renewTarget, setRenewTarget] = useState<GunLicenceWithStatus | null>(null);
  const [snack, setSnack] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [licenceData, taxonomy] = await Promise.all([
      fetchGunLicences(),
      fetchTaxonomy(),
    ]);
    setLicences(licenceData);
    setJurisdictions(taxonomy.jurisdictions);
    setLicenceTypes(
      taxonomy.recordTypes.filter(
        (type) => type.record_categories?.key === "gun_licence",
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

  const confirmDelete = (licence: GunLicenceWithStatus) => {
    Alert.alert(
      "Delete licence?",
      "This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGunLicence(licence.id);
              setSnack("Licence deleted.");
              refresh();
            } catch {
              setSnack("Could not delete licence.");
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const onToggleExpired = async (licence: GunLicenceWithStatus) => {
    try {
      await setGunLicenceExpired(licence.id, !licence.manually_marked_expired);
      refresh();
    } catch {
      setSnack("Could not update licence.");
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Appbar.Header style={styles.appbar} statusBarHeight={0}>
        <Appbar.Content title="Gun licences" subtitle="Track renewals and expiry" />
      </Appbar.Header>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      ) : licences.length === 0 ? (
        <EmptyState
          icon="shield-outline"
          title="No gun licences yet"
          description="Add your first licence to start tracking renewals."
          actionLabel="Add gun licence"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <FlatList
          data={licences}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          renderItem={({ item }) => (
            <LicenceCard
              licence={item}
              onRenew={() => setRenewTarget(item)}
              onEdit={() => setEditingLicence(item)}
              onToggleExpired={() => onToggleExpired(item)}
              onDelete={() => confirmDelete(item)}
            />
          )}
        />
      )}

      <AnimatedFAB
        icon="plus"
        label="Add licence"
        extended
        animateFrom="right"
        iconMode="dynamic"
        onPress={() => setShowCreate(true)}
        style={styles.fab}
      />

      <LicenceFormDialog
        visible={showCreate}
        onDismiss={() => setShowCreate(false)}
        onSaved={() => {
          setSnack("Licence added.");
          refresh();
        }}
        mode="create"
        jurisdictions={jurisdictions}
        licenceTypes={licenceTypes}
      />

      <LicenceFormDialog
        visible={!!editingLicence}
        onDismiss={() => setEditingLicence(null)}
        onSaved={() => {
          setSnack("Licence updated.");
          refresh();
        }}
        mode="edit"
        licence={editingLicence}
        jurisdictions={jurisdictions}
        licenceTypes={licenceTypes}
      />

      <RenewDialog
        visible={!!renewTarget}
        title={`Renew ${renewTarget?.record_types?.name ?? "licence"}`}
        onDismiss={() => setRenewTarget(null)}
        onConfirm={async (date) => {
          if (!renewTarget) return;
          await renewGunLicence(renewTarget.id, date);
          setSnack("Licence renewed.");
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
