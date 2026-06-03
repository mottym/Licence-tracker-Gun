import { ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Avatar, Button, Card, List, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth";

export default function ProfileScreen() {
  const { profile, session, signOut } = useAuth();
  const email = profile?.email ?? session?.user?.email ?? "Signed in";
  const initials = email
    .split("@")[0]
    .split(/[.\-_]/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Appbar.Header style={styles.appbar} statusBarHeight={0}>
        <Appbar.Content title="Profile" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card} mode="elevated">
          <Card.Content style={styles.identityRow}>
            <Avatar.Text size={48} label={initials || "U"} />
            <View style={styles.identityText}>
              <Text variant="titleMedium" style={styles.title}>
                {email}
              </Text>
              <Text variant="bodySmall" style={styles.subtitle}>
                Signed in
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card} mode="elevated">
          <Card.Title title="About" titleVariant="titleMedium" />
          <Card.Content>
            <List.Item
              title="Version"
              description="0.1.0"
              left={(props) => <List.Icon {...props} icon="information-outline" />}
            />
            <List.Item
              title="Help"
              description="Manage notification preferences from the web at the moment."
              left={(props) => <List.Icon {...props} icon="lifebuoy" />}
            />
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          icon="logout"
          onPress={signOut}
          style={styles.signOut}
        >
          Sign out
        </Button>
      </ScrollView>
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
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    marginBottom: 4,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  identityText: {
    flex: 1,
  },
  title: {
    fontWeight: "600",
  },
  subtitle: {
    color: "#64748b",
    marginTop: 2,
  },
  signOut: {
    marginTop: 8,
  },
});
