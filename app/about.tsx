import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import {
    ArrowLeft,
    BookOpenText,
    Info,
    ShieldCheck,
} from "lucide-react-native";
import React from "react";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const detectableSnakes = [
  "Barred Coral Snake",
  "Dog toothed Cat Snake",
  "Gervais Worm Snake",
  "King Cobra",
  "Luzon Bronzeback Treesnake",
  "Mangrove Cat Snake",
  "Mullers Wolf Snake",
  "North Philippine Temple Pitviper",
  "Paradise Tree Snake",
  "Philippine Blunt headed Catsnake",
  "Philippine Bronzeback Treesnake",
  "Philippine Cat Snake",
  "Philippine Cobra",
  "Philippine Pitviper",
  "Red tailed Green Ratsnake",
  "Reinhardts Lined Snake",
  "Reticulated Python",
];

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        <LinearGradient
          colors={["#047857", "#0f766e"]}
          style={[styles.header, { paddingTop: insets.top + 12 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            style={[styles.backButton, { top: insets.top + 8 }]}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>About Application</Text>
          <Text style={styles.headerSubtitle}>
            Research details, authors, and the 17 supported snake classes
          </Text>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: 220 + insets.top, paddingBottom: 36 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <BookOpenText size={17} color="#059669" />
              </View>
              <Text style={styles.sectionTitle}>Research Title</Text>
            </View>

            <Text style={styles.bodyText}>
              EfficientNet-Lite Based Image Classification of Venomous and
              Non-venomous Snakes Species in the Philippines
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <Info size={17} color="#059669" />
              </View>
              <Text style={styles.sectionTitle}>Authors</Text>
            </View>

            <View style={styles.authorList}>
              {[
                "Cejie M. Hernandez",
                "Daryl G. Andrada",
                "Ciara May Antoinette M. Jackson",
                "Milcah Joy P. Lopez",
                "Denver Memoriado",
              ].map((author, index) => (
                <View key={author} style={styles.authorRow}>
                  <Text style={styles.authorNumber}>{index + 1}.</Text>
                  <Text style={styles.authorText}>{author}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <ShieldCheck size={17} color="#059669" />
              </View>
              <Text style={styles.sectionTitle}>Detected Snake Classes</Text>
            </View>

            <Text style={styles.smallInfo}>
              The model supports only these 17 snake species:
            </Text>

            <View style={styles.snakeGrid}>
              {detectableSnakes.map((snake, index) => (
                <View key={`${snake}-${index}`} style={styles.snakeChip}>
                  <View style={styles.bullet} />
                  <Text style={styles.snakeText}>{snake}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6F8",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 210,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  backButton: {
    position: "absolute",
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  headerBadgeText: {
    color: "#ECFDF5",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#D1FAE5",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
    maxWidth: 300,
  },
  content: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 25,
    color: "#374151",
  },
  smallInfo: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 14,
    lineHeight: 20,
  },
  authorList: {
    gap: 10,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  authorNumber: {
    width: 24,
    fontSize: 14,
    fontWeight: "700",
    color: "#059669",
    marginTop: 1,
  },
  authorText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
    color: "#374151",
  },
  snakeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  snakeChip: {
    width: "48.5%",
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#059669",
    marginTop: 6,
    marginRight: 8,
  },
  snakeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: "#1F2937",
    fontWeight: "600",
  },
});
