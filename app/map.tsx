import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ArrowLeft, MapPin } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAllScans, type ScanRecord } from "../data/sqlite";

const { width, height } = Dimensions.get("window");

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load scans from database
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

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadScans();
    }, [loadScans]),
  );

  // Filter scans with valid coordinates
  const validScans = useMemo(() => {
    return scans.filter(
      (s) => s.latitude != null && s.longitude != null,
    ) as (ScanRecord & { latitude: number; longitude: number })[];
  }, [scans]);

  const isVenomous = (scan: ScanRecord) => {
    return (
      scan.venomType.toLowerCase().includes("venomous") &&
      !scan.venomType.toLowerCase().includes("non")
    );
  };

  // Calculate initial region based on valid scans
  const initialRegion = useMemo(() => {
    if (validScans.length === 0) {
      return {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 50,
        longitudeDelta: 50,
      };
    }

    const latitudes = validScans.map((s) => s.latitude);
    const longitudes = validScans.map((s) => s.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);

    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    const latDelta = Math.max((maxLat - minLat) * 1.5, 0.01);
    const lonDelta = Math.max((maxLon - minLon) * 1.5, 0.01);

    return {
      latitude: centerLat,
      longitude: centerLon,
      latitudeDelta: latDelta,
      longitudeDelta: lonDelta,
    };
  }, [validScans]);

  const goBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
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

      {/* Map or Empty State */}
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptySubtitle}>Loading map data...</Text>
        </View>
      ) : validScans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MapPin size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No location data available</Text>
          <Text style={styles.emptySubtitle}>
            Scan snakes with location enabled to see them on the map
          </Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton
          showsCompass
          showsScale
        >
          {validScans.map((scan) => {
            const venomous = isVenomous(scan);
            return (
              <Marker
                key={scan.id}
                coordinate={{
                  latitude: scan.latitude,
                  longitude: scan.longitude,
                }}
                pinColor={venomous ? "#DC2626" : "#059669"}
              >
                <Callout tooltip>
                  <View style={styles.calloutContainer}>
                    <Image
                      source={{ uri: scan.imageUri }}
                      style={styles.calloutImage}
                    />
                    <View style={styles.calloutContent}>
                      <Text style={styles.calloutTitle}>{scan.name}</Text>
                      <Text
                        style={[
                          styles.calloutType,
                          { color: venomous ? "#DC2626" : "#059669" },
                        ]}
                      >
                        {venomous ? "⚠️ Venomous" : "✓ Non-venomous"}
                      </Text>
                      <Text style={styles.calloutCoords}>
                        {scan.latitude.toFixed(5)}, {scan.longitude.toFixed(5)}
                      </Text>
                      <Text style={styles.calloutDate}>
                        {new Date(scan.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
      )}

      {/* Legend - only show when there are valid scans */}
      {!isLoading && validScans.length > 0 && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#DC2626" }]} />
            <Text style={styles.legendText}>Venomous</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#059669" }]} />
            <Text style={styles.legendText}>Non-venomous</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#059669",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#D1FAE5",
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  map: {
    flex: 1,
    width: width,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111827",
    padding: 24,
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
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "#111827",
    borderTopWidth: 1,
    borderTopColor: "#374151",
    gap: 24,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  calloutContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  calloutImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#E5E7EB",
  },
  calloutContent: {
    gap: 2,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  calloutType: {
    fontSize: 14,
    fontWeight: "600",
  },
  calloutCoords: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: "monospace",
    marginTop: 4,
  },
  calloutDate: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
});
