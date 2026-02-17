import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Camera, Image as ImageIcon, X, Zap } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScanResult = {
  name: string;
  type: "venomous" | "non-venomous";
  confidence: number;
};

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  // State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  // Animation Effect
  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isScanning, pulseAnim]);

  const handleClose = () => {
    if (scanResult) {
      setScanResult(null);
    } else {
      router.back();
    }
  };

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setScanResult({
        name: "Green Tree Python",
        type: "non-venomous",
        confidence: 96,
      });
      setIsScanning(false);
    }, 2500);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        skipProcessing: true,
      });
      console.log("Photo taken:", photo.uri);
      simulateScan();
    } catch (e) {
      console.error("Camera error:", e);
    }
  };

  const handleUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      simulateScan();
    }
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        {/* Fix: Added styles.content here */}
        <View style={[styles.content, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
          >
            <X color="#fff" size={24} />
          </TouchableOpacity>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>
              Camera permission is required to scan snakes.
            </Text>
            <TouchableOpacity
              style={styles.permissionBtn}
              onPress={requestPermission}
            >
              <Text style={styles.permissionBtnText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <Text style={styles.headerTitle}>Scan Snake</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <X color="#fff" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.contentLayer}>
            {!scanResult && !isScanning && (
              <>
                <View style={styles.placeholderContainer}>
                  <View style={styles.iconCircle}>
                    <Camera size={40} color="#34D399" />
                  </View>
                  <Text style={styles.instructionTitle}>
                    Position the snake in frame
                  </Text>
                  <Text style={styles.instructionSub}>
                    Make sure the snake is clearly visible and well-lit
                  </Text>
                </View>

                <View style={styles.scanFrameContainer}>
                  <View style={styles.cornerTL} />
                  <View style={styles.cornerTR} />
                  <View style={styles.cornerBL} />
                  <View style={styles.cornerBR} />
                </View>
              </>
            )}

            {isScanning && (
              <View style={styles.placeholderContainer}>
                <Animated.View
                  style={[
                    styles.iconCircle,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <Zap size={40} color="#34D399" />
                </Animated.View>
                <ActivityIndicator
                  size="large"
                  color="#34D399"
                  style={{ marginTop: 20 }}
                />
                <Text style={styles.instructionTitle}>Analyzing...</Text>
                <Text style={styles.instructionSub}>
                  AI is identifying the snake species
                </Text>
              </View>
            )}

            {scanResult && (
              <View style={styles.resultContainer}>
                <View
                  style={[
                    styles.resultIcon,
                    {
                      backgroundColor:
                        scanResult.type === "venomous" ? "#DC2626" : "#059669",
                    },
                  ]}
                >
                  <Text style={styles.resultEmoji}>
                    {scanResult.type === "venomous" ? "⚠️" : "✓"}
                  </Text>
                </View>

                <Text style={styles.resultName}>{scanResult.name}</Text>

                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        scanResult.type === "venomous"
                          ? "rgba(220, 38, 38, 0.2)"
                          : "rgba(5, 150, 105, 0.2)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color:
                          scanResult.type === "venomous"
                            ? "#FCA5A5"
                            : "#6EE7B7",
                      },
                    ]}
                  >
                    {scanResult.type === "venomous"
                      ? "Venomous"
                      : "Non-venomous"}
                  </Text>
                </View>

                <Text style={styles.confidenceText}>
                  Confidence: {scanResult.confidence}%
                </Text>

                {scanResult.type === "venomous" && (
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                      ⚠️ Warning: Keep a safe distance. This snake is venomous!
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.viewDetailsBtn}
                  onPress={() => router.back()}
                >
                  <Text style={styles.viewDetailsBtnText}>View Details</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {!scanResult && !isScanning && (
            <View
              style={[styles.controls, { paddingBottom: insets.bottom + 20 }]}
            >
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={handleUpload}
              >
                <View style={styles.controlCircleSmall}>
                  <ImageIcon size={22} color="#fff" />
                </View>
                <Text style={styles.controlLabel}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlBtn}
                onPress={handleCapture}
              >
                <View style={styles.captureBtn}>
                  <Camera size={28} color="#fff" />
                </View>
                <Text style={[styles.controlLabel, { fontWeight: "bold" }]}>
                  Capture
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlBtn}>
                <View style={styles.controlCircleSmall}>
                  <Zap size={22} color="#fff" />
                </View>
                <Text style={styles.controlLabel}>Flash</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  // Fix: Added missing 'content' style
  content: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentLayer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  placeholderContainer: {
    alignItems: "center",
    marginBottom: 200,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(5, 150, 105, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  instructionSub: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    maxWidth: 280,
  },
  scanFrameContainer: {
    position: "absolute",
    width: 300,
    height: 280,
    marginBottom: 200,
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#34D399",
    borderTopLeftRadius: 20,
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#34D399",
    borderTopRightRadius: 20,
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#34D399",
    borderBottomLeftRadius: 20,
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#34D399",
    borderBottomRightRadius: 20,
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  controlBtn: { alignItems: "center" },
  controlCircleSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#059669",
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  controlLabel: { color: "#fff", fontSize: 12 },
  resultContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  resultIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  resultEmoji: { fontSize: 50 },
  resultName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: { fontSize: 14, fontWeight: "600" },
  confidenceText: { color: "#9CA3AF", marginBottom: 24 },
  warningBox: {
    backgroundColor: "rgba(220, 38, 38, 0.2)",
    borderColor: "rgba(220, 38, 38, 0.4)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    width: "100%",
  },
  warningText: { color: "#FCA5A5", textAlign: "center", fontSize: 13 },
  viewDetailsBtn: {
    backgroundColor: "#059669",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  viewDetailsBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionText: { color: "#fff", marginBottom: 20, textAlign: "center" },
  permissionBtn: {
    backgroundColor: "#059669",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  permissionBtnText: { color: "#fff", fontWeight: "bold" },
});
