import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Modal, Portal, Text, TextInput, useTheme } from "react-native-paper";

export interface SelectOption {
  value: string;
  label: string;
  helper?: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = "Select…",
}: SelectFieldProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View>
      <Pressable onPress={() => setOpen(true)}>
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={label}
            value={selected?.label ?? ""}
            placeholder={placeholder}
            editable={false}
            right={<TextInput.Icon icon="menu-down" forceTextInputFocus={false} />}
          />
        </View>
      </Pressable>

      <Portal>
        <Modal
          visible={open}
          onDismiss={() => setOpen(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Text variant="titleMedium" style={styles.title}>
            {label}
          </Text>
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {options.length === 0 ? (
              <Text style={styles.empty}>No options available.</Text>
            ) : (
              options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && {
                        backgroundColor: theme.colors.secondaryContainer,
                      },
                      pressed && !isSelected && styles.optionPressed,
                    ]}
                  >
                    <View style={styles.optionTextWrap}>
                      <Text variant="bodyLarge">{option.label}</Text>
                      {option.helper ? (
                        <Text variant="bodySmall" style={styles.helper}>
                          {option.helper}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  modal: {
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 16,
    maxHeight: "75%",
  },
  title: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontWeight: "600",
  },
  list: {
    maxHeight: 480,
  },
  listContent: {
    paddingBottom: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionPressed: {
    backgroundColor: "#f1f5f9",
  },
  optionTextWrap: {
    gap: 2,
  },
  helper: {
    color: "#64748b",
  },
  empty: {
    paddingHorizontal: 16,
    color: "#64748b",
  },
});
