import { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { TextInput, useTheme } from "react-native-paper";
import { formatDate, parseIsoDate, toIsoDate } from "@/lib/format";

interface DateFieldProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  optional?: boolean;
}

export function DateField({ label, value, onChange, optional }: DateFieldProps) {
  const theme = useTheme();
  const [show, setShow] = useState(false);
  const dateValue = parseIsoDate(value) ?? new Date();

  const onPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setShow(false);
    if (event.type === "dismissed") return;
    if (selected) onChange(toIsoDate(selected));
  };

  return (
    <View>
      <Pressable onPress={() => setShow(true)}>
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={label}
            value={value ? formatDate(value) : ""}
            placeholder={optional ? "Optional" : "Tap to choose"}
            editable={false}
            right={
              <TextInput.Icon
                icon={value ? "close" : "calendar"}
                onPress={
                  value
                    ? () => onChange(null)
                    : () => setShow(true)
                }
                color={theme.colors.onSurfaceVariant}
                forceTextInputFocus={false}
              />
            }
          />
        </View>
      </Pressable>
      {show ? (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={onPickerChange}
        />
      ) : null}
    </View>
  );
}

export const dateFieldStyles = StyleSheet.create({});
