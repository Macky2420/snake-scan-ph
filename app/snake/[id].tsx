import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  MapPin,
  Microscope,
  Shield,
  ShieldCheck,
  Trees,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScanRecord = {
  id: number;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  imageUri: string;
  status: "snake" | "not_snake";
  snakeKey: string | null;
  name: string;
  venomType: string;
  confidence: number;
};

type SnakeInfo = {
  common_name: string;
  scientific_name: string;
  venom_type: string;
  warning: string;
  description: string;
  traits: string[];
  habitat: string;
  behavior: string;
  ecological_role: string;
  safety: string[];
};

const snakeInfoMap = require("../../data/snake.json") as Record<
  string,
  SnakeInfo
>;

export default function SnakeDetailScreen() {
  const { id, data } = useLocalSearchParams<{
    id?: string;
    data?: string;
  }>();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [scan, setScan] = useState<ScanRecord | null>(null);
  const [snakeInfo, setSnakeInfo] = useState<SnakeInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (!data || typeof data !== "string") {
        setScan(null);
        setSnakeInfo(null);
        setLoading(false);
        return;
      }

      const parsedScan = JSON.parse(data) as ScanRecord;
      setScan(parsedScan);

      if (parsedScan.snakeKey && snakeInfoMap[parsedScan.snakeKey]) {
        setSnakeInfo(snakeInfoMap[parsedScan.snakeKey]);
      } else {
        setSnakeInfo(null);
      }
    } catch (error) {
      console.error("Failed to parse scan data:", error);
      setScan(null);
      setSnakeInfo(null);
    } finally {
      setLoading(false);
    }
  }, [data]);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCoordinates = (lat: number | null, lon: number | null) => {
    if (lat == null || lon == null) return "Location not available";
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={{ color: "#fff", marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  if (!scan) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <AlertTriangle size={48} color="#DC2626" />
        <Text style={{ color: "#fff", marginTop: 12 }}>Scan not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: "#059669", fontSize: 16 }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isVenomous =
    scan.venomType.toLowerCase().includes("venomous") &&
    !scan.venomType.toLowerCase().includes("non");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View
        style={[
          styles.headerContainer,
          { height: 330 + insets.top, paddingTop: insets.top },
        ]}
      >
        <Image source={{ uri: scan.imageUri }} style={styles.headerImage} />

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradientOverlay}
        />

        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 10 }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>

        <View style={styles.infoOverlay}>
          <View style={styles.infoRow}>
            <View style={styles.infoTextContainer}>
              <Text style={styles.snakeName}>{scan.name}</Text>

              {snakeInfo ? (
                <Text style={styles.snakeScientific}>
                  {snakeInfo.scientific_name}
                </Text>
              ) : null}

              <View style={styles.locationRow}>
                <MapPin size={14} color="#34D399" />
                <Text style={styles.locationText}>
                  {formatCoordinates(scan.latitude, scan.longitude)}
                </Text>
              </View>
            </View>

            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{formatDate(scan.timestamp)}</Text>
              <Text style={styles.timeText}>{formatTime(scan.timestamp)}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 330 + insets.top },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: isVenomous ? "#FEF2F2" : "#ECFDF5",
                borderColor: isVenomous ? "#FECACA" : "#A7F3D0",
              },
            ]}
          >
            <View style={styles.statusHeader}>
              {isVenomous ? (
                <AlertTriangle size={24} color="#DC2626" />
              ) : (
                <ShieldCheck size={24} color="#059669" />
              )}

              <View style={styles.statusTextContainer}>
                <Text
                  style={[
                    styles.statusTitle,
                    { color: isVenomous ? "#991B1B" : "#065F46" },
                  ]}
                >
                  {scan.venomType}
                </Text>

                <Text
                  style={[
                    styles.statusConfidence,
                    { color: isVenomous ? "#B91C1C" : "#047857" },
                  ]}
                >
                  AI Confidence: {scan.confidence.toFixed(1)}%
                </Text>
              </View>
            </View>

            {isVenomous && snakeInfo?.warning ? (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>⚠️ {snakeInfo.warning}</Text>
              </View>
            ) : null}
          </View>

          {snakeInfo?.description ? (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Microscope size={20} color="#059669" />
                <Text style={[styles.cardTitle, { marginLeft: 8 }]}>
                  Description
                </Text>
              </View>
              <Text style={styles.cardText}>{snakeInfo.description}</Text>
            </View>
          ) : null}

          {snakeInfo?.traits?.length ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Identifying Traits</Text>
              {snakeInfo.traits.map((trait, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.listText}>{trait}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {snakeInfo?.habitat ? (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Trees size={20} color="#059669" />
                <Text style={[styles.cardTitle, { marginLeft: 8 }]}>
                  Habitat
                </Text>
              </View>
              <Text style={styles.cardText}>{snakeInfo.habitat}</Text>
            </View>
          ) : null}

          {snakeInfo?.behavior ? (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Brain size={20} color="#059669" />
                <Text style={[styles.cardTitle, { marginLeft: 8 }]}>
                  Behavior
                </Text>
              </View>
              <Text style={styles.cardText}>{snakeInfo.behavior}</Text>
            </View>
          ) : null}

          {snakeInfo?.ecological_role ? (
            <View style={styles.ecoCard}>
              <Text style={styles.ecoTitle}>🌿 Ecological Role</Text>
              <Text style={styles.ecoText}>{snakeInfo.ecological_role}</Text>
            </View>
          ) : null}

          {snakeInfo?.safety?.length ? (
            <View
              style={[
                styles.safetyCard,
                {
                  backgroundColor: isVenomous ? "#FEF2F2" : "#EFF6FF",
                  borderColor: isVenomous ? "#FECACA" : "#BFDBFE",
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <Shield size={20} color={isVenomous ? "#DC2626" : "#1D4ED8"} />
                <Text
                  style={[
                    styles.safetyTitle,
                    {
                      color: isVenomous ? "#991B1B" : "#1E40AF",
                      marginLeft: 8,
                    },
                  ]}
                >
                  Safety Guidelines
                </Text>
              </View>

              {snakeInfo.safety.map((guideline, index) => (
                <View key={index} style={styles.listItem}>
                  <Text
                    style={[
                      styles.bulletPoint,
                      { color: isVenomous ? "#B91C1C" : "#1D4ED8" },
                    ]}
                  >
                    •
                  </Text>
                  <Text
                    style={[
                      styles.listText,
                      { color: isVenomous ? "#7F1D1D" : "#1E3A8A" },
                    ]}
                  >
                    {guideline}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },

  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
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
    borderRadius: 12,
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
  infoTextContainer: { flex: 1 },
  snakeName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  snakeScientific: {
    fontSize: 16,
    color: "#E5E7EB",
    fontStyle: "italic",
    marginBottom: 4,
  },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  locationText: {
    fontSize: 14,
    color: "#34D399",
    marginLeft: 4,
    fontFamily: "monospace",
  },
  dateContainer: { alignItems: "flex-end" },
  dateText: { fontSize: 14, color: "#fff", fontWeight: "600" },
  timeText: { fontSize: 12, color: "#D1D5DB" },

  scrollView: { flex: 1, zIndex: 1 },
  scrollContent: {},
  contentWrapper: {
    backgroundColor: "#F9FAFB",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 24,
    minHeight: "100%",
  },

  statusCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    marginBottom: 16,
  },
  statusHeader: { flexDirection: "row", alignItems: "center" },
  statusTextContainer: { marginLeft: 12, flex: 1 },
  statusTitle: { fontSize: 16, fontWeight: "bold" },
  statusConfidence: { fontSize: 14, marginTop: 2 },
  warningBox: {
    backgroundColor: "#FECACA",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  warningText: { color: "#7F1D1D", fontSize: 12, fontWeight: "600" },

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
  cardText: { fontSize: 14, color: "#4B5563", lineHeight: 20 },
  listItem: { flexDirection: "row", marginBottom: 6 },
  bulletPoint: {
    fontSize: 14,
    color: "#059669",
    marginRight: 8,
    fontWeight: "bold",
  },
  listText: { fontSize: 14, color: "#4B5563", flex: 1 },

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
  ecoText: { fontSize: 14, color: "#065F46", lineHeight: 20 },

  safetyCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  safetyTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
});
