import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Link } from "expo-router";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth";

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!email.trim() || password.length < 8) {
      setError("Use a valid email and a password of at least 8 characters.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setInfo(null);
    const { error: signUpError } = await signUp(email.trim(), password);
    if (signUpError) {
      setError(signUpError);
    } else {
      setInfo("Account created. Check your email if confirmation is required.");
    }
    setSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          <Text variant="headlineMedium" style={styles.heading}>
            Create your account
          </Text>
          <Text variant="bodyMedium" style={styles.subheading}>
            Start tracking renewals and never miss a deadline.
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
              label="Password (8+ characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            {error ? (
              <HelperText type="error" visible>
                {error}
              </HelperText>
            ) : null}
            {info ? (
              <HelperText type="info" visible>
                {info}
              </HelperText>
            ) : null}
            <Button
              mode="contained"
              onPress={submit}
              loading={submitting}
              disabled={submitting}
              style={styles.primaryButton}
            >
              Create account
            </Button>
          </View>

          <View style={styles.footer}>
            <Text variant="bodyMedium">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <Text variant="bodyMedium" style={styles.link}>
                Sign in
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
