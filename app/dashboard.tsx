import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    AlertTriangle,
    Camera,
    ChevronRight,
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

// --- Mock Data ---
export type SnakeScan = {
  id: string;
  name: string;
  scientificName: string;
  type: "venomous" | "non-venomous";
  image: string;
  date: string;
  time: string;
  confidence: number;
  location: string;
  // ... other fields exist in your data but are not displayed in the list card
  [key: string]: any;
};

const mockScans: SnakeScan[] = [
  {
    id: "1",
    name: "Philippine Cobra",
    scientificName: "Naja philippinensis",
    type: "venomous",
    image:
      "https://images.unsplash.com/photo-1638855370496-1ec25682adbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2JyYSUyMHNuYWtlfGVufDF8fHx8MTc2NTQ5ODk3NHww&ixlib=rb-4.1.0&q=80&w=1080",
    date: "Dec 11, 2025",
    time: "2:30 PM",
    confidence: 94,
    location: "Luzon, Philippines",
    description:
      "The Philippine Cobra is one of the most venomous snakes in the Philippines...",
    // ... (rest of your mock fields)
  },
  {
    id: "2",
    name: "Reticulated Python",
    scientificName: "Malayopython reticulatus",
    type: "non-venomous",
    image:
      "https://images.unsplash.com/photo-1529978515127-dba8c80bbf05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxweXRob24lMjBzbmFrZXxlbnwxfHx8fDE3NjU0OTg5NzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    date: "Dec 10, 2025",
    time: "10:15 AM",
    confidence: 98,
    location: "Mindanao, Philippines",
    description:
      "The Reticulated Python is one of the world's longest snakes...",
  },
  {
    id: "3",
    name: "Wagler's Pit Viper",
    scientificName: "Tropidolaemus wagleri",
    type: "venomous",
    image:
      "https://images.unsplash.com/photo-1637772824964-14910def2dac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHNuYWtlJTIwY2xvc2V8ZW58MXx8fHwxNzY1NDk4OTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
    date: "Dec 9, 2025",
    time: "4:45 PM",
    confidence: 96,
    location: "Palawan, Philippines",
    description: "Also known as the Philippine Pit Viper...",
  },
  {
    id: "4",
    name: "Philippine Rat Snake",
    scientificName: "Coelognathus erythrurus",
    type: "non-venomous",
    image:
      "https://images.unsplash.com/photo-1670806507392-49c3d52d0266?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZW5vbW91cyUyMHNuYWtlfGVufDF8fHx8MTc2NTQ5ODk3M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    date: "Dec 8, 2025",
    time: "11:20 AM",
    confidence: 92,
    location: "Cebu, Philippines",
    description:
      "The Philippine Rat Snake is a common, beneficial non-venomous snake...",
  },
];

// --- Component ---
export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Calculate Stats
  const venomousCount = mockScans.filter((s) => s.type === "venomous").length;
  const nonVenomousCount = mockScans.filter(
    (s) => s.type === "non-venomous",
  ).length;

  const onViewSnake = (snake: SnakeScan) => {
    // In a real app, you might pass the ID via params
    console.log("View snake:", snake.name);
  };

  const onOpenScan = () => {
    console.log("Open Camera Scanner");
  };

  const onOpenSettings = () => {
    console.log("Open Settings");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }} // Space for bottom button
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <LinearGradient
          colors={["#059669", "#0d9488"]}
          style={[
            styles.header,
            { paddingTop: insets.top + 10, paddingBottom: 32 },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Top Row */}
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

          {/* Stats Cards */}
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

        {/* Recent Scans List */}
        <View style={styles.listContainer}>
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

      {/* Bottom Scan Button */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
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
    padding: 16,
  },
  statIconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  listContainer: {
    padding: 24,
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
    marginBottom: 6,
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
