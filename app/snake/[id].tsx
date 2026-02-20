import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  MapPin,
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
import { mockScans } from "../../data/snake"; // Ensure this path matches your project

export default function SnakeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Find the specific snake
  const snake = mockScans.find((s) => s.id === id);

  // Handle case where snake is not found
  if (!snake) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: "#fff" }}>Snake not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#059669", marginTop: 10 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. HEADER: Absolute Positioned - Fixed at Top */}
      {/* This container handles the rounded corners via overflow: 'hidden' */}
      <View
        style={[
          styles.headerContainer,
          { height: 330 + insets.top, paddingTop: insets.top },
        ]}
      >
        <Image source={{ uri: snake.image }} style={styles.headerImage} />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradientOverlay}
        />

        {/* Back Button */}
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 10 }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>

        {/* Info Overlay (Bottom of Image) */}
        <View style={styles.infoOverlay}>
          <View style={styles.infoRow}>
            <View style={styles.infoTextContainer}>
              <Text style={styles.snakeName}>{snake.name}</Text>
              <Text style={styles.snakeScientific}>{snake.scientificName}</Text>

              {/* Location Row */}
              <View style={styles.locationRow}>
                <MapPin size={14} color="#34D399" />
                <Text style={styles.locationText}>{snake.location}</Text>
              </View>
            </View>

            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{snake.date}</Text>
              <Text style={styles.timeText}>{snake.time}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. SCROLL VIEW: Slides BEHIND the header */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 330 + insets.top }, // Push content down by header height
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Content Wrapper: Rounded top corners to mask the image bottom */}
        <View style={styles.contentWrapper}>
          {/* Status Card */}
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor:
                  snake.type === "venomous" ? "#FEF2F2" : "#ECFDF5",
                borderColor: snake.type === "venomous" ? "#FECACA" : "#A7F3D0",
              },
            ]}
          >
            <View style={styles.statusHeader}>
              {snake.type === "venomous" ? (
                <AlertTriangle size={24} color="#DC2626" />
              ) : (
                <ShieldCheck size={24} color="#059669" />
              )}
              <View style={styles.statusTextContainer}>
                <Text
                  style={[
                    styles.statusTitle,
                    {
                      color: snake.type === "venomous" ? "#991B1B" : "#065F46",
                    },
                  ]}
                >
                  {snake.type === "venomous"
                    ? "Venomous Snake"
                    : "Non-venomous Snake"}
                </Text>
                <Text
                  style={[
                    styles.statusConfidence,
                    {
                      color: snake.type === "venomous" ? "#B91C1C" : "#047857",
                    },
                  ]}
                >
                  Confidence: {snake.confidence}%
                </Text>
              </View>
            </View>

            {snake.type === "venomous" && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  ⚠️ Warning: Keep a safe distance. Seek immediate medical
                  attention if bitten.
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {snake.description && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Description</Text>
              <Text style={styles.cardText}>{snake.description}</Text>
            </View>
          )}

          {/* Species Traits */}
          {snake.traits && snake.traits.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Species Traits</Text>
              {snake.traits.map((trait, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.listText}>{trait}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Habitat */}
          {snake.habitat && (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <MapPin size={20} color="#059669" />
                <Text style={[styles.cardTitle, { marginLeft: 8 }]}>
                  Habitat
                </Text>
              </View>
              <Text style={styles.cardText}>{snake.habitat}</Text>
            </View>
          )}

          {/* Behavior */}
          {snake.behavior && (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Activity size={20} color="#059669" />
                <Text style={[styles.cardTitle, { marginLeft: 8 }]}>
                  Behavior
                </Text>
              </View>
              <Text style={styles.cardText}>{snake.behavior}</Text>
            </View>
          )}

          {/* Ecological Role */}
          {snake.ecologicalRole && (
            <View style={styles.ecoCard}>
              <Text style={styles.ecoTitle}>🌿 Ecological Role</Text>
              <Text style={styles.ecoText}>{snake.ecologicalRole}</Text>
            </View>
          )}

          {/* Safety Guidelines */}
          {snake.safetyGuidelines && snake.safetyGuidelines.length > 0 && (
            <View
              style={[
                styles.safetyCard,
                {
                  backgroundColor:
                    snake.type === "venomous" ? "#FEF2F2" : "#EFF6FF",
                  borderColor:
                    snake.type === "venomous" ? "#FECACA" : "#BFDBFE",
                },
              ]}
            >
              <Text
                style={[
                  styles.safetyTitle,
                  { color: snake.type === "venomous" ? "#991B1B" : "#1E40AF" },
                ]}
              >
                {snake.type === "venomous"
                  ? "⚠️ Safety Guidelines"
                  : "ℹ️ Safety Guidelines"}
              </Text>
              {snake.safetyGuidelines.map((guideline, index) => (
                <View key={index} style={styles.listItem}>
                  <Text
                    style={[
                      styles.bulletPoint,
                      {
                        color:
                          snake.type === "venomous" ? "#B91C1C" : "#1D4ED8",
                      },
                    ]}
                  >
                    •
                  </Text>
                  <Text
                    style={[
                      styles.listText,
                      {
                        color:
                          snake.type === "venomous" ? "#7F1D1D" : "#1E3A8A",
                      },
                    ]}
                  >
                    {guideline}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Bottom Padding */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },

  // --- HEADER STYLES ---
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10, // Stays on top

    // KEY FIX: Radius and Overflow on the Container
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  headerImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gradientOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
  },
  backButton: {
    position: "absolute",
    left: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 20,
  },
  infoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  infoTextContainer: {
    flex: 1,
  },
  snakeName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  snakeScientific: {
    fontSize: 16,
    color: "#E5E7EB",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#34D399",
    marginLeft: 4,
  },
  dateContainer: {
    alignItems: "flex-end",
  },
  dateText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  timeText: {
    fontSize: 12,
    color: "#D1D5DB",
  },

  // --- SCROLL VIEW STYLES ---
  scrollView: {
    flex: 1,
    zIndex: 1, // Behind header
  },
  scrollContent: {
    // Dynamic paddingTop handled in JSX
  },

  // KEY FIX: Rounded wrapper to cover the image bottom
  contentWrapper: {
    backgroundColor: "#F9FAFB",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 24,
    overflow: "hidden",
    minHeight: "100%",
  },

  // --- CARD STYLES ---
  statusCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusConfidence: {
    fontSize: 14,
    marginTop: 2,
  },
  warningBox: {
    backgroundColor: "#FECACA",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  warningText: {
    color: "#7F1D1D",
    fontSize: 12,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  bulletPoint: {
    fontSize: 14,
    color: "#059669",
    marginRight: 8,
    fontWeight: "bold",
  },
  listText: {
    fontSize: 14,
    color: "#4B5563",
    flex: 1,
  },

  // Special Cards
  ecoCard: {
    backgroundColor: "#D1FAE5",
    borderColor: "#A7F3D0",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  ecoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 8,
  },
  ecoText: {
    fontSize: 14,
    color: "#065F46",
    lineHeight: 20,
  },

  safetyCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
});
