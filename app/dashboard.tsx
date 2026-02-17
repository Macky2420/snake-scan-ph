import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

// --- Mock Data (Expanded to 10 items) ---
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
  [key: string]: any;
};

const mockScans: SnakeScan[] = [
  {
    id: "1",
    name: "Philippine Cobra",
    scientificName: "Naja philippinensis",
    type: "venomous",
    image: "https://images.unsplash.com/photo-1638855370496-1ec25682adbe?w=400",
    date: "Dec 11, 2025",
    time: "2:30 PM",
    confidence: 94,
    location: "Quezon City, Luzon",
  },
  {
    id: "2",
    name: "Reticulated Python",
    scientificName: "Malayopython reticulatus",
    type: "non-venomous",
    image: "https://images.unsplash.com/photo-1529978515127-dba8c80bbf05?w=400",
    date: "Dec 10, 2025",
    time: "10:15 AM",
    confidence: 98,
    location: "Davao City, Mindanao",
  },
  {
    id: "3",
    name: "Wagler's Pit Viper",
    scientificName: "Tropidolaemus wagleri",
    type: "venomous",
    image: "https://images.unsplash.com/photo-1637772824964-14910def2dac?w=400",
    date: "Dec 9, 2025",
    time: "4:45 PM",
    confidence: 96,
    location: "Puerto Princesa, Palawan",
  },
  {
    id: "4",
    name: "Philippine Rat Snake",
    scientificName: "Coelognathus erythrurus",
    type: "non-venomous",
    image: "https://images.unsplash.com/photo-1670806507392-49c3d52d0266?w=400",
    date: "Dec 8, 2025",
    time: "11:20 AM",
    confidence: 92,
    location: "Cebu City, Cebu",
  },
  {
    id: "5",
    name: "King Cobra",
    scientificName: "Ophiophagus hannah",
    type: "venomous",
    image: "https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=400",
    date: "Dec 7, 2025",
    time: "9:00 AM",
    confidence: 89,
    location: "Banaue, Ifugao",
  },
  {
    id: "6",
    name: "Banded Krait",
    scientificName: "Bungarus fasciatus",
    type: "venomous",
    image: "https://images.unsplash.com/photo-1585095595205-e68428a9e205?w=400",
    date: "Dec 6, 2025",
    time: "6:15 PM",
    confidence: 91,
    location: "Tagaytay, Cavite",
  },
  {
    id: "7",
    name: "Sunbeam Snake",
    scientificName: "Xenopeltis unicolor",
    type: "non-venomous",
    image: "https://images.unsplash.com/photo-1570741066052-817c6de995c8?w=400",
    date: "Dec 5, 2025",
    time: "7:30 PM",
    confidence: 85,
    location: "Iloilo City, Panay",
  },
  {
    id: "8",
    name: "Malayan Pit Viper",
    scientificName: "Calloselasma rhodostoma",
    type: "venomous",
    image: "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400",
    date: "Dec 4, 2025",
    time: "5:00 PM",
    confidence: 97,
    location: "Boracay, Aklan",
  },
  {
    id: "9",
    name: "Oriental Whip Snake",
    scientificName: "Ahaetulla prasina",
    type: "non-venomous",
    image: "https://images.unsplash.com/photo-1578950435899-d1c1bf932ab2?w=400",
    date: "Dec 3, 2025",
    time: "8:45 AM",
    confidence: 88,
    location: "Antipolo, Rizal",
  },
  {
    id: "10",
    name: "Red-tailed Bamboo Ratsnake",
    scientificName: "Oreocryptophis porphyraceus",
    type: "non-venomous",
    image: "https://images.unsplash.com/photo-1583212235753-4c668f6e698f?w=400",
    date: "Dec 2, 2025",
    time: "3:10 PM",
    confidence: 90,
    location: "Baguio City, Benguet",
  },
];

// --- Component ---
export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const venomousCount = mockScans.filter((s) => s.type === "venomous").length;
  const nonVenomousCount = mockScans.filter(
    (s) => s.type === "non-venomous",
  ).length;

  const onViewSnake = (snake: SnakeScan) => {
    console.log("View snake:", snake.name);
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

      {/* 1. HEADER: Absolute Positioned - Stays Fixed at Top */}
      <LinearGradient
        colors={["#059669", "#0d9488"]}
        style={[
          styles.header,
          { paddingTop: insets.top + 10, height: 200 + insets.top }, // Fixed height
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

      {/* 2. LIST: Scroll View - Positioned to scroll BEHIND header */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.listContentContainer,
          {
            paddingTop: 210 + insets.top, // Header height + some overlap
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

                {/* Location Row */}
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

      {/* 3. BUTTON: Floating Bottom Button */}
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

  // Header Styles (Absolute Positioned)
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 10, // Ensure it stays on top
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
    alignItems: "center", // <--- ADD THIS to center items horizontally
  },
  statIconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "center", // <--- ADD THIS to center the icon/label row
  },
  statLabel: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 6,
  },
  statValue: {
    fontSize: 35, // <--- CHANGE from 24 to 32 (or 30)
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center", // <--- ADD THIS
  },

  // ScrollView Styles
  scrollView: {
    flex: 1,
    zIndex: 1, // Below header
  },
  listContentContainer: {
    // Dynamic paddingTop set in JSX
  },
  listInnerContainer: {
    backgroundColor: "#F9FAFB", // Background for the list area
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    // Shadow to lift it slightly visually
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

  // Card Styles
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
    marginBottom: 4, // Reduced margin to fit location
  },
  // Location Styles
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

  // Button Styles
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
    zIndex: 20, // <--- ADD THIS LINE (Higher than ScrollView's 1 and Header's 10)
    elevation: 20, // <--- ADD THIS for Android support
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
