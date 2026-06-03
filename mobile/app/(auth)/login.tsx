import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Link } from "expo-router";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await signIn(email.trim(), password);
    if (signInError) {
      setError(signInError);
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          <View style={styles.brandRow}>
            <View style={styles.brandSquare}>
              <Text style={styles.brandSquareText}>GL</Text>
            </View>
            <Text variant="titleMedium" style={styles.brandTitle}>
              Licence Tracker
            </Text>
          </View>

          <Text variant="headlineMedium" style={styles.heading}>
            Welcome back
          </Text>
          <Text variant="bodyMedium" style={styles.subheading}>
            Sign in to manage your gun licences and courses.
          </Text>

          <View style={styles.form}>
            <TextInput
              mode="outlined"
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <TextInput
              mode="outlined"
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword((value) => !value)}
                />
              }
            />
            {error ? (
              <HelperText type="error" visible>
                {error}
              </HelperText>
            ) : null}
            <Button
              mode="contained"
              onPress={submit}
              loading={submitting}
              disabled={submitting}
              style={styles.primaryButton}
            >
              Sign in
            </Button>
          </View>

          <View style={styles.footer}>
            <Text variant="bodyMedium">No account yet? </Text>
            <Link href="/(auth)/signup" asChild>
              <Text variant="bodyMedium" style={styles.link}>
                Create one
              </Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 32,
  },
  brandSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  brandSquareText: {
    color: "white",
    fontWeight: "700",
  },
  brandTitle: {
    fontWeight: "600",
  },
  heading: {
    fontWeight: "700",
  },
  subheading: {
    color: "#64748b",
    marginTop: 4,
    marginBottom: 24,
  },
  form: {
    gap: 12,
  },
  primaryButton: {
    marginTop: 8,
    paddingVertical: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  link: {
    color: "#0f172a",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
