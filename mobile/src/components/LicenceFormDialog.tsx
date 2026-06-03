import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Dialog, HelperText, Portal, Text, TextInput } from "react-native-paper";
import { DateField } from "@/components/DateField";
import { PhotoPicker, type PickedAsset } from "@/components/PhotoPicker";
import { SelectField } from "@/components/SelectField";
import { toIsoDate } from "@/lib/format";
import {
  attachPhotoToGunLicence,
  createGunLicence,
  removeGunLicencePhoto,
  updateGunLicence,
  uploadAttachment,
  type GunLicenceInput,
} from "@/lib/data";
import { useAuth } from "@/lib/auth";
import type {
  GunLicenceWithStatus,
  Jurisdiction,
  RecordType,
} from "@/types/database";

interface LicenceFormDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSaved: () => void;
  mode: "create" | "edit";
  licence?: GunLicenceWithStatus | null;
  jurisdictions: Jurisdiction[];
  licenceTypes: RecordType[];
}

const MONTH_OPTIONS = [
  { value: "", label: "—" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export function LicenceFormDialog({
  visible,
  onDismiss,
  onSaved,
  mode,
  licence,
  jurisdictions,
  licenceTypes,
}: LicenceFormDialogProps) {
  const { session } = useAuth();

  const [jurisdictionId, setJurisdictionId] = useState("");
  const [recordTypeId, setRecordTypeId] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [issuedAt, setIssuedAt] = useState<string | null>(null);
  const [lastRenewedAt, setLastRenewedAt] = useState<string | null>(null);
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<PickedAsset | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (mode === "edit" && licence) {
      setJurisdictionId(licence.jurisdiction_id);
      setRecordTypeId(licence.record_type_id);
      setLicenceNumber(licence.licence_number ?? "");
      setIssuedAt(licence.issued_at);
      setLastRenewedAt(licence.last_renewed_at);
      setBirthMonth(licence.birth_month ? String(licence.birth_month) : "");
      setBirthDay(licence.birth_day ? String(licence.birth_day) : "");
      setNotes(licence.notes ?? "");
    } else {
      setJurisdictionId("");
      setRecordTypeId("");
      setLicenceNumber("");
      setIssuedAt(null);
      setLastRenewedAt(toIsoDate(new Date()));
      setBirthMonth("");
      setBirthDay("");
      setNotes("");
    }
    setPhoto(null);
    setRemovePhoto(false);
    setError(null);
    setSaving(false);
  }, [visible, mode, licence]);

  const jurisdictionOptions = useMemo(
    () =>
      jurisdictions.map((jurisdiction) => ({
        value: jurisdiction.id,
        label: jurisdiction.name,
        helper: jurisdiction.states?.code
          ? `State ${jurisdiction.states.code}`
          : undefined,
      })),
    [jurisdictions],
  );

  const typeOptions = useMemo(
    () => licenceTypes.map((type) => ({ value: type.id, label: type.name })),
    [licenceTypes],
  );

  const handleSubmit = async () => {
    if (!jurisdictionId || !recordTypeId || !lastRenewedAt) {
      setError("Jurisdiction, licence type, and last renewed date are required.");
      return;
    }
    setSaving(true);
    setError(null);

    const input: GunLicenceInput = {
      jurisdiction_id: jurisdictionId,
      record_type_id: recordTypeId,
      licence_number: licenceNumber.trim() || null,
      issued_at: issuedAt,
      last_renewed_at: lastRenewedAt,
      birth_month: birthMonth ? Number(birthMonth) : null,
      birth_day: birthDay ? Number(birthDay) : null,
      notes: notes.trim() || null,
    };

    try {
      const targetId =
        mode === "create"
          ? await createGunLicence(input)
          : (await updateGunLicence(licence!.id, input), licence!.id);

      if (!targetId || !session?.user) {
        setSaving(false);
        return;
      }

      if (mode === "edit" && removePhoto && licence?.photo_url) {
        await removeGunLicencePhoto(targetId, licence.photo_url);
      }

      if (photo) {
        const path = await uploadAttachment({
          userId: session.user.id,
          subdir: "gun-licences",
          recordId: targetId,
          uri: photo.uri,
          mimeType: photo.mimeType,
        });
        if (path) await attachPhotoToGunLicence(targetId, path);
      }

      onSaved();
      onDismiss();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save licence.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={saving ? undefined : onDismiss}>
        <Dialog.Title>{mode === "create" ? "Add gun licence" : "Edit gun licence"}</Dialog.Title>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <SelectField
              label="Jurisdiction"
              value={jurisdictionId}
              options={jurisdictionOptions}
              onChange={setJurisdictionId}
            />
            <SelectField
              label="Licence type"
              value={recordTypeId}
              options={typeOptions}
              onChange={setRecordTypeId}
            />
            <TextInput
              mode="outlined"
              label="Licence number"
              value={licenceNumber}
              onChangeText={setLicenceNumber}
              placeholder="e.g. NYC-12345"
            />
            <DateField
              label="Last renewed"
              value={lastRenewedAt}
              onChange={setLastRenewedAt}
            />
            <DateField
              label="Issue date (optional)"
              value={issuedAt}
              onChange={setIssuedAt}
              optional
            />

            <Text variant="labelLarge" style={styles.sectionLabel}>
              Birthday (for states that expire on birthday)
            </Text>
            <View style={styles.row}>
              <View style={styles.flex}>
                <SelectField
                  label="Month"
                  value={birthMonth}
                  options={MONTH_OPTIONS}
                  onChange={setBirthMonth}
                />
              </View>
              <View style={styles.flex}>
                <TextInput
                  mode="outlined"
                  label="Day"
                  value={birthDay}
                  onChangeText={(text) =>
                    setBirthDay(text.replace(/[^0-9]/g, "").slice(0, 2))
                  }
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <TextInput
              mode="outlined"
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <PhotoPicker
              label="Licence photo"
              helperText={
                mode === "edit" && licence?.photo_signed_url
                  ? "Pick a new photo to replace the existing one, or tap remove."
                  : "Optional. Use camera or gallery."
              }
              initialUri={
                mode === "edit" ? licence?.photo_signed_url ?? undefined : undefined
              }
              onPicked={(asset) => {
                setPhoto(asset);
                if (!asset && mode === "edit") setRemovePhoto(true);
                else setRemovePhoto(false);
              }}
            />

            {error ? (
              <HelperText type="error" visible style={styles.error}>
                {error}
              </HelperText>
            ) : null}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={saving}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleSubmit} loading={saving} disabled={saving}>
            {mode === "create" ? "Add licence" : "Save changes"}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    paddingHorizontal: 0,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  sectionLabel: {
    marginTop: 8,
    color: "#475569",
  },
  error: {
    paddingHorizontal: 0,
  },
});
