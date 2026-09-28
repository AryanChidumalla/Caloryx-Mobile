import { colors, typography } from "@/styles/global";
import { formatDateForDisplay, isToday } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type ScreenHeaderProps = {
  title?: string;
  subtitle?: string;
  showGreeting?: boolean;
  displayName?: string;
  selectedDate?: string;
  onGoToToday?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  rightAction?:
    | React.ReactNode
    | {
        label: string;
        icon?: keyof typeof Ionicons.glyphMap;
        onPress: () => void;
      };
};

export function getTimeOfDayGreeting(name?: string): string {
  const hour = new Date().getHours();
  let greeting = "Hello";
  if (hour >= 4 && hour < 12) {
    greeting = "Good morning";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
  } else if (hour >= 17 && hour < 22) {
    greeting = "Good evening";
  } else {
    greeting = "Late evening";
  }

  return name ? `${greeting}, ${name}` : greeting;
}

export default function ScreenHeader({
  title,
  subtitle,
  showGreeting = false,
  displayName,
  selectedDate,
  onGoToToday,
  showBackButton = false,
  onBack,
  rightAction,
}: ScreenHeaderProps) {
  const router = useRouter();
  const isSelectedToday = selectedDate ? isToday(selectedDate) : true;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Row: Back button or Title + Right action */}
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          {showBackButton && (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </TouchableOpacity>
          )}

          {title && (
            <View>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          )}
        </View>

        {React.isValidElement(rightAction) ? (
          rightAction
        ) : rightAction &&
          typeof rightAction === "object" &&
          "label" in rightAction ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={rightAction.onPress}
            accessibilityRole="button"
            accessibilityLabel={rightAction.label}
            activeOpacity={0.7}
          >
            {rightAction.icon && (
              <Ionicons
                name={rightAction.icon}
                size={14}
                color={colors.text}
              />
            )}
            <Text style={styles.actionText}>{rightAction.label}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Greeting & Date Context Bar */}
      {(showGreeting || selectedDate) && (
        <View style={styles.contextBar}>
          <View style={styles.contextLeft}>
            {showGreeting && (
              <Text style={styles.greetingText}>
                {getTimeOfDayGreeting(displayName)}
              </Text>
            )}

            {selectedDate && (
              <Text style={styles.dateText}>
                {formatDateForDisplay(selectedDate)}
              </Text>
            )}
          </View>

          {selectedDate && !isSelectedToday && onGoToToday && (
            <TouchableOpacity
              style={styles.todayBtn}
              onPress={onGoToToday}
              accessibilityRole="button"
              accessibilityLabel="Jump to today"
              activeOpacity={0.75}
            >
              <Ionicons name="today-outline" size={13} color={colors.primary} />
              <Text style={styles.todayBtnText}>Today</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  backBtn: {
    paddingRight: 4,
  },
  title: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.bodySecondary,
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  contextBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 4,
  },
  contextLeft: {
    gap: 2,
  },
  greetingText: {
    ...typography.h2,
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  todayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  todayBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
});
