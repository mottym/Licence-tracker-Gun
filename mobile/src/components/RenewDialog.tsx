import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Dialog, HelperText, Portal } from "react-native-paper";
import { DateField } from "@/components/DateField";
import { toIsoDate } from "@/lib/format";

interface RenewDialogProps {
  visible: boolean;
  title: string;
  onDismiss: () => void;
  onConfirm: (isoDate: string) => Promise<void> | void;
}

export function RenewDialog({ visible, title, onDismiss, onConfirm }: RenewDialogProps) {
  const [date, setDate] = useState(toIsoDate(new Date()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setDate(toIsoDate(new Date()));
      setSaving(false);
      setError(null);
    }
  }, [visible]);

  const submit = async () => {
    if (!date) {
      setError("Pick a date first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onConfirm(date);
      onDismiss();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save renewal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={saving ? undefined : onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <View style={styles.body}>
            <DateField
              label="Renewed on"
              value={date}
              onChange={(value) => setDate(value ?? toIsoDate(new Date()))}
            />
            {error ? (
              <HelperText type="error" visible>
                {error}
              </HelperText>
            ) : null}
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={saving}>
            Cancel
          </Button>
          <Button mode="contained" onPress={submit} loading={saving} disabled={saving}>
            Save renewal
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 8,
  },
});
