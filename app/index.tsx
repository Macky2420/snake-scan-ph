import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const STORAGE_KEY = "snakescan_onboarding_done";

const Colors = {
  bgTop: "#064e3b",
  bgBottom: "#0f766e",
  primary: "#10b981",
  primaryDark: "#059669",
  white: "#ffffff",
  textSoft: "rgba(255,255,255,0.82)",
  textMuted: "rgba(255,255,255,0.62)",
  glass: "rgba(255,255,255,0.12)",
  glassStrong: "rgba(255,255,255,0.18)",
  borderSoft: "rgba(255,255,255,0.14)",
  dotInactive: "rgba(255,255,255,0.28)",
};

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

export default function Index() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pagerRef = useRef<PagerView>(null);

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const onboardingDone = await AsyncStorage.getItem(STORAGE_KEY);
      if (onboardingDone === "true") {
        router.replace("/dashboard");
        return;
      }
    } catch (error) {
      console.log("Error checking onboarding status:", error);
    } finally {
      setLoading(false);
    }
  };

  const goNext = async () => {
    if (page < 2) {
      pagerRef.current?.setPage(page + 1);
      return;
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEY, "true");
      router.replace("/dashboard");
    } catch (error) {
      console.log("Error saving onboarding status:", error);
      router.replace("/dashboard");
    }
  };

  const skipOnboarding = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, "true");
      router.replace("/dashboard");
    } catch (error) {
      console.log("Error skipping onboarding:", error);
      router.replace("/dashboard");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={[Colors.bgTop, Colors.bgBottom]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={Colors.white} />
        <Text style={styles.loadingText}>Loading SnakeScan.Ph...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.bgTop, Colors.bgBottom]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />

      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <TouchableOpacity onPress={skipOnboarding} activeOpacity={0.8}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {/* Screen 1 */}
        <View key="1" style={styles.page}>
          <View style={styles.pageInner}>
            <MinimalSnakeLogo />

            <View style={styles.badge}>
              <Sparkles size={14} color={Colors.white} />
              <Text style={styles.badgeText}>Philippine Snake Identifier</Text>
            </View>

            <Text style={styles.title}>SnakeScan.Ph</Text>
            <Text style={styles.subtitle}>
              Scan and identify selected snake species in the Philippines using
              a clean, guided mobile experience.
            </Text>

            <View style={styles.featureGrid}>
              <FeaturePill label="Fast Scan" />
              <FeaturePill label="Offline Ready" />
              <FeaturePill label="Safety Info" />
              <FeaturePill label="Research Based" />
            </View>

            <View style={styles.heroCard}>
              <Text style={styles.heroCardTitle}>What this app does</Text>
              <Text style={styles.heroCardText}>
                It classifies only the snake species included in the trained
                model. It is not a universal snake detector.
              </Text>
            </View>
          </View>
        </View>

        {/* Screen 2 */}
        <View key="2" style={styles.page}>
          <View style={styles.pageInner}>
            <View style={styles.iconCircle}>
              <ShieldCheck size={34} color={Colors.white} />
            </View>

            <Text style={styles.title}>17 Detectable Snakes Only</Text>
            <Text style={styles.subtitle}>
              The model is limited. Anything outside this trained set should not
              be treated as a valid species prediction.
            </Text>

            <View style={styles.listCard}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              >
                <View style={styles.snakeGrid}>
                  {detectableSnakes.map((snake, index) => (
                    <View key={`${snake}-${index}`} style={styles.snakeChip}>
                      <View style={styles.snakeBullet} />
                      <Text style={styles.snakeName}>{snake}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>

        {/* Screen 3 */}
        <View key="3" style={styles.page}>
          <View style={styles.pageInner}>
            <View style={styles.iconCircle}>
              <CheckCircle2 size={34} color={Colors.white} />
            </View>

            <Text style={styles.title}>Research Information</Text>
            <Text style={styles.subtitle}>
              This application is based on your academic study and trained
              dataset scope.
            </Text>

            <View style={styles.researchCard}>
              <Text style={styles.sectionLabel}>RESEARCH TITLE</Text>
              <Text style={styles.researchTitle}>
                EfficientNet-Lite Based Image Classification of Venomous and
                Non-venomous Snakes Species in the Philippines
              </Text>

              <View style={styles.divider} />

              <Text style={styles.sectionLabel}>AUTHORS</Text>
              <Text style={styles.researchText}>
                Cejie M. Hernandez{"\n"}
                Daryl G. Andrada{"\n"}
                Ciara May Antoinette M. Jackson{"\n"}
                Milcah Joy P. Lopez{"\n"}
                Denver Memoriado
              </Text>
            </View>
          </View>
        </View>
      </PagerView>

      <View
        style={[
          styles.bottomSection,
          {
            paddingBottom: insets.bottom + 20,
          },
        ]}
      >
        <View style={styles.pagination}>
          {[0, 1, 2].map((dot) => (
            <View
              key={dot}
              style={[
                styles.dot,
                page === dot ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={goNext}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>
            {page === 2 ? "Get Started" : "Next"}
          </Text>
          <ArrowRight size={20} color={Colors.primaryDark} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

function MinimalSnakeLogo() {
  return (
    <View style={styles.logoWrap}>
      <View style={styles.logoOuter}>
        <View style={styles.logoInner}>
          <View style={styles.snakeBodyLarge} />
          <View style={styles.snakeBodySmall} />
          <View style={styles.snakeHead} />
          <View style={styles.snakeEye} />
        </View>
      </View>
    </View>
  );
}

function FeaturePill({ label }: { label: string }) {
  return (
    <View style={styles.featurePill}>
      <Text style={styles.featurePillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.bgTop,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 16,
    color: Colors.white,
    fontWeight: "600",
  },
  topBar: {
    paddingHorizontal: 20,
    alignItems: "flex-end",
  },
  skipText: {
    color: Colors.textSoft,
    fontSize: 15,
    fontWeight: "600",
  },
  pager: {
    flex: 1,
  },
  page: {
    width,
    flex: 1,
    paddingHorizontal: 24,
  },
  pageInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  logoWrap: {
    marginBottom: 18,
  },
  logoOuter: {
    width: 118,
    height: 118,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.10)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  logoInner: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  snakeBodyLarge: {
    position: "absolute",
    width: 42,
    height: 42,
    borderWidth: 6,
    borderColor: Colors.primaryDark,
    borderRadius: 24,
    borderRightColor: "transparent",
    transform: [{ rotate: "22deg" }],
    left: 17,
    top: 22,
  },
  snakeBodySmall: {
    position: "absolute",
    width: 24,
    height: 24,
    borderWidth: 5,
    borderColor: Colors.primaryDark,
    borderRadius: 16,
    borderLeftColor: "transparent",
    transform: [{ rotate: "-28deg" }],
    right: 15,
    top: 18,
  },
  snakeHead: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primaryDark,
    right: 20,
    top: 20,
  },
  snakeEye: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.white,
    right: 25,
    top: 25,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 16,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  iconCircle: {
    width: 74,
    height: 74,
    borderRadius: 24,
    backgroundColor: Colors.glassStrong,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: Colors.white,
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSoft,
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 20,
    maxWidth: 330,
  },

  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 22,
  },
  featurePill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  featurePillText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "600",
  },

  heroCard: {
    width: "100%",
    backgroundColor: Colors.glass,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  heroCardTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  heroCardText: {
    color: Colors.textSoft,
    fontSize: 14,
    lineHeight: 22,
  },

  listCard: {
    width: "100%",
    height: 390,
    backgroundColor: Colors.glass,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  listContent: {
    paddingBottom: 12,
  },
  snakeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  snakeChip: {
    width: "48.5%",
    minHeight: 60,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  snakeBullet: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 8,
  },
  snakeName: {
    flex: 1,
    color: Colors.white,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "600",
  },

  researchCard: {
    width: "100%",
    backgroundColor: Colors.glass,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  researchTitle: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 28,
    color: Colors.white,
  },
  researchText: {
    fontSize: 15,
    lineHeight: 25,
    color: Colors.textSoft,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
    marginVertical: 18,
  },

  bottomSection: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  dot: {
    height: 10,
    borderRadius: 999,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 26,
    backgroundColor: Colors.white,
  },
  inactiveDot: {
    width: 10,
    backgroundColor: Colors.dotInactive,
  },
  button: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.primaryDark,
    marginRight: 8,
  },
});
