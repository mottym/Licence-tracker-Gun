import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Dialog, HelperText, Portal, TextInput } from "react-native-paper";
import { DateField } from "@/components/DateField";
import { PhotoPicker, type PickedAsset } from "@/components/PhotoPicker";
import { SelectField } from "@/components/SelectField";
import { toIsoDate } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import {
  attachCertificateToGunCourse,
  createGunCourse,
  removeGunCourseCertificate,
  updateGunCourse,
  uploadAttachment,
  type GunCourseInput,
} from "@/lib/data";
import type {
  GunCourseWithStatus,
  Organization,
  RecordType,
} from "@/types/database";

interface CourseFormDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSaved: () => void;
  mode: "create" | "edit";
  course?: GunCourseWithStatus | null;
  organizations: Organization[];
  courseTypes: RecordType[];
}

export function CourseFormDialog({
  visible,
  onDismiss,
  onSaved,
  mode,
  course,
  organizations,
  courseTypes,
}: CourseFormDialogProps) {
  const { session } = useAuth();

  const [organizationId, setOrganizationId] = useState("");
  const [recordTypeId, setRecordTypeId] = useState("");
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [renewedAt, setRenewedAt] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [certificate, setCertificate] = useState<PickedAsset | null>(null);
  const [removeCertificate, setRemoveCertificate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (mode === "edit" && course) {
      setOrganizationId(course.organization_id);
      setRecordTypeId(course.record_type_id);
      setCompletedAt(course.completed_at);
      setRenewedAt(course.renewed_at);
      setNotes(course.notes ?? "");
    } else {
      setOrganizationId("");
      setRecordTypeId("");
      setCompletedAt(toIsoDate(new Date()));
      setRenewedAt(null);
      setNotes("");
    }
    setCertificate(null);
    setRemoveCertificate(false);
    setError(null);
    setSaving(false);
  }, [visible, mode, course]);

  const orgOptions = useMemo(
    () => organizations.map((org) => ({ value: org.id, label: org.name })),
    [organizations],
  );

  const typeOptions = useMemo(
    () => courseTypes.map((type) => ({ value: type.id, label: type.name })),
    [courseTypes],
  );

  const handleSubmit = async () => {
    if (!organizationId || !recordTypeId || !completedAt) {
      setError("Organization, course type, and completed date are required.");
      return;
    }
    setSaving(true);
    setError(null);

    const input: GunCourseInput = {
      organization_id: organizationId,
      record_type_id: recordTypeId,
      completed_at: completedAt,
      renewed_at: renewedAt,
      notes: notes.trim() || null,
    };

    try {
      const targetId =
        mode === "create"
          ? await createGunCourse(input)
          : (await updateGunCourse(course!.id, input), course!.id);

      if (!targetId || !session?.user) {
        setSaving(false);
        return;
      }

      if (mode === "edit" && removeCertificate && course?.certificate_url) {
        await removeGunCourseCertificate(targetId, course.certificate_url);
      }

      if (certificate) {
        const path = await uploadAttachment({
          userId: session.user.id,
          subdir: "gun-courses",
          recordId: targetId,
          uri: certificate.uri,
          mimeType: certificate.mimeType,
        });
        if (path) await attachCertificateToGunCourse(targetId, path);
      }

      onSaved();
      onDismiss();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save course.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={saving ? undefined : onDismiss}>
        <Dialog.Title>
          {mode === "create" ? "Add gun course" : "Edit gun course"}
        </Dialog.Title>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <SelectField
              label="Organization"
              value={organizationId}
              options={orgOptions}
              onChange={setOrganizationId}
            />
            <SelectField
              label="Course type"
              value={recordTypeId}
              options={typeOptions}
              onChange={setRecordTypeId}
            />
            <DateField label="Completed" value={completedAt} onChange={setCompletedAt} />
            <DateField
              label="Last renewed (optional)"
              value={renewedAt}
              onChange={setRenewedAt}
              optional
            />
            <TextInput
              mode="outlined"
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
            <PhotoPicker
              label="Certificate"
              helperText={
                mode === "edit" && course?.certificate_signed_url
                  ? "Pick a new image to replace, or tap remove."
                  : "Optional. Use camera or gallery."
              }
              initialUri={
                mode === "edit" ? course?.certificate_signed_url ?? undefined : undefined
              }
              onPicked={(asset) => {
                setCertificate(asset);
                if (!asset && mode === "edit") setRemoveCertificate(true);
                else setRemoveCertificate(false);
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
            {mode === "create" ? "Add course" : "Save changes"}
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
  error: {
    paddingHorizontal: 0,
  },
});
