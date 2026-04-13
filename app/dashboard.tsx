import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  Camera,
  ChevronRight,
  History,
  Info,
  Map as MapIcon,
  MapPin,
  ShieldCheck,
  Trash2,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { deleteScan, getAllScans, type ScanRecord } from "../data/sqlite";

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isLoadingRef = useRef(false);

  const loadScans = useCallback(async (showLoader = true) => {
    if (isLoadingRef.current) return;

    console.log("DASHBOARD: loadScans called, showLoader =", showLoader);
    isLoadingRef.current = true;

    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const data = await getAllScans();
      console.log("DASHBOARD: loaded scans =", data.length);
      setScans(data);
    } catch (error) {
      console.error("DASHBOARD: load scans error =", error);
      setScans([]);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
      console.log("DASHBOARD: loadScans finished");
    }
  }, []);

  useEffect(() => {
    loadScans(true);
  }, [loadScans]);

  useFocusEffect(
    useCallback(() => {
      console.log("DASHBOARD: screen focused → reload scans");
      loadScans(false);
    }, [loadScans]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScans(false);
    setRefreshing(false);
  };

  const handleDeleteScan = (scan: ScanRecord) => {
    Alert.alert("Delete Scan", `Delete "${scan.name}" from recent scans?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteScan(scan.id);
            setScans((prev) => prev.filter((item) => item.id !== scan.id));
          } catch (error) {
            console.error("DASHBOARD: delete scan error =", error);
            Alert.alert("Error", "Failed to delete scan.");
          }
        },
      },
    ]);
  };

  const venomousCount = scans.filter(
    (s) =>
      s.venomType.toLowerCase().includes("venomous") &&
      !s.venomType.toLowerCase().includes("non"),
  ).length;

  const nonVenomousCount = scans.filter(
    (s) =>
      s.venomType.toLowerCase().includes("non-venomous") ||
      s.status === "not_snake",
  ).length;

  const onViewSnake = (scan: ScanRecord) => {
    router.push({
      pathname: "/snake/[id]",
      params: {
        id: scan.id.toString(),
        data: JSON.stringify(scan),
      },
    });
  };

  const onOpenScan = () => {
    router.push("/scan");
  };

  const onOpenMap = () => {
    router.push("/map");
  };

  const onOpenAbout = () => {
    router.push("/about");
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const formatCoordinates = (lat: number | null, lon: number | null) => {
    if (lat == null || lon == null) return "No location";
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  };

  const renderRightActions = () => {
    return (
      <RectButton style={styles.deleteAction}>
        <Trash2 size={22} color="#fff" />
        <Text style={styles.deleteText}>Delete</Text>
      </RectButton>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

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

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={onOpenMap} style={styles.iconButton}>
              <MapIcon size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={onOpenAbout} style={styles.iconButton}>
              <Info size={20} color="#fff" />
            </TouchableOpacity>
          </View>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#059669"
            colors={["#059669"]}
          />
        }
      >
        <View style={styles.listInnerContainer}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listTitle}>Recent Scans</Text>
            <Text style={styles.scanCount}>{scans.length} total</Text>
          </View>

          {isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptySubtitle}>Loading scans...</Text>
            </View>
          ) : scans.length === 0 ? (
            <View style={styles.emptyState}>
              <History size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No Scans Yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap the button below to scan your first snake
              </Text>
            </View>
          ) : (
            scans.map((scan) => (
              <Swipeable
                key={scan.id}
                renderRightActions={renderRightActions}
                onSwipeableOpen={() => handleDeleteScan(scan)}
                overshootRight={false}
              >
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => onViewSnake(scan)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: scan.imageUri }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />

                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {scan.name}
                    </Text>
                    <Text style={styles.cardSubtitle}>{scan.venomType}</Text>

                    <View style={styles.locationRow}>
                      <MapPin size={12} color="#6B7280" />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {formatCoordinates(scan.latitude, scan.longitude)}
                      </Text>
                    </View>

                    <View style={styles.cardFooter}>
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor:
                              scan.venomType
                                .toLowerCase()
                                .includes("venomous") &&
                              !scan.venomType.toLowerCase().includes("non")
                                ? "#FEE2E2"
                                : "#D1FAE5",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            {
                              color:
                                scan.venomType
                                  .toLowerCase()
                                  .includes("venomous") &&
                                !scan.venomType.toLowerCase().includes("non")
                                  ? "#991B1B"
                                  : "#065F46",
                            },
                          ]}
                        >
                          {scan.venomType.toLowerCase().includes("venomous") &&
                          !scan.venomType.toLowerCase().includes("non")
                            ? "⚠️ Venomous"
                            : "✓ Safe"}
                        </Text>
                      </View>

                      <Text style={styles.confidenceText}>
                        {scan.confidence.toFixed(1)}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardRight}>
                    <Text style={styles.timeText}>
                      {formatTime(scan.timestamp)}
                    </Text>
                    <ChevronRight size={20} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              </Swipeable>
            ))
          )}
        </View>
      </ScrollView>

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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
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
    minHeight: 400,
  },
  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  scanCount: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
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
    fontFamily: "monospace",
    flex: 1,
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
  deleteAction: {
    width: 88,
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
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
