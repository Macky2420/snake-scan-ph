import { Camera, MapView, MarkerView } from "@maplibre/maplibre-react-native";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ArrowLeft, MapPin, WifiOff, X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAllScans, type ScanRecord } from "../data/sqlite";

const { width } = Dimensions.get("window");
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

interface MarkerData extends ScanRecord {
  latitude: number;
  longitude: number;
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);
  const [selectedScan, setSelectedScan] = useState<MarkerData | null>(null);

  const [popupAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = !!state.isConnected && !!state.isInternetReachable;
      setIsConnected(connected);
      setShowOfflineWarning(!connected);
    });

    return () => unsubscribe();
  }, []);

  const loadScans = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllScans();
      setScans(data);
    } catch (error) {
      console.error("MAP: load scans error =", error);
      setScans([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadScans();
    }, [loadScans]),
  );

  const validScans = useMemo(() => {
    return scans.filter(
      (s) => s.latitude != null && s.longitude != null,
    ) as MarkerData[];
  }, [scans]);

  const isVenomous = (scan: ScanRecord) => {
    const venomType = scan.venomType?.toLowerCase() ?? "";
    return venomType.includes("venomous") && !venomType.includes("non");
  };

  const getDangerLevel = (scan: ScanRecord) => {
    const venomType = scan.venomType?.toLowerCase() ?? "";
    if (venomType.includes("highly")) return "Highly Dangerous";
    if (venomType.includes("venomous") && !venomType.includes("non")) {
      return "Venomous";
    }
    return "Non-venomous";
  };

  const getSnakeDisplayName = (scan: Partial<ScanRecord>) => {
    const candidates = [
      (scan as any).name,
      (scan as any).snakeName,
      (scan as any).label,
      (scan as any).predictedClass,
      (scan as any).prediction,
    ];

    const found = candidates.find(
      (value) => typeof value === "string" && value.trim().length > 0,
    );

    return found ?? "Unknown Snake";
  };

  const initialCenter = useMemo(() => {
    if (validScans.length === 0) {
      return [121.774, 12.8797] as [number, number];
    }

    const latitudes = validScans.map((s) => s.latitude);
    const longitudes = validScans.map((s) => s.longitude);

    const centerLat = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
    const centerLon = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;

    return [centerLon, centerLat] as [number, number];
  }, [validScans]);

  const goBack = () => {
    router.back();
  };

  const dismissWarning = () => {
    setShowOfflineWarning(false);
  };

  const handleMarkerPress = (scan: MarkerData) => {
    setSelectedScan(scan);
    Animated.spring(popupAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  };

  const closePopup = () => {
    Animated.timing(popupAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSelectedScan(null));
  };

  const popupTranslateY = popupAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const popupOpacity = popupAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Snake Locations</Text>
          <Text style={styles.headerSubtitle}>
            {isLoading
              ? "Loading..."
              : `${validScans.length} location${validScans.length !== 1 ? "s" : ""} mapped`}
          </Text>
        </View>

        <View style={styles.placeholder} />
      </View>

      {showOfflineWarning && (
        <View style={styles.warningBanner}>
          <WifiOff size={18} color="#fff" />
          <Text style={styles.warningText}>
            No internet connection. Map requires online tiles.
          </Text>
          <TouchableOpacity onPress={dismissWarning} style={styles.dismissBtn}>
            <X size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <View style={styles.loadingPulse}>
            <MapPin size={48} color="#059669" />
          </View>
          <Text style={styles.emptySubtitle}>Loading map data...</Text>
        </View>
      ) : validScans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <MapPin size={64} color="#4B5563" />
          </View>
          <Text style={styles.emptyTitle}>No location data available</Text>
          <Text style={styles.emptySubtitle}>
            Scan snakes with location enabled to see them on the map
          </Text>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          {isConnected ? (
            <>
              <MapView style={styles.map} mapStyle={MAP_STYLE}>
                <Camera
                  defaultSettings={{
                    centerCoordinate: initialCenter,
                    zoomLevel: validScans.length === 1 ? 12 : 5,
                  }}
                />

                {validScans.map((scan) => {
                  const venomous = isVenomous(scan);
                  const markerColor = venomous ? "#DC2626" : "#059669";

                  return (
                    <MarkerView
                      key={String(scan.id)}
                      coordinate={[scan.longitude, scan.latitude]}
                    >
                      <TouchableOpacity
                        onPress={() => handleMarkerPress(scan)}
                        activeOpacity={0.8}
                        style={styles.minimalMarkerWrap}
                      >
                        <View
                          style={[
                            styles.minimalMarker,
                            { backgroundColor: markerColor },
                          ]}
                        />
                      </TouchableOpacity>
                    </MarkerView>
                  );
                })}
              </MapView>

              {selectedScan && (
                <Animated.View
                  style={[
                    styles.popupContainer,
                    {
                      opacity: popupOpacity,
                      transform: [{ translateY: popupTranslateY }],
                    },
                  ]}
                >
                  <View style={styles.popup}>
                    <TouchableOpacity
                      onPress={closePopup}
                      style={styles.popupClose}
                    >
                      <X size={16} color="#6B7280" />
                    </TouchableOpacity>

                    <View style={styles.popupHeader}>
                      <View
                        style={[
                          styles.popupIndicator,
                          {
                            backgroundColor: isVenomous(selectedScan)
                              ? "#DC2626"
                              : "#059669",
                          },
                        ]}
                      />
                      <Text style={styles.popupTitle} numberOfLines={1}>
                        {getSnakeDisplayName(selectedScan)}
                      </Text>
                    </View>

                    <View style={styles.popupContent}>
                      <View style={styles.popupRow}>
                        <Text style={styles.popupLabel}>Danger Level:</Text>
                        <Text
                          style={[
                            styles.popupValue,
                            {
                              color: isVenomous(selectedScan)
                                ? "#DC2626"
                                : "#059669",
                            },
                          ]}
                        >
                          {getDangerLevel(selectedScan)}
                        </Text>
                      </View>

                      <View style={styles.popupRow}>
                        <Text style={styles.popupLabel}>Date:</Text>
                        <Text style={styles.popupValue}>
                          {selectedScan.timestamp
                            ? new Date(
                                selectedScan.timestamp,
                              ).toLocaleDateString()
                            : "Unknown"}
                        </Text>
                      </View>

                      <View style={styles.popupRow}>
                        <Text style={styles.popupLabel}>Location:</Text>
                        <Text style={styles.popupValue} numberOfLines={1}>
                          {selectedScan.latitude.toFixed(4)},{" "}
                          {selectedScan.longitude.toFixed(4)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              )}
            </>
          ) : (
            <View style={styles.offlineContainer}>
              <View style={styles.offlineIconContainer}>
                <WifiOff size={64} color="#4B5563" />
              </View>
              <Text style={styles.offlineTitle}>No internet connection</Text>
              <Text style={styles.offlineSubtitle}>
                This map uses MapLibre with online tiles and can only be viewed
                when online.
              </Text>
            </View>
          )}

          <View style={styles.internetIndicator}>
            <View
              style={[
                styles.dot,
                { backgroundColor: isConnected ? "#10B981" : "#EF4444" },
              ]}
            />
            <Text style={styles.internetText}>
              {isConnected ? "Online" : "Offline"}
            </Text>
          </View>
        </View>
      )}

      {!isLoading && validScans.length > 0 && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDotMinimal, { backgroundColor: "#DC2626" }]}
            />
            <Text style={styles.legendText}>Venomous</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDotMinimal, { backgroundColor: "#059669" }]}
            />
            <Text style={styles.legendText}>Non-venomous</Text>
          </View>
        </View>
      )}

      <View style={styles.footerNote}>
        <Text style={styles.footerText}>
          MapLibre + OpenFreeMap • No API key required
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    backgroundColor: "#059669",
    borderBottomWidth: 1,
    borderBottomColor: "#047857",
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#A7F3D0",
    marginTop: 2,
    fontWeight: "500",
  },
  placeholder: {
    width: 40,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC2626",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  warningText: {
    flex: 1,
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  dismissBtn: {
    padding: 4,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
    width,
  },
  minimalMarkerWrap: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  minimalMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 3,
  },
  popupContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  popup: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  popupClose: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 1,
  },
  popupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingRight: 24,
  },
  popupIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 10,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  popupContent: {
    gap: 8,
  },
  popupRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  popupLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  popupValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
    maxWidth: "60%",
  },
  internetIndicator: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  internetText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
    padding: 24,
  },
  loadingPulse: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(5, 150, 105, 0.1)",
    marginBottom: 16,
  },
  emptyIconContainer: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: "rgba(75, 85, 99, 0.2)",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
  },
  offlineContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
    padding: 24,
  },
  offlineIconContainer: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: "rgba(75, 85, 99, 0.2)",
    marginBottom: 8,
  },
  offlineTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginTop: 16,
  },
  offlineSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "#1E293B",
    borderTopWidth: 1,
    borderTopColor: "#334155",
    gap: 32,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDotMinimal: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  legendText: {
    fontSize: 14,
    color: "#E2E8F0",
    fontWeight: "500",
  },
  footerNote: {
    backgroundColor: "#0F172A",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
  },
  footerText: {
    color: "#64748B",
    fontSize: 11,
    textAlign: "center",
    fontWeight: "500",
  },
});
