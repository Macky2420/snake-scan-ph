import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
// Keep this import, it now works because we created the file above
import {
  AlertTriangle,
  Camera,
  ChevronRight,
  MapPin,
  Settings as SettingsIcon,
  ShieldCheck,
} from "lucide-react-native";
import React from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { mockScans, SnakeScan } from "../data/snake";

// --- REMOVE THE TYPE AND DATA ARRAY FROM HERE ---
// They are now imported from "../data/snake"

// --- Component ---
export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Calculate counts from the imported data
  const venomousCount = mockScans.filter((s) => s.type === "venomous").length;
  const nonVenomousCount = mockScans.filter(
    (s) => s.type === "non-venomous",
  ).length;

  const onViewSnake = (snake: SnakeScan) => {
    // Navigate to detail screen
    router.push(`/snake/${snake.id}`);
  };

  const onOpenScan = () => {
    router.push("/scan");
  };

  const onOpenSettings = () => {
    console.log("Open Settings");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. HEADER */}
      <LinearGradient
        colors={["#059669", "#0d9488"]}
        style={[
          styles.header,
          { paddingTop: insets.top + 10, height: 200 + insets.top },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>Scan History</Text>
          </View>
          <TouchableOpacity
            onPress={onOpenSettings}
            style={styles.settingsButton}
          >
            <SettingsIcon size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { marginRight: 12 }]}>
            <View style={styles.statIconRow}>
              <AlertTriangle size={16} color="#FCA5A5" />
              <Text style={styles.statLabel}>Venomous</Text>
            </View>
            <Text style={styles.statValue}>{venomousCount}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <ShieldCheck size={16} color="#6EE7B7" />
              <Text style={styles.statLabel}>Non-venomous</Text>
            </View>
            <Text style={styles.statValue}>{nonVenomousCount}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* 2. LIST */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.listContentContainer,
          {
            paddingTop: 210 + insets.top,
            paddingBottom: 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listInnerContainer}>
          <Text style={styles.listTitle}>Recent Scans</Text>
          {mockScans.map((scan) => (
            <TouchableOpacity
              key={scan.id}
              style={styles.card}
              onPress={() => onViewSnake(scan)}
              activeOpacity={0.7}
            >
              <Image source={{ uri: scan.image }} style={styles.cardImage} />

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{scan.name}</Text>
                <Text style={styles.cardSubtitle}>{scan.scientificName}</Text>

                <View style={styles.locationRow}>
                  <MapPin size={12} color="#6B7280" />
                  <Text style={styles.locationText}>{scan.location}</Text>
                </View>

                <View style={styles.cardFooter}>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          scan.type === "venomous" ? "#FEE2E2" : "#D1FAE5",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color:
                            scan.type === "venomous" ? "#991B1B" : "#065F46",
                        },
                      ]}
                    >
                      {scan.type === "venomous"
                        ? "⚠️ Venomous"
                        : "✓ Non-venomous"}
                    </Text>
                  </View>
                  <Text style={styles.confidenceText}>{scan.confidence}%</Text>
                </View>
              </View>

              <View style={styles.cardRight}>
                <Text style={styles.timeText}>{scan.time}</Text>
                <ChevronRight size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 3. BUTTON */}
      <View
        style={[
          styles.bottomButtonContainer,
          { paddingBottom: insets.bottom + 10 },
        ]}
      >
        <TouchableOpacity
          style={styles.scanButton}
          onPress={onOpenScan}
          activeOpacity={0.8}
        >
          <Camera size={22} color="#fff" />
          <Text style={styles.scanButtonText}>Scan New Snake</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles remain the same...
const styles = StyleSheet.create({
  // ... (Keep your existing styles here)
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 10,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#D1FAE5",
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
  },
  statIconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 6,
  },
  statValue: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  listContentContainer: {},
  listInnerContainer: {
    backgroundColor: "#F9FAFB",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 11,
    color: "#6B7280",
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  confidenceText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 8,
  },
  cardRight: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 8,
  },
  timeText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 24,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    zIndex: 20,
    elevation: 20,
  },
  scanButton: {
    backgroundColor: "#059669",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 10,
  },
});
